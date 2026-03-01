using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Core.Common;
using Core.Entities;
using Core.Interfaces;

using Infrastructure.Identity;

namespace Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    private readonly ITenantService _tenantService;
    private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;
    public Guid CurrentTenantId { get; set; }

    public DbSet<Product> Products { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<ServiceRecord> ServiceRecords { get; set; }
    public DbSet<ServiceOperation> ServiceOperations { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options, 
        ITenantService tenantService,
        Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor) 
        : base(options)
    {
        _tenantService = tenantService;
        _httpContextAccessor = httpContextAccessor;
        CurrentTenantId = _tenantService.GetTenantId();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Assembly içindeki IEntityTypeConfiguration<> implementasyonlarını bulup uygular (örn: VehicleConfiguration)
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Reflection kullanarak IMustHaveTenant ve BaseEntity arayüzlerini kontrol ederek filtreleri uyguluyoruz
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            bool isTenant = typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType);
            bool isBase = typeof(BaseEntity).IsAssignableFrom(entityType.ClrType);

            if (isTenant && isBase)
            {
                builder.Entity(entityType.ClrType)
                    .HasQueryFilter(ConvertFilterExpression<IMustHaveTenant>(e => e.TenantId == CurrentTenantId && !((BaseEntity)e).IsDeleted, entityType.ClrType));
            }
            else if (isTenant)
            {
                builder.Entity(entityType.ClrType)
                    .HasQueryFilter(ConvertFilterExpression<IMustHaveTenant>(e => e.TenantId == CurrentTenantId, entityType.ClrType));
            }
            else if (isBase)
            {
                builder.Entity(entityType.ClrType)
                    .HasQueryFilter(ConvertFilterExpression<BaseEntity>(e => !e.IsDeleted, entityType.ClrType));
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Deleted:
                    // Soft delete uygulaması (Hard delete engellenir)
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedDate = DateTime.UtcNow;
                    break;
            }
        }

        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
        {
            if (entry.State == EntityState.Added)
            {
                // Eklenen kaydın TenantId'sini otomatik olarak mevcut kullanıcının TenantId'si ile doldur.
                // Yetkisiz tenant üzerinden işlem yapılmasını %100 oranında engeller.
                entry.Entity.TenantId = CurrentTenantId;
            }
        }

        // Audit Log İşlemleri (Değişiklikleri yakala)
        var currentUserId = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "System";
        var auditLogs = new List<AuditLog>();
        
        // Yeni eklenecek logların tekrar döngüye girmemesi için ToList() ile ChangeTracker sonucunu alıyoruz.
        var entries = ChangeTracker.Entries().ToList();

        foreach (var entry in entries)
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditLog = new AuditLog
            {
                EntityName = entry.Entity.GetType().Name,
                ChangedDate = DateTime.UtcNow,
                ChangedByUserId = currentUserId,
            };

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            foreach (var property in entry.Properties)
            {
                string propertyName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    auditLog.EntityId = property.CurrentValue?.ToString() ?? string.Empty;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditLog.ActionType = "Create";
                        newValues[propertyName] = property.CurrentValue;
                        break;
                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            auditLog.ActionType = "Update";
                            oldValues[propertyName] = property.OriginalValue;
                            newValues[propertyName] = property.CurrentValue;
                        }
                        break;
                    case EntityState.Deleted:
                        auditLog.ActionType = "Delete";
                        oldValues[propertyName] = property.OriginalValue;
                        break;
                }
            }

            // Soft delete tespiti: Entity modified olmuş ve IsDeleted değeri false'dan true'ya geçmişse
            if (entry.State == EntityState.Modified && oldValues.ContainsKey("IsDeleted") && newValues.ContainsKey("IsDeleted"))
            {
                var oldDel = oldValues["IsDeleted"] as bool?;
                var newDel = newValues["IsDeleted"] as bool?;
                if (oldDel == false && newDel == true)
                {
                    auditLog.ActionType = "Delete (Soft)";
                }
            }

            auditLog.OldValues = oldValues.Count == 0 ? "{}" : System.Text.Json.JsonSerializer.Serialize(oldValues);
            auditLog.NewValues = newValues.Count == 0 ? "{}" : System.Text.Json.JsonSerializer.Serialize(newValues);

            // Tenant Id set (Entity üzerinden tenant alınıyorsa ezmemek gerek)
            if (entry.Entity is IMustHaveTenant tenantEntity)
            {
                auditLog.TenantId = tenantEntity.TenantId;
            }

            auditLogs.Add(auditLog);
        }

        if (auditLogs.Any())
        {
            AuditLogs.AddRange(auditLogs);
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    // Expression dönüştürücü yardımcı metot (Global Query Filter için)
    private static LambdaExpression ConvertFilterExpression<TInterface>(
        Expression<Func<TInterface, bool>> filterExpression, 
        Type entityType)
    {
        var newParam = Expression.Parameter(entityType, "e");
        var replaceVisitor = new ReplacingExpressionVisitor(filterExpression.Parameters.Single(), newParam);
        var newBody = replaceVisitor.Visit(filterExpression.Body);
        return Expression.Lambda(newBody!, newParam);
    }
}

// Yardımcı Expression Visitor Sınıfı
internal class ReplacingExpressionVisitor : ExpressionVisitor
{
    private readonly Expression _oldValue;
    private readonly Expression _newValue;

    public ReplacingExpressionVisitor(Expression oldValue, Expression newValue)
    {
        _oldValue = oldValue;
        _newValue = newValue;
    }

    public override Expression Visit(Expression? node)
    {
        return node == _oldValue ? _newValue : base.Visit(node)!;
    }
}
