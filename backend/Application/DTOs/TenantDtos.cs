using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class RegisterTenantRequestDto
{
    public string TenantName { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    public string PackageType { get; set; } = string.Empty;

    public string AdminFirstName { get; set; } = string.Empty;
    public string AdminLastName { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
}

public class RegisterTenantResponseDto
{
    public Guid TenantId { get; set; }
    public string Message { get; set; } = string.Empty;
}
