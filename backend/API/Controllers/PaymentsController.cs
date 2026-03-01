using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet("record/{serviceRecordId:guid}")]
    public async Task<IActionResult> GetByRecord(Guid serviceRecordId, CancellationToken cancellationToken)
    {
        var payments = await _paymentService.GetByRecordIdAsync(serviceRecordId, cancellationToken);
        return Ok(ApiResponse<List<PaymentDto>>.SuccessResponse(payments));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePaymentDto createDto, CancellationToken cancellationToken)
    {
        var payment = await _paymentService.CreateAsync(createDto, cancellationToken);
        return Ok(ApiResponse<PaymentDto>.SuccessResponse(payment, "Ödeme başarıyla kaydedildi."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var success = await _paymentService.DeleteAsync(id, cancellationToken);
        if (!success) return NotFound(ApiResponse<object>.ErrorResponse("Ödeme kaydı bulunamadı."));
        return Ok(ApiResponse<object>.SuccessResponse(null, "Ödeme kaydı silindi."));
    }
}
