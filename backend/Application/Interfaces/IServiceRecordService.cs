using Application.DTOs;

namespace Application.Interfaces;

public interface IServiceRecordService
{
    // Kayıt İşlemleri
    Task<ServiceRecordDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceRecordDto>> GetAllByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<List<ServiceRecordDto>> GetActiveRecordsAsync(CancellationToken cancellationToken = default);
    
    Task<ServiceRecordDto> CreateAsync(CreateServiceRecordDto createDto, CancellationToken cancellationToken = default);
    Task<ServiceRecordDto> UpdateStatusAsync(UpdateServiceRecordStatusDto updateDto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Operasyon (Kalem İşlemleri)
    Task<ServiceOperationDto> AddOperationAsync(CreateServiceOperationDto operationDto, CancellationToken cancellationToken = default);
    Task<bool> RemoveOperationAsync(Guid operationId, CancellationToken cancellationToken = default);

    // Personel Listesi
    Task<List<StaffMemberDto>> GetStaffMembersAsync(CancellationToken cancellationToken = default);
}
