# Admin Faz 1 Kurulum Notlari

## Kapsam

Bu fazda aktif hale getirilen moduller:

- JWT tabanli admin auth ve rol kontrolu
- Dashboard KPI ve temel grafikler
- Urun CRUD + SEO + AI summary alanlari
- Siparis liste / detay / durum guncelleme
- Teklif liste / detay / durum guncelleme
- Audit log ve status history tablolari

## Route Yapisi

- `/admin/login`
- `/admin`
- `/admin/urunler`
- `/admin/urunler/yeni`
- `/admin/urunler/[id]`
- `/admin/siparisler`
- `/admin/siparisler/[id]`
- `/admin/teklifler`
- `/admin/teklifler/[id]`

## API Uclari

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/me`
- `GET /api/admin/dashboard`
- `GET|POST /api/admin/products`
- `GET|PATCH /api/admin/products/[id]`
- `GET /api/admin/orders`
- `GET|PATCH /api/admin/orders/[id]`
- `GET /api/admin/quotes`
- `GET|PATCH /api/admin/quotes/[id]`

## Gerekli Environment Alanlari

- `DATABASE_URL`
- `ADMIN_JWT_SECRET`
- `ADMIN_BOOTSTRAP_NAME`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`
- `ADMIN_MONTHLY_REVENUE_TARGET_KURUS`
- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`

Opsiyonel Supabase alanlari:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

## Veritabani

Drizzle migration dosyasi:

- `drizzle/0000_secret_mulholland_black.sql`

Yeni ana tablolar:

- `admin_users`
- `admin_sessions`
- `audit_logs`
- `quote_requests`
- `quote_activities`
- `order_status_history`
- `product_category_assignments`
- `product_tag_assignments`
- `product_vehicle_compatibilities`
- `product_relations`

## Ilk Giris

1. `.env` icine bootstrap admin bilgilerini yazin.
2. Migration'i Supabase Postgres'e uygulayin.
3. `/admin/login` ekranindan bootstrap hesap ile giris yapin.

## Dogrulanan Komutlar

- `tsc --noEmit`
- `eslint .`
- `next build`
