namespace Application.Interfaces;

public interface ITokenService
{
    string CreateToken(string userId, string email, Guid tenantId, IList<string> roles);
}
