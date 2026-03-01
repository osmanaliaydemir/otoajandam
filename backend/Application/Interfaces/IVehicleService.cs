using Application.DTOs;

namespace Application.Interfaces;

public interface IVehicleService
{
    Task<VehicleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<VehicleDto?> GetByPlateNumberAsync(string plateNumber, CancellationToken cancellationToken = default);
    Task<List<VehicleDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<VehicleDto>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<VehicleDto> CreateAsync(CreateVehicleDto createDto, CancellationToken cancellationToken = default);
    Task<VehicleDto> UpdateAsync(UpdateVehicleDto updateDto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
