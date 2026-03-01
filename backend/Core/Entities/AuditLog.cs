using Core.Common;

namespace Core.Entities;

public class AuditLog : IMustHaveTenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty; // Create, Update, Delete, Delete (Soft)
    public string OldValues { get; set; } = string.Empty; // Json Data
    public string NewValues { get; set; } = string.Empty; // Json Data
    public string ChangedByUserId { get; set; } = string.Empty;
    public DateTime ChangedDate { get; set; } = DateTime.UtcNow;
}
