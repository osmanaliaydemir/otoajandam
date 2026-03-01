using Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string toAddress, string subject, string body)
    {
        // Burada SMTP (MailKit) veya SendGrid/Amazon SES entegrasyonu yapılabilir.
        // Şimdilik sadece Console/Log'a yazarak mock (sahte) bir davranıs sergiliyoruz.
        _logger.LogInformation("E-posta gönderiliyor... Kime: {ToAddress} Konu: {Subject} İçerik: {Body}", toAddress, subject, body);
        
        return Task.CompletedTask;
    }
}
