using Application.DTOs;
using Application.Interfaces;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class VehicleService : IVehicleService
{
    private readonly ApplicationDbContext _context;

    public VehicleService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<VehicleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _context.Vehicles
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (vehicle == null) return null;

        return MapToDto(vehicle);
    }

    public async Task<VehicleDto?> GetByPlateNumberAsync(string plateNumber, CancellationToken cancellationToken = default)
    {
        var normalizedPlate = NormalizePlate(plateNumber);
        var vehicle = await _context.Vehicles
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.PlateNumber == normalizedPlate, cancellationToken);
            
        if (vehicle == null) return null;

        return MapToDto(vehicle);
    }

    public async Task<List<VehicleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var vehicles = await _context.Vehicles
            .AsNoTracking()
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync(cancellationToken);

        return vehicles.Select(MapToDto).ToList();
    }

    public async Task<List<VehicleDto>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<VehicleDto>();

        var normalizedSearchTerm = NormalizePlate(searchTerm);

        var vehicles = await _context.Vehicles
            .AsNoTracking()
            .Where(v => v.PlateNumber.Contains(normalizedSearchTerm) 
                     || v.CustomerPhone.Contains(searchTerm) 
                     || v.Brand.Contains(searchTerm))
            .OrderByDescending(v => v.CreatedAt)
            .Take(50) // Performans için sınır
            .ToListAsync(cancellationToken);

        return vehicles.Select(MapToDto).ToList();
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleDto createDto, CancellationToken cancellationToken = default)
    {
        var normalizedPlate = NormalizePlate(createDto.PlateNumber);

        // Plaka kontrolü (Aynı tenant içinde aynı plaka var mı?)
        var exists = await _context.Vehicles.AnyAsync(v => v.PlateNumber == normalizedPlate, cancellationToken);
        if (exists)
            throw new Exception("Bu plakaya sahip bir araç zaten kayıtlı.");

        var vehicle = new Vehicle
        {
            PlateNumber = createDto.PlateNumber,
            Brand = createDto.Brand,
            Model = createDto.Model,
            Year = createDto.Year,
            Kilometer = createDto.Kilometer,
            CustomerPhone = createDto.CustomerPhone
        };

        await _context.Vehicles.AddAsync(vehicle, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(vehicle);
    }

    public async Task<VehicleDto> UpdateAsync(UpdateVehicleDto updateDto, CancellationToken cancellationToken = default)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == updateDto.Id, cancellationToken);
        if (vehicle == null)
            throw new Exception("Araç bulunamadı.");

        var normalizedPlate = NormalizePlate(updateDto.PlateNumber);

        // Plaka değiştiyse ve yeni plaka başka bir araca aitse kontrolü
        if (vehicle.PlateNumber != normalizedPlate)
        {
            var exists = await _context.Vehicles.AnyAsync(v => v.PlateNumber == normalizedPlate && v.Id != updateDto.Id, cancellationToken);
            if (exists)
                throw new Exception("Bu plakaya sahip başka bir araç zaten kayıtlı.");
        }

        vehicle.PlateNumber = updateDto.PlateNumber;
        vehicle.Brand = updateDto.Brand;
        vehicle.Model = updateDto.Model;
        vehicle.Year = updateDto.Year;
        vehicle.Kilometer = updateDto.Kilometer;
        vehicle.CustomerPhone = updateDto.CustomerPhone;
        vehicle.LastServiceKilometer = updateDto.LastServiceKilometer;
        vehicle.NextServiceKilometer = updateDto.NextServiceKilometer;
        vehicle.LastServiceDate = updateDto.LastServiceDate;

        _context.Vehicles.Update(vehicle);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(vehicle);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
        if (vehicle == null) return false;

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync(cancellationToken);
        
        return true;
    }

    private static string NormalizePlate(string? plate)
    {
        if (string.IsNullOrWhiteSpace(plate)) return string.Empty;
        return plate.Replace(" ", "").ToUpperInvariant();
    }

    private static VehicleDto MapToDto(Vehicle vehicle)
    {
        return new VehicleDto
        {
            Id = vehicle.Id,
            PlateNumber = vehicle.PlateNumber,
            Brand = vehicle.Brand,
            Model = vehicle.Model,
            Year = vehicle.Year,
            Kilometer = vehicle.Kilometer,
            CustomerPhone = vehicle.CustomerPhone,
            LastServiceKilometer = vehicle.LastServiceKilometer,
            NextServiceKilometer = vehicle.NextServiceKilometer,
            LastServiceDate = vehicle.LastServiceDate
        };
    }
}
