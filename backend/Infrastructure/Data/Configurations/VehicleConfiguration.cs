using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.HasKey(x => x.Id);

        // Required alanlar
        builder.Property(x => x.PlateNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Brand)
            .HasMaxLength(100);

        builder.Property(x => x.Model)
            .HasMaxLength(100);

        builder.Property(x => x.CustomerPhone)
            .HasMaxLength(20);

        // Aynı tenant içinde plaka unique olmalı (Aynı zamanda arama indeksi olarak çalışır)
        builder.HasIndex(x => new { x.TenantId, x.PlateNumber })
            .IsUnique()
            .HasDatabaseName("IX_Vehicle_Tenant_PlateNumber");

        // PERFORMANS ODAKLI İNDEKSLER
        
        // En son eklenen araçları (Pagination ve Sıralama) listelerken tabloyu full-scan yapmaktansa indeks üzerinden okuma yapılmasını sağlar
        builder.HasIndex(x => new { x.TenantId, x.CreatedAt })
            .HasDatabaseName("IX_Vehicle_Tenant_CreatedAt");
    }
}
