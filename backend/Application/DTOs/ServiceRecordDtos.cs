namespace Application.DTOs;

public class ServiceRecordDto
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public VehicleDto? Vehicle { get; set; }
    public DateTime ArrivalDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public List<ServiceOperationDto> Operations { get; set; } = new();
    public List<PaymentDto> Payments { get; set; } = new();
    public decimal TotalLaborPrice => Operations.Sum(o => o.LaborPrice);
    public decimal TotalPaid => Payments.Sum(p => p.Amount);
    public decimal BalanceDue => TotalLaborPrice - TotalPaid;
}

public class CreateServiceRecordDto
{
    public Guid VehicleId { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class UpdateServiceRecordStatusDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty; // Bekliyor, İşlemde, Tamamlandı vs.
    public DateTime? DeliveryDate { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class ServiceOperationDto
{
    public Guid Id { get; set; }
    public Guid ServiceRecordId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string AssignedUserName { get; set; } = string.Empty;
    public string OperationDescription { get; set; } = string.Empty;
    public decimal LaborPrice { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateServiceOperationDto
{
    public Guid ServiceRecordId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string OperationDescription { get; set; } = string.Empty;
    public decimal LaborPrice { get; set; }
}

public class StaffMemberDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
