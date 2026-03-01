using Application.DTOs;
using Application.Interfaces;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;

    public ProductService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .AsNoTracking()
            .Select(p => MapToDto(p))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        return product != null ? MapToDto(product) : null;
    }

    public async Task<List<ProductDto>> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<ProductDto>();

        var lowercaseQuery = query.ToLower();
        return await _context.Products
            .AsNoTracking()
            .Where(p => p.Name.ToLower().Contains(lowercaseQuery) || (p.Code != null && p.Code.ToLower().Contains(lowercaseQuery)))
            .Take(10)
            .Select(p => MapToDto(p))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto createDto, CancellationToken cancellationToken = default)
    {
        var product = new Product
        {
            Name = createDto.Name,
            Code = createDto.Code,
            Price = createDto.Price,
            StockQuantity = createDto.StockQuantity,
            Type = createDto.Type
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(product);
    }

    public async Task<ProductDto> UpdateAsync(UpdateProductDto updateDto, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(new object[] { updateDto.Id }, cancellationToken);
        if (product == null) throw new Exception("Ürün bulunamadı.");

        product.Name = updateDto.Name;
        product.Code = updateDto.Code;
        product.Price = updateDto.Price;
        product.StockQuantity = updateDto.StockQuantity;
        product.Type = updateDto.Type;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(product);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Code = p.Code,
        Price = p.Price,
        StockQuantity = p.StockQuantity,
        Type = p.Type
    };
}
