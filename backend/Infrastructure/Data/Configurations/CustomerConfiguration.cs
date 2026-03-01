using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.FullName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(c => c.Phone)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(c => c.Email)
            .HasMaxLength(150);
            
        builder.Property(c => c.Address)
            .HasMaxLength(500);

        // İlişki: Customer -> Vehicles (1-N)
        builder.HasMany(c => c.Vehicles)
            .WithOne(v => v.Customer)
            .HasForeignKey(v => v.CustomerId)
            .OnDelete(DeleteBehavior.SetNull); // Müşteri silinse bile araç kalsın (opsiyonel tercih)
    }
}
