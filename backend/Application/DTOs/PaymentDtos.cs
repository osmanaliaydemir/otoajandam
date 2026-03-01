using Core.Entities;

namespace Application.DTOs;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid ServiceRecordId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public string MethodName => Method switch
    {
        PaymentMethod.Cash => "Nakit",
        PaymentMethod.CreditCard => "Kredi Kartı",
        PaymentMethod.BankTransfer => "Havale/EFT",
        _ => "Diğer"
    };
    public DateTime PaidAt { get; set; }
    public string? Notes { get; set; }
}

public class CreatePaymentDto
{
    public Guid ServiceRecordId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public string? Notes { get; set; }
}
