using Application.DTOs;
using Application.Interfaces;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Performans İçin Not:
        // Tüm Query'ler Global Query Filter (TenantId && !IsDeleted) üzerinden ilerliyor.
        // Ciro ve ServisSayısı için tek bir veritabanı turu (Round-trip) yerine paralel asenkron sorgular kullanılabilir veya
        // IQueryable üzerinden group by yapılabilir. Ancak okunabilirlik ve EntityFramework'un SQL çevirimi için 
        // 3 basit, hızlı ve indeksli sorgu atmak genelde en sağlıklı olanıdır.

        // 1. Bu ayki toplam servis sayısı
        var thisMonthServices = await _context.ServiceRecords
            .AsNoTracking()
            .CountAsync(x => x.ArrivalDate >= startOfMonth, cancellationToken);

        // 2. Açık iş sayısı
        var openJobs = await _context.ServiceRecords
            .AsNoTracking()
            .CountAsync(x => x.Status == "Bekliyor" || x.Status == "İşlemde", cancellationToken);

        // 3. Bu ayki toplam ciro (LaborPrice üzerinden)
        var thisMonthRevenue = await _context.ServiceOperations
            .AsNoTracking()
            .Where(x => x.CreatedAt >= startOfMonth)
            .SumAsync(x => x.LaborPrice, cancellationToken);
        // GroupBy işlemi SQL tarafına çevrilecek şekilde IQueryable olarak yazıldı.
        var topStaffData = await _context.ServiceOperations
            .AsNoTracking()
            .GroupBy(x => x.UserId)
            .Select(g => new 
            {
                UserId = g.Key,
                OperationCount = g.Count()
            })
            .OrderByDescending(x => x.OperationCount)
            .FirstOrDefaultAsync(cancellationToken);

        TopStaffDto? topStaff = null;
        if (topStaffData != null)
        {
            // Kullanıcının ismini almak için Identity tablosuna Join yapıyoruz (Sadece en çok atanmış kişiyi çekeceğimiz için bellekte veya ayrı basit sorguda çekilir)
            var user = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == topStaffData.UserId)
                .Select(u => new { u.FirstName, u.LastName })
                .FirstOrDefaultAsync(cancellationToken);

            if (user != null)
            {
                topStaff = new TopStaffDto
                {
                    UserId = topStaffData.UserId,
                    FullName = $"{user.FirstName} {user.LastName}",
                    OperationCount = topStaffData.OperationCount
                };
            }
        }

        return new DashboardMetricsDto
        {
            ThisMonthTotalServices = thisMonthServices,
            OpenJobsCount = openJobs,
            ThisMonthTotalRevenue = thisMonthRevenue,
            TopStaff = topStaff
        };
    }

    public async Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        // Global query filter TenantId bazlı izolasyonu otomatik yapıyor.
        var query = _context.ServiceOperations
            .AsNoTracking()
            .Where(x => x.CreatedAt >= startDate && x.CreatedAt <= endDate);

        // Tarih yılı ve ay'a göre gruplandırma
        var result = await query
            .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
            .Select(g => new MonthlyRevenueDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Revenue = g.Sum(x => x.LaborPrice)
            })
            // En eskinden en yeniye sıralıyoruz (Grafik uyumlu)
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync(cancellationToken);

        return result;
    }

    public async Task<List<StaffPerformanceDto>> GetStaffPerformanceAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        // Önce operasyonları tarihe göre filtreler ve kullancıya göre (UserId) SQL üzerinde gruplar.
        // AsNoTracking() performansı artırır. LINQ Select içindeki metrodların SQL'e hatasız çevrilebilir olduğundan
        // emin olarak sum/count vs alındı.
        
        var groupedData = await _context.ServiceOperations
            .AsNoTracking()
            .Where(x => x.CreatedAt >= startDate && x.CreatedAt <= endDate)
            .GroupBy(x => x.UserId)
            .Select(g => new 
            {
                UserId = g.Key,
                // Distinct, Kaç FARKLI arabaya(servis fişine) dokunduğunu söyler (Performans: SQL COUNT(DISTINCT ServiceRecordId))
                UniqueServiceRecordCount = g.Select(s => s.ServiceRecordId).Distinct().Count(),
                // Toplam yaptığı ufak kalem iş sayısı
                TotalOperationCount = g.Count(),
                // Bu kullanıcının firmaya kazandırdığı toplam işçilik
                TotalLaborRevenue = g.Sum(s => s.LaborPrice)
            })
            // En çok ciro getirenden en aza doğru sıralı
            .OrderByDescending(x => x.TotalLaborRevenue)
            .ToListAsync(cancellationToken);

        if (!groupedData.Any())
            return new List<StaffPerformanceDto>();

        // Kullanıcıların isimlerini kimlik tablosundan(Identity) getirme işlemi.
        // Döngü içinde her seferinde veritabanına SORGU ATMAKTAN (N+1 problemi) kaçınmak için 
        // ID'leri bir kere toplayıp, tek bir sorguyla WHERE IN (Ids) şekline dönüştürdük.
        
        var userIds = groupedData.Select(g => g.UserId).ToList();
        
        var usersDict = await _context.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FirstName, u.LastName })
            .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}", cancellationToken);

        // SQL'den gelen anonim veriyi ve memory'den (Dictionary) gelen isim paketini Dto listesine haritalıyoruz.
        var resultList = new List<StaffPerformanceDto>();

        foreach (var data in groupedData)
        {
            var fullName = usersDict.TryGetValue(data.UserId, out var name) ? name : "Bilinmeyen Personel";
            
            resultList.Add(new StaffPerformanceDto
            {
                UserId = data.UserId,
                FullName = fullName,
                UniqueServiceRecordCount = data.UniqueServiceRecordCount,
                TotalOperationCount = data.TotalOperationCount,
                TotalLaborRevenue = data.TotalLaborRevenue,
                // Sıfıra bölünme hatasını (DivideByZeroException) önlemek için manuel kontrol
                AverageRevenuePerOperation = data.TotalOperationCount > 0 
                     ? Math.Round(data.TotalLaborRevenue / data.TotalOperationCount, 2) 
                     : 0
            });
        }

        return resultList;
    }
}
