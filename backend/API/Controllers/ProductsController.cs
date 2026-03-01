using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var products = await _productService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<List<ProductDto>>.SuccessResponse(products, "Ürün listesi getirildi."));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        if (product == null) return NotFound(ApiResponse<object>.ErrorResponse("Ürün bulunamadı.", 404));
        return Ok(ApiResponse<ProductDto>.SuccessResponse(product));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, CancellationToken cancellationToken)
    {
        var products = await _productService.SearchAsync(query, cancellationToken);
        return Ok(ApiResponse<List<ProductDto>>.SuccessResponse(products));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDto createDto, CancellationToken cancellationToken)
    {
        var product = await _productService.CreateAsync(createDto, cancellationToken);
        return Ok(ApiResponse<ProductDto>.SuccessResponse(product, "Ürün başarıyla oluşturuldu."));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProductDto updateDto, CancellationToken cancellationToken)
    {
        var product = await _productService.UpdateAsync(updateDto, cancellationToken);
        return Ok(ApiResponse<ProductDto>.SuccessResponse(product, "Ürün başarıyla güncellendi."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var success = await _productService.DeleteAsync(id, cancellationToken);
        if (!success) return NotFound(ApiResponse<object>.ErrorResponse("Silinecek ürün bulunamadı."));
        return Ok(ApiResponse<object>.SuccessResponse(null, "Ürün silindi."));
    }
}
