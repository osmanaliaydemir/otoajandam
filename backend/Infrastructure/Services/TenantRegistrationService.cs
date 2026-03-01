using Application.DTOs;
using Application.Interfaces;
using Core.Entities;
using Infrastructure.Data;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services;

public class TenantRegistrationService : ITenantRegistrationService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public TenantRegistrationService(
        ApplicationDbContext context, 
        UserManager<ApplicationUser> userManager, 
        RoleManager<IdentityRole> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<RegisterTenantResponseDto> RegisterTenantAsync(RegisterTenantRequestDto request)
    {
        // 1. Transaction başlat (Hem identity hem de custom tablolar için tutarlılık)
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 2. Yeni Tenant Oluştur
            var tenant = new Tenant
            {
                Name = request.TenantName,
                TaxNumber = request.TaxNumber,
                PackageType = request.PackageType,
                IsActive = true
            };

            await _context.Tenants.AddAsync(tenant);
            await _context.SaveChangesAsync(); // Auto Audit (BaseEntity)

            // 3. Admin Kullanıcısını Oluştur
            var adminUser = new ApplicationUser
            {
                UserName = request.AdminEmail,
                Email = request.AdminEmail,
                FirstName = request.AdminFirstName,
                LastName = request.AdminLastName,
                TenantId = tenant.Id,
                EmailConfirmed = true // Gerçekte aktivasyon maili atılabilir
            };

            var userResult = await _userManager.CreateAsync(adminUser, request.AdminPassword);

            if (!userResult.Succeeded)
            {
                await transaction.RollbackAsync();
                var errors = string.Join("; ", userResult.Errors.Select(e => e.Description));
                throw new Exception($"Kullanıcı oluşturulamadı: {errors}");
            }

            // 4. Roller henüz yoksa oluştur (Örn: "Admin", "Usta", "Danisman") 
            // - Normalde seed method'unda yapılır ancak burada gösterim amaçlı
            var rolesToSeed = new[] { "Admin", "Usta", "Danisman" };
            foreach (var roleName in rolesToSeed)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // 5. Admin Rolünü Ata
            var roleResult = await _userManager.AddToRoleAsync(adminUser, "Admin");
            if (!roleResult.Succeeded)
            {
                await transaction.RollbackAsync();
                throw new Exception("Kullanıcıya 'Admin' rolü atanamadı.");
            }

            // 6. İşlemleri Onayla
            await transaction.CommitAsync();

            return new RegisterTenantResponseDto
            {
                TenantId = tenant.Id,
                Message = "Firma ve yönetici hesabı başarıyla oluşturuldu."
            };
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
