using Application.DTOs;

namespace Application.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ProductDto>> SearchAsync(string query, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductDto createDto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateAsync(UpdateProductDto updateDto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
