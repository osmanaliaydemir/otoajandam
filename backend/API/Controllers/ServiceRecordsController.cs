using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ServiceRecordsController : ControllerBase
{
    private readonly IServiceRecordService _serviceRecordService;

    public ServiceRecordsController(IServiceRecordService serviceRecordService)
    {
        _serviceRecordService = serviceRecordService;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var record = await _serviceRecordService.GetByIdAsync(id, cancellationToken);
        if (record == null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("Servis kaydı bulunamadı.", 404));
        }
        return Ok(ApiResponse<ServiceRecordDto>.SuccessResponse(record, "Kayıt başarıyla getirildi."));
    }

    [HttpGet("vehicle/{vehicleId:guid}")]
    public async Task<IActionResult> GetAllByVehicleId(Guid vehicleId, CancellationToken cancellationToken)
    {
        var records = await _serviceRecordService.GetAllByVehicleIdAsync(vehicleId, cancellationToken);
        return Ok(ApiResponse<List<ServiceRecordDto>>.SuccessResponse(records, "Araca ait servis geçmişi başarıyla getirildi."));
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveRecords(CancellationToken cancellationToken)
    {
        var records = await _serviceRecordService.GetActiveRecordsAsync(cancellationToken);
        return Ok(ApiResponse<List<ServiceRecordDto>>.SuccessResponse(records, "Açık servis kayıtları başarıyla getirildi."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateServiceRecordDto createDto, CancellationToken cancellationToken)
    {
        try
        {
            var record = await _serviceRecordService.CreateAsync(createDto, cancellationToken);
            return StatusCode(201, ApiResponse<ServiceRecordDto>.SuccessResponse(record, "Yeni servis fişi açıldı.", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [HttpPatch("status")]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateServiceRecordStatusDto updateDto, CancellationToken cancellationToken)
    {
        try
        {
            var record = await _serviceRecordService.UpdateStatusAsync(updateDto, cancellationToken);
            return Ok(ApiResponse<ServiceRecordDto>.SuccessResponse(record, "Kayıt durumu başarıyla güncellendi."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var success = await _serviceRecordService.DeleteAsync(id, cancellationToken);
        if (!success)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("Silinecek kayıt bulunamadı.", 404));
        }
        
        return Ok(ApiResponse<object>.SuccessResponse("Kayıt başarıyla silindi."));
    }

    // --- KALEM/OPERASYON endpointleri ---

    [HttpPost("operation")]
    public async Task<IActionResult> AddOperation([FromBody] CreateServiceOperationDto operationDto, CancellationToken cancellationToken)
    {
        try
        {
            var operation = await _serviceRecordService.AddOperationAsync(operationDto, cancellationToken);
            return StatusCode(201, ApiResponse<ServiceOperationDto>.SuccessResponse(operation, "İşlem servise kaydedildi.", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [HttpDelete("operation/{operationId:guid}")]
    public async Task<IActionResult> RemoveOperation(Guid operationId, CancellationToken cancellationToken)
    {
        var success = await _serviceRecordService.RemoveOperationAsync(operationId, cancellationToken);
        if (!success)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("Silinecek işlem kalemi bulunamadı.", 404));
        }
        
        return Ok(ApiResponse<object>.SuccessResponse("İşlem başarıyla silindi."));
    }

    [HttpGet("staff")]
    public async Task<IActionResult> GetStaffMembers(CancellationToken cancellationToken)
    {
        var staff = await _serviceRecordService.GetStaffMembersAsync(cancellationToken);
        return Ok(ApiResponse<List<StaffMemberDto>>.SuccessResponse(staff, "Personel listesi başarıyla getirildi."));
    }
}
