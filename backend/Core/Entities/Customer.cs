using Core.Common;

namespace Core.Entities;

public class Customer : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    
    // İlişkiler
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
