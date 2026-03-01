using Core.Common;

namespace Core.Entities;

public class ServiceRecord : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }

    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = default!;

    public DateTime ArrivalDate { get; set; } = DateTime.UtcNow;
    public DateTime? DeliveryDate { get; set; }
    
    public string Status { get; set; } = "Bekliyor"; // Örn: Bekliyor, İşlemde, Tamamlandı
    public string Notes { get; set; } = string.Empty;

    // Bir servis kaydına birden fazla işlem (ServiceOperation) eklenebilir.
    public ICollection<ServiceOperation> Operations { get; set; } = new List<ServiceOperation>();
    
    // Yapılan ödemeler
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
