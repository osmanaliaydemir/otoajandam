using Core.Common;

namespace Core.Entities;

public class ServiceOperation : BaseEntity, IMustHaveTenant
{
    // TenantId zorunlu tutarak global filtrelemelerden kolayca faydalanabiliriz.
    public Guid TenantId { get; set; }

    public Guid ServiceRecordId { get; set; }
    public ServiceRecord ServiceRecord { get; set; } = default!;

    // İşlemi yapan personelin (Usta) ID'si. (IdentityUser tablomuza Foreign Key)
    public string UserId { get; set; } = string.Empty;

    public string OperationDescription { get; set; } = string.Empty;
    public decimal LaborPrice { get; set; }

    // Gerekirse kullanılan yedek parça ilişkileri eklenebilir.
}
