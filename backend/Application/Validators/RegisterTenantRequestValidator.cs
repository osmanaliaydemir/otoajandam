using Application.DTOs;
using FluentValidation;

namespace Application.Validators;

public class RegisterTenantRequestValidator : AbstractValidator<RegisterTenantRequestDto>
{
    public RegisterTenantRequestValidator()
    {
        RuleFor(x => x.TenantName)
            .NotEmpty().WithMessage("Firma adı zorunludur.")
            .MaximumLength(150).WithMessage("Firma adı en fazla 150 karakter olabilir.");

        RuleFor(x => x.TaxNumber)
            .NotEmpty().WithMessage("Vergi/TC kimlik numarası zorunludur.")
            .Length(10, 11).WithMessage("Vergi/TC kimlik numarası 10 veya 11 hane olmalıdır.");

        RuleFor(x => x.PackageType)
            .NotEmpty().WithMessage("Paket tipi seçimi zorunludur.");

        RuleFor(x => x.AdminFirstName)
            .NotEmpty().WithMessage("Yönetici adı zorunludur.");

        RuleFor(x => x.AdminLastName)
            .NotEmpty().WithMessage("Yönetici soyadı zorunludur.");

        RuleFor(x => x.AdminEmail)
            .NotEmpty().WithMessage("Yönetici email adresi zorunludur.")
            .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

        RuleFor(x => x.AdminPassword)
            .NotEmpty().WithMessage("Şifre zorunludur.")
            .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");
    }
}
