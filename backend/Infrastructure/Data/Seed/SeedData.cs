using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Core.Entities;
using Infrastructure.Identity;
using Infrastructure.Data;

namespace Infrastructure.Data.Seed
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider, ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            await dbContext.Database.MigrateAsync();

            // ─── 1. TENANT ───────────────────────────────────────────────────────────
            var demoTenant = await dbContext.Set<Tenant>().IgnoreQueryFilters().FirstOrDefaultAsync();
            Guid demoTenantId;

            if (demoTenant == null)
            {
                demoTenantId = Guid.NewGuid();
                demoTenant = new Tenant
                {
                    Id = demoTenantId,
                    Name = "Akın Oto Servis",
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true
                };
                dbContext.Set<Tenant>().Add(demoTenant);
                await dbContext.SaveChangesAsync();
            }
            else
            {
                demoTenantId = demoTenant.Id;
            }

            dbContext.CurrentTenantId = demoTenantId;

            // ─── 2. ROLLER ───────────────────────────────────────────────────────────
            var roles = new[] { "Admin", "Usta", "Danisman" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // ─── 3. KULLANICILAR ─────────────────────────────────────────────────────
            // Admin / Patron
            var adminUser = new ApplicationUser
            {
                UserName = "patron@akinoto.com", Email = "patron@akinoto.com",
                FirstName = "Hasan", LastName = "Akın",
                TenantId = demoTenantId, EmailConfirmed = true
            };
            if (await userManager.FindByEmailAsync(adminUser.Email) == null)
            {
                await userManager.CreateAsync(adminUser, "123456*Aa");
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }

            // Usta
            var ustaUser = new ApplicationUser
            {
                UserName = "usta@akinoto.com", Email = "usta@akinoto.com",
                FirstName = "Murat", LastName = "Çelik",
                TenantId = demoTenantId, EmailConfirmed = true
            };
            if (await userManager.FindByEmailAsync(ustaUser.Email) == null)
            {
                await userManager.CreateAsync(ustaUser, "123456*Aa");
                await userManager.AddToRoleAsync(ustaUser, "Usta");
            }

            // Danışman
            var danismanUser = new ApplicationUser
            {
                UserName = "danisman@akinoto.com", Email = "danisman@akinoto.com",
                FirstName = "Ayşe", LastName = "Kaya",
                TenantId = demoTenantId, EmailConfirmed = true
            };
            if (await userManager.FindByEmailAsync(danismanUser.Email) == null)
            {
                await userManager.CreateAsync(danismanUser, "123456*Aa");
                await userManager.AddToRoleAsync(danismanUser, "Danisman");
            }

            var adminId   = (await userManager.FindByEmailAsync("patron@akinoto.com"))!.Id;
            var ustaId    = (await userManager.FindByEmailAsync("usta@akinoto.com"))!.Id;
            var danismanId = (await userManager.FindByEmailAsync("danisman@akinoto.com"))!.Id;

            // ─── 4. KATALOG (Ürün + Hizmetler) ──────────────────────────────────────
            var anyProduct = await dbContext.Products.IgnoreQueryFilters().AnyAsync();
            List<Product> products = new();
            if (!anyProduct)
            {
                products = new List<Product>
                {
                    // Yedek Parçalar
                    new() { TenantId = demoTenantId, Name = "Castrol Edge 5W-30 Motor Yağı (5L)",    Code = "YAG-001", Price = 1050m, StockQuantity = 40, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Mobil 1 ESP 5W-30 Motor Yağı (5L)",     Code = "YAG-002", Price = 1250m, StockQuantity = 25, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Mann Oil Filter W713 (Yağ Filtresi)",   Code = "FLT-001", Price = 180m,  StockQuantity = 60, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Bosch Hava Filtresi F026400244",        Code = "FLT-002", Price = 320m,  StockQuantity = 30, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Denso Ateşleme Buji Seti (4'lü)",      Code = "BUJ-001", Price = 580m,  StockQuantity = 20, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Brembo Ön Fren Balatası (Takım)",      Code = "FRN-001", Price = 850m,  StockQuantity = 15, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "EBC Arka Fren Diski (Çift)",            Code = "FRN-002", Price = 1200m, StockQuantity = 10, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Valeo Triger Seti (Kayış + Gergi)",    Code = "TRG-001", Price = 2800m, StockQuantity = 8,  Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "ZF Direksiyon Rotili (Sol/Sağ)",        Code = "ROT-001", Price = 450m,  StockQuantity = 12, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Polkar Amortisör Takozu",              Code = "AMR-001", Price = 280m,  StockQuantity = 20, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Antifreze / Radyatör Suyu (5L)",       Code = "ANT-001", Price = 185m,  StockQuantity = 35, Type = ProductType.Part },
                    new() { TenantId = demoTenantId, Name = "Liqui Moly Fren Hidroliği DOT4 (500ml)",Code = "HİD-001", Price = 120m, StockQuantity = 40, Type = ProductType.Part },
                    // Hizmetler
                    new() { TenantId = demoTenantId, Name = "Periyodik Bakım İşçiliği",             Code = "HSM-001", Price = 750m,  StockQuantity = 0, Type = ProductType.Service },
                    new() { TenantId = demoTenantId, Name = "Fren Balata Değişimi İşçiliği",        Code = "HSM-002", Price = 400m,  StockQuantity = 0, Type = ProductType.Service },
                    new() { TenantId = demoTenantId, Name = "Triger Seti Değişimi İşçiliği",        Code = "HSM-003", Price = 1500m, StockQuantity = 0, Type = ProductType.Service },
                    new() { TenantId = demoTenantId, Name = "Motor Yıkama ve Temizleme",            Code = "HSM-004", Price = 350m,  StockQuantity = 0, Type = ProductType.Service },
                    new() { TenantId = demoTenantId, Name = "Klima Gazı Dolumu + Dezenfeksiyonu",   Code = "HSM-005", Price = 600m,  StockQuantity = 0, Type = ProductType.Service },
                    new() { TenantId = demoTenantId, Name = "Rotil + Rot Balans Ayarı",             Code = "HSM-006", Price = 550m,  StockQuantity = 0, Type = ProductType.Service },
                    new() { TenantId = demoTenantId, Name = "Akü Değişimi İşçiliği",                Code = "HSM-007", Price = 150m,  StockQuantity = 0, Type = ProductType.Service },
                    new() { TenantId = demoTenantId, Name = "Egzoz Muayenesi ve Onarım",            Code = "HSM-008", Price = 400m,  StockQuantity = 0, Type = ProductType.Service },
                };
                await dbContext.Products.AddRangeAsync(products);
                await dbContext.SaveChangesAsync();
            }
            else
            {
                products = await dbContext.Products.IgnoreQueryFilters().ToListAsync();
            }

            // ─── 5. MÜŞTERİLER ──────────────────────────────────────────────────────
            var anyCustomer = await dbContext.Customers.AnyAsync();
            List<Customer> customers;
            if (!anyCustomer)
            {
                customers = new List<Customer>
                {
                    new() { TenantId = demoTenantId, FullName = "Ahmet Yılmaz",    Phone = "5321112233", Email = "ahmet@gmail.com",     Address = "Kadıköy, İstanbul",      CreatedAt = DateTime.UtcNow.AddDays(-60) },
                    new() { TenantId = demoTenantId, FullName = "Mehmet Kara",     Phone = "5334445566", Email = "mehmet.kara@gmail.com", Address = "Çankaya, Ankara",        CreatedAt = DateTime.UtcNow.AddDays(-45) },
                    new() { TenantId = demoTenantId, FullName = "Selin Demir",     Phone = "5559998877", Email = "selin@hotmail.com",    Address = "Konak, İzmir",           CreatedAt = DateTime.UtcNow.AddDays(-30) },
                    new() { TenantId = demoTenantId, FullName = "Caner Şen",       Phone = "5443332211", Email = "caner@yahoo.com",      Address = "Muratpaşa, Antalya",     CreatedAt = DateTime.UtcNow.AddDays(-25) },
                    new() { TenantId = demoTenantId, FullName = "Fatma Güneş",     Phone = "5376661122", Email = "fatma.gunes@gmail.com", Address = "Bornova, İzmir",        CreatedAt = DateTime.UtcNow.AddDays(-20) },
                    new() { TenantId = demoTenantId, FullName = "Kemal Arslan",    Phone = "5387773344", Email = "kemal@arslanlar.com",  Address = "Bahçelievler, İstanbul", CreatedAt = DateTime.UtcNow.AddDays(-15) },
                    new() { TenantId = demoTenantId, FullName = "Zeynep Aydın",    Phone = "5411234567", Email = "zeynep@gmail.com",     Address = "Etimesgut, Ankara",      CreatedAt = DateTime.UtcNow.AddDays(-10) },
                    new() { TenantId = demoTenantId, FullName = "Burak Öztürk",    Phone = "5529876543", Email = null,                   Address = "Beylikdüzü, İstanbul",   CreatedAt = DateTime.UtcNow.AddDays(-8)  },
                };
                await dbContext.Customers.AddRangeAsync(customers);
                await dbContext.SaveChangesAsync();
            }
            else
            {
                customers = await dbContext.Customers.ToListAsync();
            }

            // ─── 6. ARAÇLAR ─────────────────────────────────────────────────────────
            var anyVehicle = await dbContext.Vehicles.AnyAsync();
            List<Vehicle> vehicles = new();
            if (!anyVehicle && customers.Count >= 4)
            {
                vehicles = new List<Vehicle>
                {
                    new() { TenantId = demoTenantId, CustomerId = customers[0].Id, CustomerPhone = customers[0].Phone, PlateNumber = "34ABC123", Brand = "Renault",    Model = "Megane",    Year = 2018, Kilometer = 85000,  CreatedAt = DateTime.UtcNow.AddDays(-55) },
                    new() { TenantId = demoTenantId, CustomerId = customers[0].Id, CustomerPhone = customers[0].Phone, PlateNumber = "34YLM001", Brand = "BMW",        Model = "3 Serisi",  Year = 2021, Kilometer = 28000,  CreatedAt = DateTime.UtcNow.AddDays(-10) },
                    new() { TenantId = demoTenantId, CustomerId = customers[1].Id, CustomerPhone = customers[1].Phone, PlateNumber = "06KAR098", Brand = "Ford",       Model = "Focus",     Year = 2019, Kilometer = 62000,  CreatedAt = DateTime.UtcNow.AddDays(-42) },
                    new() { TenantId = demoTenantId, CustomerId = customers[2].Id, CustomerPhone = customers[2].Phone, PlateNumber = "35İZM035", Brand = "Volkswagen", Model = "Passat",   Year = 2015, Kilometer = 160000, CreatedAt = DateTime.UtcNow.AddDays(-28) },
                    new() { TenantId = demoTenantId, CustomerId = customers[3].Id, CustomerPhone = customers[3].Phone, PlateNumber = "07ANT007", Brand = "Toyota",     Model = "Corolla",  Year = 2022, Kilometer = 15000,  CreatedAt = DateTime.UtcNow.AddDays(-22) },
                    new() { TenantId = demoTenantId, CustomerId = customers[4].Id, CustomerPhone = customers[4].Phone, PlateNumber = "35FTM512", Brand = "Honda",      Model = "Civic",    Year = 2020, Kilometer = 48000,  CreatedAt = DateTime.UtcNow.AddDays(-18) },
                    new() { TenantId = demoTenantId, CustomerId = customers[5].Id, CustomerPhone = customers[5].Phone, PlateNumber = "34KML334", Brand = "Hyundai",    Model = "i20",      Year = 2023, Kilometer = 8000,   CreatedAt = DateTime.UtcNow.AddDays(-12) },
                    new() { TenantId = demoTenantId, CustomerId = customers[6].Id, CustomerPhone = customers[6].Phone, PlateNumber = "06ZYN021", Brand = "Kia",        Model = "Sportage", Year = 2021, Kilometer = 35000,  CreatedAt = DateTime.UtcNow.AddDays(-8)  },
                    new() { TenantId = demoTenantId, CustomerId = customers[7].Id, CustomerPhone = customers[7].Phone, PlateNumber = "34BRK991", Brand = "Mercedes",   Model = "C180",     Year = 2017, Kilometer = 112000, CreatedAt = DateTime.UtcNow.AddDays(-5)  },
                };
                await dbContext.Vehicles.AddRangeAsync(vehicles);
                await dbContext.SaveChangesAsync();
            }
            else
            {
                // Mevcut araçları al, orphan araçları müşteriyle eşleştir
                vehicles = await dbContext.Vehicles.ToListAsync();
                var orphans = vehicles.Where(v => v.CustomerId == null).ToList();
                foreach (var v in orphans)
                {
                    var match = customers.FirstOrDefault(c => c.Phone == v.CustomerPhone);
                    if (match != null) v.CustomerId = match.Id;
                }
                if (orphans.Any()) await dbContext.SaveChangesAsync();
            }

            // ─── 7. SERVİS FIŞLERI + OPERASYONLAR + ÖDEMELER ───────────────────────
            var anyRecord = await dbContext.ServiceRecords.AnyAsync();
            if (!anyRecord && vehicles.Count >= 4)
            {
                // Yardımcı: ürün adına göre bul
                Product Urun(string code) => products.First(p => p.Code == code);

                // ── Fiş 1: Tamamlandı, ödenmiş ─────────────────
                var rec1 = new ServiceRecord
                {
                    TenantId = demoTenantId,
                    VehicleId = vehicles[0].Id,
                    ArrivalDate = DateTime.UtcNow.AddDays(-50),
                    DeliveryDate = DateTime.UtcNow.AddDays(-49),
                    Status = "Tamamlandı",
                    Notes = "Periyodik bakım + yağ değişimi yapıldı. Müşteri lastiklerin de kontrol edilmesini istedi.",
                    CreatedAt = DateTime.UtcNow.AddDays(-50)
                };
                rec1.Operations = new List<ServiceOperation>
                {
                    new() { TenantId = demoTenantId, UserId = ustaId, OperationDescription = $"{Urun("YAG-001").Name}", LaborPrice = Urun("YAG-001").Price, CreatedAt = rec1.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = ustaId, OperationDescription = $"{Urun("FLT-001").Name}", LaborPrice = Urun("FLT-001").Price, CreatedAt = rec1.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = ustaId, OperationDescription = $"{Urun("HSM-001").Name}", LaborPrice = Urun("HSM-001").Price, CreatedAt = rec1.ArrivalDate },
                };
                dbContext.ServiceRecords.Add(rec1);
                await dbContext.SaveChangesAsync();
                dbContext.Payments.Add(new Payment { TenantId = demoTenantId, ServiceRecordId = rec1.Id, Amount = rec1.Operations.Sum(o => o.LaborPrice), Method = PaymentMethod.Cash, PaidAt = rec1.DeliveryDate!.Value, Notes = "Nakit ödendi." });
                await dbContext.SaveChangesAsync();

                // ── Fiş 2: Tamamlandı, kısmi ödeme ─────────────
                var rec2 = new ServiceRecord
                {
                    TenantId = demoTenantId,
                    VehicleId = vehicles[2].Id,
                    ArrivalDate = DateTime.UtcNow.AddDays(-40),
                    DeliveryDate = DateTime.UtcNow.AddDays(-39),
                    Status = "Tamamlandı",
                    Notes = "Fren balatası ve diskleri değiştirildi. Arka sol tekerlek rotili oynak tespit edildi.",
                    CreatedAt = DateTime.UtcNow.AddDays(-40)
                };
                rec2.Operations = new List<ServiceOperation>
                {
                    new() { TenantId = demoTenantId, UserId = ustaId,    OperationDescription = $"{Urun("FRN-001").Name}", LaborPrice = Urun("FRN-001").Price, CreatedAt = rec2.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = ustaId,    OperationDescription = $"{Urun("FRN-002").Name}", LaborPrice = Urun("FRN-002").Price, CreatedAt = rec2.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = danismanId, OperationDescription = $"{Urun("HSM-002").Name}", LaborPrice = Urun("HSM-002").Price, CreatedAt = rec2.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = danismanId, OperationDescription = $"{Urun("HSM-006").Name}", LaborPrice = Urun("HSM-006").Price, CreatedAt = rec2.ArrivalDate },
                };
                dbContext.ServiceRecords.Add(rec2);
                await dbContext.SaveChangesAsync();
                dbContext.Payments.Add(new Payment { TenantId = demoTenantId, ServiceRecordId = rec2.Id, Amount = 2000m, Method = PaymentMethod.CreditCard, PaidAt = rec2.DeliveryDate!.Value, Notes = "Kredi kartı - 2 taksit." });
                await dbContext.SaveChangesAsync();

                // ── Fiş 3: Tamamlandı, tam ödeme (havale) ───────
                var rec3 = new ServiceRecord
                {
                    TenantId = demoTenantId,
                    VehicleId = vehicles[3].Id,
                    ArrivalDate = DateTime.UtcNow.AddDays(-30),
                    DeliveryDate = DateTime.UtcNow.AddDays(-29),
                    Status = "Tamamlandı",
                    Notes = "Triger seti yenilendi. Motor yıkaması yapıldı.",
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                };
                rec3.Operations = new List<ServiceOperation>
                {
                    new() { TenantId = demoTenantId, UserId = adminId,  OperationDescription = $"{Urun("TRG-001").Name}", LaborPrice = Urun("TRG-001").Price, CreatedAt = rec3.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = adminId,  OperationDescription = $"{Urun("HSM-003").Name}", LaborPrice = Urun("HSM-003").Price, CreatedAt = rec3.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = ustaId,   OperationDescription = $"{Urun("HSM-004").Name}", LaborPrice = Urun("HSM-004").Price, CreatedAt = rec3.ArrivalDate },
                };
                dbContext.ServiceRecords.Add(rec3);
                await dbContext.SaveChangesAsync();
                var rec3Total = rec3.Operations.Sum(o => o.LaborPrice);
                dbContext.Payments.Add(new Payment { TenantId = demoTenantId, ServiceRecordId = rec3.Id, Amount = rec3Total, Method = PaymentMethod.BankTransfer, PaidAt = rec3.DeliveryDate!.Value, Notes = "EFT yoluyla tahsil edildi." });
                await dbContext.SaveChangesAsync();

                // ── Fiş 4: Tamamlandı, geçen hafta ─────────────
                var rec4 = new ServiceRecord
                {
                    TenantId = demoTenantId,
                    VehicleId = vehicles[4].Id,
                    ArrivalDate = DateTime.UtcNow.AddDays(-7),
                    DeliveryDate = DateTime.UtcNow.AddDays(-6),
                    Status = "Tamamlandı",
                    Notes = "Klima gazı dolumu + akü değişimi.",
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                };
                rec4.Operations = new List<ServiceOperation>
                {
                    new() { TenantId = demoTenantId, UserId = ustaId,    OperationDescription = $"{Urun("HSM-005").Name}", LaborPrice = Urun("HSM-005").Price, CreatedAt = rec4.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = danismanId, OperationDescription = $"{Urun("HSM-007").Name}", LaborPrice = Urun("HSM-007").Price, CreatedAt = rec4.ArrivalDate },
                };
                dbContext.ServiceRecords.Add(rec4);
                await dbContext.SaveChangesAsync();
                dbContext.Payments.Add(new Payment { TenantId = demoTenantId, ServiceRecordId = rec4.Id, Amount = rec4.Operations.Sum(o => o.LaborPrice), Method = PaymentMethod.Cash, PaidAt = rec4.DeliveryDate!.Value });
                await dbContext.SaveChangesAsync();

                // ── Fiş 5: İşlemde (Bugün'e yakın, açık) ───────
                var rec5 = new ServiceRecord
                {
                    TenantId = demoTenantId,
                    VehicleId = vehicles[5].Id,
                    ArrivalDate = DateTime.UtcNow.AddDays(-2),
                    Status = "İşlemde",
                    Notes = "Motor arıza lambası yanıyor. Arıza kodları okundu: P0300 misfire. Buji + ateşleme sistemi kontrol ediliyor.",
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                };
                rec5.Operations = new List<ServiceOperation>
                {
                    new() { TenantId = demoTenantId, UserId = ustaId, OperationDescription = $"{Urun("BUJ-001").Name}", LaborPrice = Urun("BUJ-001").Price, CreatedAt = rec5.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = ustaId, OperationDescription = "Arıza Testi ve Diagnostik Ücret", LaborPrice = 300m, CreatedAt = rec5.ArrivalDate },
                };
                dbContext.ServiceRecords.Add(rec5);
                await dbContext.SaveChangesAsync();

                // ── Fiş 6: Bekliyor (Bugün girildi) ─────────────
                var rec6 = new ServiceRecord
                {
                    TenantId = demoTenantId,
                    VehicleId = vehicles[7].Id,
                    ArrivalDate = DateTime.UtcNow,
                    Status = "Bekliyor",
                    Notes = "Araç kabul edildi. Müşteri frenlerde ses ve titreşim şikayeti belirtti.",
                    CreatedAt = DateTime.UtcNow
                };
                rec6.Operations = new List<ServiceOperation>
                {
                    new() { TenantId = demoTenantId, UserId = ustaId, OperationDescription = "Fren Sistemi Genel Muayenesi", LaborPrice = 250m, CreatedAt = rec6.ArrivalDate },
                };
                dbContext.ServiceRecords.Add(rec6);
                await dbContext.SaveChangesAsync();

                // ── Fiş 7: Bekliyor (Dün girildi, BMW) ──────────
                var rec7 = new ServiceRecord
                {
                    TenantId = demoTenantId,
                    VehicleId = vehicles[1].Id,
                    ArrivalDate = DateTime.UtcNow.AddDays(-1),
                    Status = "Bekliyor",
                    Notes = "50.000 km periyodik bakım geldi. Yağ, filtreler ve tüm sıvılar değiştirilecek.",
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                };
                rec7.Operations = new List<ServiceOperation>
                {
                    new() { TenantId = demoTenantId, UserId = adminId,  OperationDescription = $"{Urun("YAG-002").Name}", LaborPrice = Urun("YAG-002").Price, CreatedAt = rec7.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = adminId,  OperationDescription = $"{Urun("FLT-002").Name}", LaborPrice = Urun("FLT-002").Price, CreatedAt = rec7.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = danismanId, OperationDescription = $"{Urun("HSM-001").Name}", LaborPrice = Urun("HSM-001").Price, CreatedAt = rec7.ArrivalDate },
                };
                dbContext.ServiceRecords.Add(rec7);
                await dbContext.SaveChangesAsync();

                // ── Fiş 8: İşlemde (Dün) ────────────────────────
                var rec8 = new ServiceRecord
                {
                    TenantId = demoTenantId,
                    VehicleId = vehicles[6].Id,
                    ArrivalDate = DateTime.UtcNow.AddDays(-1),
                    Status = "İşlemde",
                    Notes = "Rotil değişimi + rot balans. Ön sağ tekerlek göbeği de kontrole alındı.",
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                };
                rec8.Operations = new List<ServiceOperation>
                {
                    new() { TenantId = demoTenantId, UserId = ustaId,    OperationDescription = $"{Urun("ROT-001").Name}", LaborPrice = Urun("ROT-001").Price, CreatedAt = rec8.ArrivalDate },
                    new() { TenantId = demoTenantId, UserId = danismanId, OperationDescription = $"{Urun("HSM-006").Name}", LaborPrice = Urun("HSM-006").Price, CreatedAt = rec8.ArrivalDate },
                };
                dbContext.ServiceRecords.Add(rec8);
                await dbContext.SaveChangesAsync();
                // Kısmi ödeme alındı
                dbContext.Payments.Add(new Payment { TenantId = demoTenantId, ServiceRecordId = rec8.Id, Amount = 500m, Method = PaymentMethod.Cash, PaidAt = DateTime.UtcNow.AddDays(-1), Notes = "Avans alındı." });
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
