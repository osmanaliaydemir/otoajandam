using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // En azından login olan herkes dashboard görebilsin (Tenant izolesi var zaten)
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken cancellationToken)
    {
        var metrics = await _dashboardService.GetDashboardMetricsAsync(cancellationToken);
        return Ok(Application.DTOs.ApiResponse<Application.DTOs.DashboardMetricsDto>.SuccessResponse(metrics, "Dashboard verileri başarıyla getirildi."));
    }

    [HttpGet("revenue-chart")]
    public async Task<IActionResult> GetMonthlyRevenue([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken cancellationToken)
    {
        if (startDate == default || endDate == default)
        {
            // İsterseniz FluentValidation üzerinden Query Validator da oluşturulabilir, basitlik adına buraya ekleniyor.
            return BadRequest(Application.DTOs.ApiResponse<object>.ErrorResponse("Başlangıç ve bitiş tarihleri geçerli olmalıdır."));
        }

        if (startDate > endDate)
        {
            return BadRequest(Application.DTOs.ApiResponse<object>.ErrorResponse("Başlangıç tarihi bitiş tarihinden büyük olamaz."));
        }

        var result = await _dashboardService.GetMonthlyRevenueAsync(startDate, endDate, cancellationToken);
        return Ok(Application.DTOs.ApiResponse<List<Application.DTOs.MonthlyRevenueDto>>.SuccessResponse(result, "Aylık ciro raporu başarıyla getirildi."));
    }

    [HttpGet("staff-performance")]
    public async Task<IActionResult> GetStaffPerformance([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken cancellationToken)
    {
        if (startDate == default || endDate == default)
        {
            return BadRequest(Application.DTOs.ApiResponse<object>.ErrorResponse("Başlangıç ve bitiş tarihleri geçerli olmalıdır."));
        }

        if (startDate > endDate)
        {
            return BadRequest(Application.DTOs.ApiResponse<object>.ErrorResponse("Başlangıç tarihi bitiş tarihinden büyük olamaz."));
        }

        var result = await _dashboardService.GetStaffPerformanceAsync(startDate, endDate, cancellationToken);
        return Ok(Application.DTOs.ApiResponse<List<Application.DTOs.StaffPerformanceDto>>.SuccessResponse(result, "Personel performans raporu başarıyla getirildi."));
    }
}
