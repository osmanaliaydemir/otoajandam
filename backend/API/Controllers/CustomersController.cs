using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _customerService.GetAllAsync();
        return result.IsSuccess 
            ? Ok(ApiResponse<List<CustomerDto>>.SuccessResponse(result.Value!, "Müşteri listesi başarıyla getirildi.")) 
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Error ?? "Hata oluştu"));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _customerService.GetByIdAsync(id);
        return result.IsSuccess 
            ? Ok(ApiResponse<CustomerDetailDto>.SuccessResponse(result.Value!, "Müşteri detayları başarıyla getirildi.")) 
            : NotFound(ApiResponse<object>.ErrorResponse(result.Error ?? "Müşteri bulunamadı.", 404));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        var result = await _customerService.CreateAsync(dto);
        return result.IsSuccess 
            ? Ok(ApiResponse<Guid>.SuccessResponse(result.Value, "Müşteri başarıyla oluşturuldu.")) 
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Error ?? "Müşteri oluşturulurken hata oluştu."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, CreateCustomerDto dto)
    {
        var result = await _customerService.UpdateAsync(id, dto);
        return result.IsSuccess 
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Müşteri başarıyla güncellendi.")) 
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Error ?? "Müşteri güncellenirken hata oluştu."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _customerService.DeleteAsync(id);
        return result.IsSuccess 
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Müşteri başarıyla silindi.")) 
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Error ?? "Müşteri silinirken hata oluştu."));
    }
}
