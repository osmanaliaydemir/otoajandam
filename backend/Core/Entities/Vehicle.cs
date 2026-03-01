using Core.Common;

namespace Core.Entities;

public class Vehicle : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }

    private string _plateNumber = string.Empty;
    public string PlateNumber
    {
        get => _plateNumber;
        set => _plateNumber = NormalizePlate(value);
    }

    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Kilometer { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    
    // Müşteri İlişkisi
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public int? LastServiceKilometer { get; set; }
    public int? NextServiceKilometer { get; set; }
    public DateTime? LastServiceDate { get; set; }

    // Plaka formatını temizler.
    private static string NormalizePlate(string? plate)
    {
        if (string.IsNullOrWhiteSpace(plate)) return string.Empty;
        
        // Boşlukları sil ve İngilizce/Türkçe karakter büyük harfe çevir.
        // Daha gelişmiş RegEx kontrolü de eklenebilir.
        return plate.Replace(" ", "").ToUpperInvariant();
    }
}
