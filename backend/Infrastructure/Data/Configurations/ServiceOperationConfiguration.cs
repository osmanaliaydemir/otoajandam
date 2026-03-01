using Core.Entities;
using Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class ServiceOperationConfiguration : IEntityTypeConfiguration<ServiceOperation>
{
    public void Configure(EntityTypeBuilder<ServiceOperation> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.OperationDescription)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.LaborPrice)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        // Relation: ServiceRecord -> ServiceOperations (One-to-Many)
        builder.HasOne(so => so.ServiceRecord)
            .WithMany(sr => sr.Operations)
            .HasForeignKey(so => so.ServiceRecordId)
            .OnDelete(DeleteBehavior.Cascade); // Servis kaydı silinirse (veya soft delete), altındaki işlemler de silinsin.

        // Relation: ServiceOperation -> ApplicationUser (Personel)
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(so => so.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Personel silinse bile log/işlem geçmişi kaybolmamalı.
    }
}
