using System.Net;
using System.Text.Json;
using Application.DTOs;
using Core.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace API.Middlewares;

public class ErrorHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlerMiddleware> _logger;

    public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception error)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var responseModel = new ErrorResponseDto
            {
                Success = false,
                Message = error.Message,
                Errors = new List<string>()
            };

            switch (error)
            {
                case ApiException e:
                    // Bilinen iş kuralları ihlali
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    responseModel.StatusCode = response.StatusCode;
                    break;
                case ValidationException e:
                    // FluentValidation üzerinden manuel fırlatılan Invalid Validation hataları
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    responseModel.Message = "Doğrulama hatası";
                    responseModel.StatusCode = response.StatusCode;
                    responseModel.Errors = e.Errors.Select(x => x.ErrorMessage).ToList();
                    break;
                case KeyNotFoundException e:
                    // Veritabanında kayıt bulunamadı vb. hatalar
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    responseModel.StatusCode = response.StatusCode;
                    break;
                default:
                    // Beklenmeyen sunucu hatası
                    _logger.LogError(error, "Sistemde beklenmeyen bir hata oluştu.");
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    responseModel.Message = "Sunucu tarafında beklenmeyen bir hata oluştu.";
                    responseModel.StatusCode = response.StatusCode;
                    // Production ortamında error detayını gizlemek faydalıdır (Şu an geliştirme aşaması olduğu için ekleniyor)
                    responseModel.Errors.Add(error.Message);
                    break;
            }

            // Json isimlendirme kuralını (CamelCase => 'success', 'message', 'errors', 'statusCode') ayarlıyoruz
            var result = JsonSerializer.Serialize(responseModel, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            await response.WriteAsync(result);
        }
    }
}
