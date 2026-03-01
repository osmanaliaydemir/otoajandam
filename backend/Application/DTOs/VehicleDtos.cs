namespace Application.DTOs;

public class VehicleDto
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Kilometer { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    public int? LastServiceKilometer { get; set; }
    public int? NextServiceKilometer { get; set; }
    public DateTime? LastServiceDate { get; set; }
}

public class CreateVehicleDto
{
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Kilometer { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
}

public class UpdateVehicleDto
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Kilometer { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    public int? LastServiceKilometer { get; set; }
    public int? NextServiceKilometer { get; set; }
    public DateTime? LastServiceDate { get; set; }
}
