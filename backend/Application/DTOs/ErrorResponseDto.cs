namespace Application.DTOs;

public class ErrorResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new List<string>();
    public int StatusCode { get; set; }
}
