using Application.DTOs;
using Application.Interfaces;
using Core.Common;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly ApplicationDbContext _context;

    public CustomerService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<CustomerDto>>> GetAllAsync()
    {
        var customers = await _context.Customers
            .AsNoTracking()
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Phone = c.Phone,
                Email = c.Email,
                Address = c.Address,
                VehicleCount = c.Vehicles.Count,
                CreatedAt = c.CreatedAt
            })
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Result<List<CustomerDto>>.Success(customers);
    }

    public async Task<Result<CustomerDetailDto>> GetByIdAsync(Guid id)
    {
        var customer = await _context.Customers
            .AsNoTracking()
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null)
            return Result<CustomerDetailDto>.Failure("Müşteri bulunamadı.");

        var dto = new CustomerDetailDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address,
            VehicleCount = customer.Vehicles.Count,
            CreatedAt = customer.CreatedAt,
            Vehicles = customer.Vehicles.Select(v => new CustomerVehicleDto
            {
                Id = v.Id,
                PlateNumber = v.PlateNumber,
                Brand = v.Brand,
                Model = v.Model,
                Year = v.Year
            }).ToList()
        };

        return Result<CustomerDetailDto>.Success(dto);
    }

    public async Task<Result<Guid>> CreateAsync(CreateCustomerDto dto)
    {
        var exists = await _context.Customers.AnyAsync(c => c.Phone == dto.Phone);
        if (exists)
            return Result<Guid>.Failure("Bu telefon numarasına sahip bir müşteri zaten kayıtlı.");

        var customer = new Customer
        {
            FullName = dto.FullName,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address
        };

        await _context.Customers.AddAsync(customer);
        await _context.SaveChangesAsync();

        return Result<Guid>.Success(customer.Id);
    }

    public async Task<Result<bool>> UpdateAsync(Guid id, CreateCustomerDto dto)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return Result<bool>.Failure("Müşteri bulunamadı.");

        customer.FullName = dto.FullName;
        customer.Phone = dto.Phone;
        customer.Email = dto.Email;
        customer.Address = dto.Address;

        _context.Customers.Update(customer);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> DeleteAsync(Guid id)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return Result<bool>.Failure("Müşteri bulunamadı.");

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }
}
