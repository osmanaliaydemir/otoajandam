using Application.DTOs;
using Core.Common;

namespace Application.Interfaces;

public interface ICustomerService
{
    Task<Result<List<CustomerDto>>> GetAllAsync();
    Task<Result<CustomerDetailDto>> GetByIdAsync(Guid id);
    Task<Result<Guid>> CreateAsync(CreateCustomerDto dto);
    Task<Result<bool>> UpdateAsync(Guid id, CreateCustomerDto dto);
    Task<Result<bool>> DeleteAsync(Guid id);
}
