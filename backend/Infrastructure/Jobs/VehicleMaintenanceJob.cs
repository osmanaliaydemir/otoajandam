using Application.Interfaces;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;

namespace Infrastructure.Jobs;

// Hangfire tarafindan cagrilacak Recurring Job
public class VehicleMaintenanceJob
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public VehicleMaintenanceJob(ApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task CheckMaintenanceAndSendEmailAsync()
    {
        // Örn: Son servisin üzerinden 1 yıl (365 gün) geçmişse 
        // veya aracın kilometresi NextServiceKilometer'a 1000 km kadar yaklaşmışsa (veya geçmişse)
        
        var maintenanceThresholdDate = DateTime.UtcNow.AddYears(-1);
        
        // Tenant filtrelemesini devre dışı bıraktık çünkü bu job arkaplanda çalışacak ve aktif bir tenantId'si (HttpContext) yok.
        // Tüm tenantlardaki bakım vakti gelen araçları bulup her bir tenant'ın yetkilisine toplu mail atılabilir.
        
        var vehiclesNeedingMaintenance = await _context.Vehicles
            .IgnoreQueryFilters()
            .Where(v => v.IsDeleted == false && 
                   (
                       (v.LastServiceDate.HasValue && v.LastServiceDate.Value < maintenanceThresholdDate) 
                       || 
                       (v.NextServiceKilometer.HasValue && v.Kilometer >= (v.NextServiceKilometer.Value - 1000))
                   ))
            .ToListAsync();

        foreach (var vehicle in vehiclesNeedingMaintenance)
        {
            var message = $"Sayın yetkili/müşteri, {vehicle.PlateNumber} plakalı aracınızın bakım tarihi/kilometresi yaklaşmıştır veya geçmiştir.";
            
            // Eğer Vehicle entity'sinde CustomerEmail olsaydı oraya atılırdı.
            var targetEmail = $"admin_of_tenant_{vehicle.TenantId}@example.com"; 

            await _emailService.SendEmailAsync(targetEmail, "Araç Bakım Hatırlatması", message);
        }
    }
}
