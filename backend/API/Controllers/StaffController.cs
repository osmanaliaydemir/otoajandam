using Application.DTOs;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class StaffController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public StaffController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    private Guid CurrentTenantId()
    {
        var claim = User.FindFirst("tenantId")?.Value;
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }

    // ── Personel Listesi ──────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tenantId = CurrentTenantId();
        if (tenantId == Guid.Empty) return Unauthorized();

        var users = await _userManager.Users
            .Where(u => u.TenantId == tenantId)
            .ToListAsync();

        var result = new List<object>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            result.Add(new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.PhoneNumber,
                Roles = roles,
            });
        }

        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // ── Personel Ekle ─────────────────────────────────────────────────────────
    [HttpPost]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> Create([FromBody] CreateStaffDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(ApiResponse<object>.ErrorResponse("E-posta ve şifre zorunludur."));

        var tenantId = CurrentTenantId();
        if (tenantId == Guid.Empty) return Unauthorized();

        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
            return Conflict(ApiResponse<object>.ErrorResponse("Bu e-posta adresi zaten kullanımda."));

        var user = new ApplicationUser
        {
            UserName = dto.Email.Trim().ToLower(),
            Email = dto.Email.Trim().ToLower(),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            TenantId = tenantId,
            EmailConfirmed = true,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var err = result.Errors.FirstOrDefault()?.Description ?? "Personel oluşturulamadı.";
            return BadRequest(ApiResponse<object>.ErrorResponse(err));
        }

        if (!string.IsNullOrWhiteSpace(dto.Role))
        {
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        return Ok(ApiResponse<object>.SuccessResponse(new { user.Id }, "Personel eklendi."));
    }

    // ── Personel Güncelle ─────────────────────────────────────────────────────
    [HttpPut("{id}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateStaffDto dto)
    {
        var tenantId = CurrentTenantId();
        if (tenantId == Guid.Empty) return Unauthorized();

        var user = await _userManager.FindByIdAsync(id);
        if (user == null || user.TenantId != tenantId)
            return NotFound(ApiResponse<object>.ErrorResponse("Personel bulunamadı."));

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            user.PhoneNumber = dto.PhoneNumber.Trim();

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return BadRequest(ApiResponse<object>.ErrorResponse("Güncelleme başarısız."));

        // Rol güncelleme
        if (!string.IsNullOrWhiteSpace(dto.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        return Ok(ApiResponse<object>.SuccessResponse(null, "Personel güncellendi."));
    }

    // ── Personel Sil ──────────────────────────────────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> Delete(string id)
    {
        var tenantId = CurrentTenantId();
        if (tenantId == Guid.Empty) return Unauthorized();

        // Kendi kendini silmeyi engelle
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (id == currentUserId)
            return BadRequest(ApiResponse<object>.ErrorResponse("Kendinizi silemezsiniz."));

        var user = await _userManager.FindByIdAsync(id);
        if (user == null || user.TenantId != tenantId)
            return NotFound(ApiResponse<object>.ErrorResponse("Personel bulunamadı."));

        // Silinecek kişi Admin ise ve tenantdaki tek Admin ise engelle
        var userRoles = await _userManager.GetRolesAsync(user);
        if (userRoles.Contains("Admin"))
        {
            var allAdmins = await _userManager.GetUsersInRoleAsync("Admin");
            var tenantAdminCount = allAdmins.Count(a => a.TenantId == tenantId);
            if (tenantAdminCount <= 1)
                return BadRequest(ApiResponse<object>.ErrorResponse("Sistemde en az bir Admin kullanıcı bulunmalıdır. Önce başka bir Admin atayın."));
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(ApiResponse<object>.ErrorResponse("Personel silinemedi."));

        return Ok(ApiResponse<object>.SuccessResponse(null, "Personel silindi."));
    }
}
