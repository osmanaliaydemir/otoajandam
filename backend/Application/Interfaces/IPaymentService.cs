using Application.DTOs;

namespace Application.Interfaces;

public interface IPaymentService
{
    Task<List<PaymentDto>> GetByRecordIdAsync(Guid serviceRecordId, CancellationToken cancellationToken = default);
    Task<PaymentDto> CreateAsync(CreatePaymentDto createDto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
