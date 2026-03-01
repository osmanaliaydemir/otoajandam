using Core.Common;

namespace Core.Entities;

public class Product : BaseEntity, IMustHaveTenant
{
    public string Name { get; set; } = default!;
    public string? Code { get; set; } // Stok Kodu / Barkod
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public ProductType Type { get; set; } = ProductType.Part;
    public Guid TenantId { get; set; }
}

public enum ProductType
{
    Part = 1,    // Yedek Parça
    Service = 2  // Hizmet / İşçilik
}
