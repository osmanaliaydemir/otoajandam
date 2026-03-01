using Core.Common;

namespace Core.Entities;

public class Payment : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Guid ServiceRecordId { get; set; }
    public ServiceRecord ServiceRecord { get; set; } = default!;

    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}

public enum PaymentMethod
{
    Cash = 1,          // Nakit
    CreditCard = 2,    // Kredi Kartı
    BankTransfer = 3,  // Havale/EFT
    Other = 4          // Diğer
}
