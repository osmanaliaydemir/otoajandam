using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using API.Services;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Identity;
using Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using FluentValidation;
using FluentValidation.AspNetCore;
using Hangfire;
using Infrastructure.Jobs;
using API.Middlewares;
using Infrastructure.Services;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services to the container.
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // FluentValidation tarafından veya ModelState üzerinden dönen varsayılan 400 (Bad Request)
        // AutoValidation hatalarını bizim global formatımıza zorluyoruz
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value.Errors.Count > 0)
                .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                .ToList();

            var response = new Application.DTOs.ErrorResponseDto
            {
                Success = false,
                Message = "Doğrulama hatası",
                Errors = errors,
                StatusCode = 400
            };

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(response);
        };
    });

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Application.Validators.RegisterTenantRequestValidator>();

// Rate Limiting (Performans & Güvenlik, Brute-Force koruması vs)
builder.Services.AddRateLimiter(options =>
{
    // Global Limit: Sisteme genel kabul edilen limit (1 dakikada max 100 istek / IP bazlı vb. yapılabilir ama en temeli Partitioned'dır)
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 2,
                Window = TimeSpan.FromMinutes(1)
            }));
            
    // Login Endpoint (Brute-Force Koruması): 1 dakikada max 5 istek
    options.AddPolicy("LoginLimiter", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0, // Sıraya alma, hemen Reddet (429)
                Window = TimeSpan.FromMinutes(1)
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.ContentType = "application/json";
        
        var responseModel = Application.DTOs.ApiResponse<object>.ErrorResponse("Çok fazla istek attınız. Lütfen daha sonra tekrar deneyiniz.", 429);
        await context.HttpContext.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(responseModel, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase }), cancellationToken: token);
    };
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// DbContext Registration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection") 
                         ?? "Server=localhost;Database=OtoajandaDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"));

// IHttpContextAccessor and TenantService
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantService, CurrentTenantService>();
builder.Services.AddScoped<ITokenService, TokenService>(); // Token Service Registration
builder.Services.AddScoped<IDashboardService, DashboardService>(); // Dashboard Stats Service
builder.Services.AddScoped<IEmailService, EmailService>(); // Email Service Registration

builder.Services.AddScoped<ITenantRegistrationService, TenantRegistrationService>(); // Tenant Katıt Servisi
builder.Services.AddScoped<IVehicleService, VehicleService>(); // Araç Yönetimi Servisibr
builder.Services.AddScoped<IServiceRecordService, ServiceRecordService>(); // Servis (İş Kaydı) Yönetimi Servisi
builder.Services.AddScoped<ICustomerService, CustomerService>(); // Müşteri Yönetimi Servisi
builder.Services.AddScoped<IProductService, ProductService>(); // Ürün/Katalog Yönetimi Servisi
builder.Services.AddScoped<IPaymentService, PaymentService>(); // Tahsilat/Ödeme Servisi

// Identity & Role-Based Authorization
builder.Services.AddIdentityCore<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddRoles<Microsoft.AspNetCore.Identity.IdentityRole>()
    .AddRoleManager<RoleManager<Microsoft.AspNetCore.Identity.IdentityRole>>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager<SignInManager<ApplicationUser>>();

// JWT Authentication Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "OtoajandaIssuer",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "OtoajandaAudience",
            // JWT key must be at least 512 bits (64 chars) for HMAC-SHA512
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "superSecretKey12345!superSecretKey12345!superSecretKey12345!superSecretKey12345!"))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
    // Usta yetkisi için: İster sadece Usta'yı, ister Admin de yapabiliyorsa ikisini birden verebiliriz.
    options.AddPolicy("RequireUstaRole", policy => policy.RequireRole("Admin", "Usta"));
    options.AddPolicy("RequireDanismanRole", policy => policy.RequireRole("Admin", "Danisman"));
});

// Hangfire Configuration (Uses same SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? "Server=localhost;Database=OtoajandaDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString));

builder.Services.AddHangfireServer();

var app = builder.Build();

// Seed Data & Automigrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

    try
    {
        await Infrastructure.Data.Seed.SeedData.InitializeAsync(services, context, userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Bir hata olustu SeedData sirasinda.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Use Rate Limiting Middleware (Global exception sonrasına veya öncesine konulabilir)
app.UseRateLimiter();

// Global Exception Handler Middleware (En üste, routingden bile önce eklenmeli ki tüm pipeline'ı kapsasın)
app.UseMiddleware<ErrorHandlerMiddleware>();

// CORS middleware
app.UseCors("AllowAll");

// Authentication & Authorization middlewares
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Configure Hangfire Dashboard (Can be secured via custom authorization filter)
app.UseHangfireDashboard("/hangfire");

// Schedule the Recurring Maintenance Job (e.g., runs every day at 08:00 AM)
RecurringJob.AddOrUpdate<VehicleMaintenanceJob>(
    "vehicle-maintenance-check-job",
    job => job.CheckMaintenanceAndSendEmailAsync(),
    Cron.Daily(8));

app.Run();
