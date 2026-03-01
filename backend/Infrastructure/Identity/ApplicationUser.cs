using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    // Firma kimliği (Tenant). Sistemdeki her kullanıcının bir Tenant'ı olmalı.
    public Guid TenantId { get; set; }
    
    // Uygulama genelinde Admin gibi roller mi yoksa sadece Tenant'a özel roller mi olacağını belirlemek için ek property'ler buraya eklenebilir.
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
