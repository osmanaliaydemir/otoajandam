using Core.Entities;

namespace Application.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public ProductType Type { get; set; }
    public string TypeName => Type == ProductType.Part ? "Yedek Parça" : "Hizmet";
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public ProductType Type { get; set; }
}

public class UpdateProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public ProductType Type { get; set; }
}
