using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TenantsController : ControllerBase
{
    private readonly ITenantRegistrationService _registrationService;

    public TenantsController(ITenantRegistrationService registrationService)
    {
        _registrationService = registrationService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterTenant([FromBody] RegisterTenantRequestDto request)
    {
        // FluentValidation sayesinde hatalar otomatik olarak BadRequest (400) ile dönecek.
        var result = await _registrationService.RegisterTenantAsync(request);
        
        return Ok(ApiResponse<RegisterTenantResponseDto>.SuccessResponse(result, "Firma kaydı başarıyla tamamlandı."));
    }

    // Policy-Based Authorization Örneği
    // Yalnızca Admin rolüne sahip olanlar bu endpoint'i kullanabilir
    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("admin-only")]
    public IActionResult AdminOnlyEndpoint()
    {
        return Ok(ApiResponse<object>.SuccessResponse("Bu metoda sadece Admin rolüne sahip kişiler erişebilir."));
    }

    // Usta ve Admin erişebilir.
    [Authorize(Policy = "RequireUstaRole")]
    [HttpGet("usta-only")]
    public IActionResult UstaOnlyEndpoint()
    {
        return Ok(ApiResponse<object>.SuccessResponse("Bu metoda hem Usta hem Admin erişebilir."));
    }
}
