using Application.DTOs;

namespace Application.Interfaces;

public interface ITenantRegistrationService
{
    Task<RegisterTenantResponseDto> RegisterTenantAsync(RegisterTenantRequestDto request);
}
