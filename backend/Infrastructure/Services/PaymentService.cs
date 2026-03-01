using Application.DTOs;
using Application.Interfaces;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;

    public PaymentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PaymentDto>> GetByRecordIdAsync(Guid serviceRecordId, CancellationToken cancellationToken = default)
    {
        return await _context.Payments
            .AsNoTracking()
            .Where(p => p.ServiceRecordId == serviceRecordId)
            .OrderByDescending(p => p.PaidAt)
            .Select(p => MapToDto(p))
            .ToListAsync(cancellationToken);
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentDto createDto, CancellationToken cancellationToken = default)
    {
        var payment = new Payment
        {
            ServiceRecordId = createDto.ServiceRecordId,
            Amount = createDto.Amount,
            Method = createDto.Method,
            Notes = createDto.Notes,
            PaidAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(payment);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var payment = await _context.Payments.FindAsync(new object[] { id }, cancellationToken);
        if (payment == null) return false;

        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static PaymentDto MapToDto(Payment p) => new()
    {
        Id = p.Id,
        ServiceRecordId = p.ServiceRecordId,
        Amount = p.Amount,
        Method = p.Method,
        PaidAt = p.PaidAt,
        Notes = p.Notes
    };
}
