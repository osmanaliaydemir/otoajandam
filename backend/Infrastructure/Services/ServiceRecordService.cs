using Application.DTOs;
using Application.Interfaces;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ServiceRecordService : IServiceRecordService
{
    private readonly ApplicationDbContext _context;

    public ServiceRecordService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceRecordDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var record = await _context.ServiceRecords
            .Include(r => r.Vehicle)
            .Include(r => r.Operations)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (record == null) return null;

        return await MapToDtoAsync(record, cancellationToken);
    }

    public async Task<List<ServiceRecordDto>> GetAllByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var records = await _context.ServiceRecords
            .Include(r => r.Operations)
            .Where(r => r.VehicleId == vehicleId)
            .OrderByDescending(r => r.ArrivalDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var dtoList = new List<ServiceRecordDto>();
        foreach (var record in records)
        {
            dtoList.Add(await MapToDtoAsync(record, cancellationToken));
        }

        return dtoList;
    }

    public async Task<List<ServiceRecordDto>> GetActiveRecordsAsync(CancellationToken cancellationToken = default)
    {
        var records = await _context.ServiceRecords
            .Include(r => r.Vehicle)
            .Include(r => r.Operations)
            .Where(r => r.Status == "Bekliyor" || r.Status == "İşlemde")
            .OrderByDescending(r => r.ArrivalDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var dtoList = new List<ServiceRecordDto>();
        foreach (var record in records)
        {
            dtoList.Add(await MapToDtoAsync(record, cancellationToken));
        }

        return dtoList;
    }

    public async Task<ServiceRecordDto> CreateAsync(CreateServiceRecordDto createDto, CancellationToken cancellationToken = default)
    {
        // Aracın varlığını kontrol et
        var vehicleExists = await _context.Vehicles.AnyAsync(v => v.Id == createDto.VehicleId, cancellationToken);
        if (!vehicleExists)
            throw new Exception("İşlem açılmak istenen araç bulunamadı.");

        var record = new ServiceRecord
        {
            VehicleId = createDto.VehicleId,
            Notes = createDto.Notes,
            Status = "Bekliyor",
            ArrivalDate = DateTime.UtcNow
        };

        await _context.ServiceRecords.AddAsync(record, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Yeni oluşturulan kaydın dto'sunu dönelim (Araç bilgisini de yükleyerek)
        return await GetByIdAsync(record.Id, cancellationToken) 
               ?? throw new Exception("Kayıt oluşturuldu fakat getirilemedi.");
    }

    public async Task<ServiceRecordDto> UpdateStatusAsync(UpdateServiceRecordStatusDto updateDto, CancellationToken cancellationToken = default)
    {
        var record = await _context.ServiceRecords.FirstOrDefaultAsync(r => r.Id == updateDto.Id, cancellationToken);
        if (record == null)
            throw new Exception("Fatura/Servis fişi bulunamadı.");

        record.Status = updateDto.Status;
        record.Notes = updateDto.Notes;
        
        if (updateDto.DeliveryDate.HasValue)
        {
            record.DeliveryDate = updateDto.DeliveryDate.Value;
        }
        else if (updateDto.Status == "Tamamlandı" && !record.DeliveryDate.HasValue)
        {
             // Eğer dışarıdan girilmemişse ve statü kapalıya çekilmişse o anı baz al
            record.DeliveryDate = DateTime.UtcNow;
        }

        _context.ServiceRecords.Update(record);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(record.Id, cancellationToken)
               ?? throw new Exception("Kayıt güncellendi fakat getirilemedi.");
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var record = await _context.ServiceRecords.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (record == null) return false;

        _context.ServiceRecords.Remove(record);
        await _context.SaveChangesAsync(cancellationToken);
        
        return true;
    }

    public async Task<ServiceOperationDto> AddOperationAsync(CreateServiceOperationDto operationDto, CancellationToken cancellationToken = default)
    {
        // Ciro, fiyat eksi değer olamaz
        if (operationDto.LaborPrice < 0)
            throw new Exception("İşlem fiyatı sıfırdan küçük olamaz.");

        var recordExists = await _context.ServiceRecords.AnyAsync(r => r.Id == operationDto.ServiceRecordId, cancellationToken);
        if (!recordExists)
            throw new Exception("İşlem eklenmek istenen servis kaydı bulunamadı.");

        // Kullanıcı yetki/geçerlilik kontrolü (opsiyonel ancak tavsiye edilen bir güvenlik katmanı)
        if (!string.IsNullOrWhiteSpace(operationDto.UserId))
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == operationDto.UserId, cancellationToken);
            if (!userExists)
                throw new Exception("Atanmak istenen personel sistemi bulunamadı.");
        }

        var operation = new ServiceOperation
        {
            ServiceRecordId = operationDto.ServiceRecordId,
            UserId = operationDto.UserId,
            OperationDescription = operationDto.OperationDescription,
            LaborPrice = operationDto.LaborPrice
        };

        await _context.ServiceOperations.AddAsync(operation, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Kullanıcı adını Identity tablosundan oku
        string assignedUserName = string.Empty;
        if (!string.IsNullOrWhiteSpace(operation.UserId))
        {
             var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == operation.UserId, cancellationToken);
             if (user != null) assignedUserName = $"{user.FirstName} {user.LastName}";
        }

        return new ServiceOperationDto
        {
            Id = operation.Id,
            ServiceRecordId = operation.ServiceRecordId,
            UserId = operation.UserId,
            AssignedUserName = assignedUserName,
            OperationDescription = operation.OperationDescription,
            LaborPrice = operation.LaborPrice,
            CreatedAt = operation.CreatedAt
        };
    }

    public async Task<bool> RemoveOperationAsync(Guid operationId, CancellationToken cancellationToken = default)
    {
        var operation = await _context.ServiceOperations.FirstOrDefaultAsync(o => o.Id == operationId, cancellationToken);
        if (operation == null) return false;

        _context.ServiceOperations.Remove(operation);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<List<StaffMemberDto>> GetStaffMembersAsync(CancellationToken cancellationToken = default)
    {
        // Mevcut TenantId'yi al
        var tenantId = _context.CurrentTenantId;

        var users = await _context.Users
            .AsNoTracking()
            .Where(u => u.TenantId == tenantId)
            .OrderBy(u => u.FirstName)
            .Select(u => new StaffMemberDto
            {
                Id = u.Id,
                FullName = $"{u.FirstName} {u.LastName}"
            })
            .ToListAsync(cancellationToken);

        return users;
    }

    private async Task<ServiceRecordDto> MapToDtoAsync(ServiceRecord record, CancellationToken cancellationToken)
    {
        var dto = new ServiceRecordDto
        {
            Id = record.Id,
            VehicleId = record.VehicleId,
            ArrivalDate = record.ArrivalDate,
            DeliveryDate = record.DeliveryDate,
            Status = record.Status,
            Notes = record.Notes,
            Vehicle = record.Vehicle != null ? new VehicleDto
            {
                Id = record.Vehicle.Id,
                PlateNumber = record.Vehicle.PlateNumber,
                Brand = record.Vehicle.Brand,
                Model = record.Vehicle.Model,
                Year = record.Vehicle.Year,
                Kilometer = record.Vehicle.Kilometer,
                CustomerPhone = record.Vehicle.CustomerPhone,
            } : null
        };

        if (record.Operations != null && record.Operations.Any())
        {
            // İlgili personellerin adlarını topluca çekip hafızada (dictionary ile) eşleştiriyoruz
            var userIds = record.Operations.Where(o => !string.IsNullOrEmpty(o.UserId)).Select(o => o.UserId).Distinct().ToList();
            var usersDict = new Dictionary<string, string>();
            
            if (userIds.Any())
            {
                usersDict = await _context.Users
                    .AsNoTracking()
                    .Where(u => userIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}", cancellationToken);
            }

            dto.Operations = record.Operations.Select(o => new ServiceOperationDto
            {
                Id = o.Id,
                ServiceRecordId = o.ServiceRecordId,
                UserId = o.UserId,
                AssignedUserName = usersDict.TryGetValue(o.UserId, out var name) ? name : "Bilinmeyen Personel",
                OperationDescription = o.OperationDescription,
                LaborPrice = o.LaborPrice,
                CreatedAt = o.CreatedAt
            }).ToList();
        }

        return dto;
    }
}
