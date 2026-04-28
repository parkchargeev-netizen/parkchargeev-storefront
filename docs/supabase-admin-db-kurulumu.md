# Supabase Admin DB Kurulumu

## Kisa Sonuc

Sadece su endpoint ile veritabani semasi olusturulamaz:

- `https://djjiiyrjdltxfvrbxrom.supabase.co/rest/v1/`

Sebep:

- Supabase `rest/v1` Data API, mevcut veritabani semasindan otomatik uretilir.
- Yani once tablo ve tipler SQL ile olusur, sonra `rest/v1` bunlari expose eder.

Supabase'in resmi dokumani buna iki temel yol oneriyor:

- SQL Editor uzerinden SQL calistirmak
- veritabanina dogrudan baglanip SQL calistirmak

## Bu Repoda Hazir Olanlar

Bu proje icin gerekli sema zaten mevcut:

- [drizzle/0000_secret_mulholland_black.sql](/c:/Users/ynsmr/Desktop/PARKCHARGEEVNEW/drizzle/0000_secret_mulholland_black.sql:1)

Ben ek olarak uzak Supabase veritabanina bu semayi tek komutla uygulayacak script'i hazirladim:

- [scripts/bootstrap-supabase-db.mjs](/c:/Users/ynsmr/Desktop/PARKCHARGEEVNEW/scripts/bootstrap-supabase-db.mjs:1)

NPM komutu:

- `npm run db:bootstrap:supabase`

Script sema zaten hazirsa migration'i tekrar uygulamaz. Ardindan
`ADMIN_BOOTSTRAP_EMAIL` ve `ADMIN_BOOTSTRAP_PASSWORD` degerleriyle
superadmin hesabi olusturur veya mevcut hesabi gunceller.

## Gereken Tek Yetki

Bunu gercek Supabase projesinde benim uygulayabilmem icin sunlardan biri gerekli:

1. `DATABASE_URL`
2. Supabase SQL Editor erisimi
3. Supabase Management API icin uygun access token ve SQL calistirma yetkisi

En kolay yol:

- Supabase project database connection string

Ornek format:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.djjiiyrjdltxfvrbxrom.supabase.co:5432/postgres
```

## Kurulum Adimi

PowerShell:

```powershell
.\scripts\npm-local.ps1 run db:bootstrap:supabase
```

Alternatif:

- Supabase SQL Editor'a `drizzle/0000_secret_mulholland_black.sql` icerigini yapistirip calistirabilirsin.

## Kurulum Sonrasi

Admin panelin tam calismasi icin su env alanlari da gerekli:

- `DATABASE_URL`
- `DIRECT_URL`
- `ADMIN_JWT_SECRET`
- `ADMIN_BOOTSTRAP_NAME`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`

## Resmi Kaynaklar

- Supabase Data REST API
  - https://supabase.com/docs/guides/api/data-apis
- Supabase Tables and Data
  - https://supabase.com/docs/guides/database/tables
- Supabase Creating API Routes
  - https://supabase.com/docs/guides/api/creating-routes
