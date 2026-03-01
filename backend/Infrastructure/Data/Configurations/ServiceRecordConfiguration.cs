using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class ServiceRecordConfiguration : IEntityTypeConfiguration<ServiceRecord>
{
    public void Configure(EntityTypeBuilder<ServiceRecord> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        // One-to-Many ilişkisi (Bir aracın birden fazla servis kaydı olabilir)
        builder.HasOne(sr => sr.Vehicle)
            .WithMany() // Araç tarafına 'public ICollection<ServiceRecord> Records { get; set; }' eklenebilir, eklenmezse WithMany() boş bırakılır.
            .HasForeignKey(sr => sr.VehicleId)
            .OnDelete(DeleteBehavior.Restrict); // Araç silinince servis kayıtlarının otomatik silinmemesi için.

        // PERFORMANS ODAKLI İNDEKSLER
        
        // 1. Duruma(Status) göre servis kayıtlarını listelerken (Açık işler vs.) performansı artırır
        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_ServiceRecord_Tenant_Status");

        // 2. Geliş tarihine (ArrivalDate veya CreatedAt) göre kronolojik sıralama/filtreleme performansı
        builder.HasIndex(x => new { x.TenantId, x.ArrivalDate })
            .HasDatabaseName("IX_ServiceRecord_Tenant_ArrivalDate");

        // 3. Spresifik bir aracın servis geçmişini listelerken hızlı erişim
        builder.HasIndex(x => new { x.TenantId, x.VehicleId })
            .HasDatabaseName("IX_ServiceRecord_Tenant_VehicleId");
    }
}
