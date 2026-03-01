# OtoAjandam

Otomotiv servis atölyelerine yönelik çok kiracılı (multi-tenant) bir servis yönetim platformu.

## Teknoloji Stack'i

| Katman | Teknoloji |
|---|---|
| Backend | .NET 9, ASP.NET Core, EF Core, Identity, JWT |
| Veritabanı | MS SQL Server |
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Auth | ASP.NET Core Identity + JWT Bearer |

## Proje Yapısı

```
otoajanda/
├── backend/
│   ├── API/              # ASP.NET Core Web API
│   ├── Application/      # DTOs, Interfaces, Use Cases
│   ├── Core/             # Entities, Domain
│   └── Infrastructure/   # EF Core, Identity, Services
└── frontend/
    └── src/
        ├── app/          # Next.js App Router sayfaları
        ├── components/   # Tekrar kullanılabilir bileşenler
        ├── lib/          # Axios, helpers
        └── store/        # Zustand state yönetimi
```

## Özellikler

- 🔐 **Çok Kiracılı Mimari** — Her firma kendi verisini görür
- 🚗 **Servis Fişleri** — Araç bazlı servis kaydı ve işlem takibi
- 👥 **Müşteri / Araç Yönetimi** — Cari kart ve araç geçmişi
- 📦 **Ürün Kataloğu** — Hizmet ve yedek parça tanımları
- 💳 **Ödeme Takibi** — Fiş başına ödeme kaydı
- 📊 **Dashboard & Raporlar** — Özet metrikleri ve aylık ciro
- ⚙️ **Ayarlar** — Kullanıcı profili, şifre ve personel yönetimi
- 🛡️ **Rate Limiting** — Login endpoint'inde brute-force koruması

## Kurulum

### Backend

```bash
cd backend

# 1. appsettings.json oluştur
cp API/appsettings.example.json API/appsettings.json
# appsettings.json içindeki bağlantı dizesi ve JWT key'i doldurun

# 2. Migration uygula
dotnet ef database update --project Infrastructure --startup-project API

# 3. Çalıştır
dotnet run --project API/API.csproj
# API: http://localhost:5158
```

### Frontend

```bash
cd frontend

# 1. Bağımlılıkları yükle
npm install

# 2. Env dosyası oluştur
cp .env.example .env.local
# .env.local içindeki NEXT_PUBLIC_API_BASE_URL'i ayarlayın

# 3. Çalıştır
npm run dev
# Uygulama: http://localhost:3000
```

## Roller

| Rol | Yetki |
|---|---|
| Admin | Tüm işlemler + personel yönetimi |
| Usta | Servis fişi oluşturma ve düzenleme |
| Danisman | Okuma ve müşteri işlemleri |

## Lisans

MIT
