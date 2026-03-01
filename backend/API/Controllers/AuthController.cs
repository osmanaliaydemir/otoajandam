using Application.DTOs;
using Application.Interfaces;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _roleManager = roleManager;
    }

    [HttpPost("login")]
    [EnableRateLimiting("LoginLimiter")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Unauthorized("Geçersiz e-posta veya şifre.");

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            return Unauthorized("Geçersiz e-posta veya şifre.");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateToken(user.Id, user.Email!, user.TenantId, roles);

        return Ok(ApiResponse<LoginResponseDto>.SuccessResponse(new LoginResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            TenantId = user.TenantId
        }, "Giriş başarılı."));
    }

    // ── Profil Getir ──────────────────────────────────────────────────────────
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            Roles = roles
        }));
    }

    // ── Profil Güncelle ───────────────────────────────────────────────────────
    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            return BadRequest(ApiResponse<object>.ErrorResponse("Ad ve soyad boş olamaz."));

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            user.PhoneNumber = dto.PhoneNumber.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(ApiResponse<object>.ErrorResponse("Profil güncellenemedi."));

        return Ok(ApiResponse<object>.SuccessResponse(null, "Profil güncellendi."));
    }

    // ── Şifre Değiştir ────────────────────────────────────────────────────────
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest(ApiResponse<object>.ErrorResponse("Şifre alanları boş olamaz."));

        if (dto.NewPassword.Length < 6)
            return BadRequest(ApiResponse<object>.ErrorResponse("Yeni şifre en az 6 karakter olmalıdır."));

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var error = result.Errors.FirstOrDefault()?.Description ?? "Şifre değiştirilemedi.";
            return BadRequest(ApiResponse<object>.ErrorResponse(error));
        }

        return Ok(ApiResponse<object>.SuccessResponse(null, "Şifre başarıyla değiştirildi."));
    }

    // ── Demo Kayıt ────────────────────────────────────────────────────────────
    [HttpPost("register-demo")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterDemo()
    {
        var tenantId = Guid.NewGuid();
        var adminEmail = $"admin_{tenantId.ToString().Substring(0, 8)}@demo.com";
        var password = "Password123!";

        var user = new ApplicationUser { UserName = adminEmail, Email = adminEmail, TenantId = tenantId };
        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
            return BadRequest(ApiResponse<object>.ErrorResponse("Demo kullanıcı oluşturulamadı."));

        if (!await _roleManager.RoleExistsAsync("Admin"))
            await _roleManager.CreateAsync(new IdentityRole("Admin"));

        await _userManager.AddToRoleAsync(user, "Admin");

        return Ok(ApiResponse<object>.SuccessResponse(new { Email = adminEmail, Password = password, TenantId = tenantId }, "Demo kullanıcı oluşturuldu."));
    }
}
