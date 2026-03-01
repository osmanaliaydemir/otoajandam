using Application.DTOs;

namespace Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardMetricsDto> GetDashboardMetricsAsync(CancellationToken cancellationToken = default);
    Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<List<StaffPerformanceDto>> GetStaffPerformanceAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}
