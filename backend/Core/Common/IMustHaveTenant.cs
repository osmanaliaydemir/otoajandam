namespace Core.Common;

public interface IMustHaveTenant
{
    Guid TenantId { get; set; }
}
