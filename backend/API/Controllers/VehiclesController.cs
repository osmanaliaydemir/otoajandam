using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var vehicles = await _vehicleService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<List<VehicleDto>>.SuccessResponse(vehicles, "Araç listesi başarıyla getirildi."));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleService.GetByIdAsync(id, cancellationToken);
        if (vehicle == null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("Araç bulunamadı.", 404));
        }
        return Ok(ApiResponse<VehicleDto>.SuccessResponse(vehicle, "Araç başarıyla getirildi."));
    }

    [HttpGet("plate/{plateNumber}")]
    public async Task<IActionResult> GetByPlate(string plateNumber, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleService.GetByPlateNumberAsync(plateNumber, cancellationToken);
        if (vehicle == null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("Araç bulunamadı.", 404));
        }
        return Ok(ApiResponse<VehicleDto>.SuccessResponse(vehicle, "Araç başarıyla getirildi."));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Arama terimi boş olamaz."));
        }

        var vehicles = await _vehicleService.SearchAsync(query, cancellationToken);
        return Ok(ApiResponse<List<VehicleDto>>.SuccessResponse(vehicles, "Arama sonuçları başarıyla getirildi."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVehicleDto createDto, CancellationToken cancellationToken)
    {
        try
        {
            var vehicle = await _vehicleService.CreateAsync(createDto, cancellationToken);
            return StatusCode(201, ApiResponse<VehicleDto>.SuccessResponse(vehicle, "Araç başarıyla oluşturuldu.", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVehicleDto updateDto, CancellationToken cancellationToken)
    {
        if (id != updateDto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("URL ID ile gövde ID uyuşmuyor."));
        }

        try
        {
            var vehicle = await _vehicleService.UpdateAsync(updateDto, cancellationToken);
            return Ok(ApiResponse<VehicleDto>.SuccessResponse(vehicle, "Araç başarıyla güncellendi."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var success = await _vehicleService.DeleteAsync(id, cancellationToken);
        if (!success)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("Silinecek araç bulunamadı.", 404));
        }
        
        return Ok(ApiResponse<object>.SuccessResponse("Araç başarıyla silindi."));
    }
}
