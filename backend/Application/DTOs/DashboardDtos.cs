namespace Application.DTOs;

public class DashboardMetricsDto
{
    public int ThisMonthTotalServices { get; set; }
    public decimal ThisMonthTotalRevenue { get; set; }
    public int OpenJobsCount { get; set; }
    public TopStaffDto? TopStaff { get; set; }
}

public class TopStaffDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int OperationCount { get; set; }
}

public class MonthlyRevenueDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Revenue { get; set; }
}

public class StaffPerformanceDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int UniqueServiceRecordCount { get; set; } // Kaç farklı araç servisinde bulunmuş
    public int TotalOperationCount { get; set; } // Toplam kaç parça veya kalem işlem yapmış
    public decimal TotalLaborRevenue { get; set; } // Getirdiği toplam ciro
    public decimal AverageRevenuePerOperation { get; set; } // TotalLabor / TotalOperation (Ortalama ciro)
}
