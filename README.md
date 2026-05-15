# ParkChargeEV Web Projesi

Bu çalışma alanı, ParkChargeEV için hız, performans, güvenlik, SEO ve AI arama görünürlüğü odaklı yeni e-ticaret sitesinin başlangıç iskeletini içerir.

## İçerik

- `docs/PARKCHARGEEV_2026_STRATEJIK_E_TICARET_PROJESI.md`
  ParkChargeEV analizi, rakip araştırması, pazar özeti, SEO/GEO/AIEO stratejisi, bilgi mimarisi ve teknik kararlar
- `docs/PAYTR_ENTEGRASYON_NOTLARI.md`
  PayTR iFrame ödeme akışı ve entegrasyon notları
- `src/`
  Next.js App Router tabanlı başlangıç uygulama iskeleti
- `src/server/db/schema.ts`
  E-ticaret ve lead yönetimi için veri modeli başlangıcı

## Hazır Modüller

- Ana sayfa: ürün + kurumsal çözüm + içerik otoritesi kurgusu
- Mağaza: ürün listesi ve ürün detay sayfaları
- Kurumsal çözümler: liste ve detay sayfaları
- Blog: liste ve detay sayfaları
- İletişim / teklif toplama: `api/lead` ile bağlı form
- Ödeme: PayTR token ve callback uçları
- SEO: metadata, JSON-LD, sitemap, robots, arama sayfası
- Güvenlik: temel CSP, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`

## Seçilen Teknoloji

- Next.js `15.5.3`
- React `19.2`
- Tailwind CSS `4.1`
- TypeScript
- PostgreSQL
- Drizzle ORM
- PayTR iFrame API

## Neden Bu Stack?

- Next.js App Router, server rendering, metadata üretimi, sitemap/robots ve düşük JS maliyeti ile SEO için güçlü bir temel sağlar.
- Tailwind CSS 4, tasarım ekranlarındaki utility yaklaşımını hızlı biçimde üretim koduna taşımayı kolaylaştırır.
- PostgreSQL + Drizzle, ürün, sipariş, lead ve ödeme kayıtlarını aynı veri modelinde performanslı biçimde tutar.
- PayTR iFrame modeli, PCI yükünü azaltırken ödeme akışını sunucu tarafında güvenli biçimde yönetmeye izin verir.

## Başlangıç

Ön koşul:

- PostgreSQL
- Node.js `20+` veya `22 LTS`

Repo içinde taşınabilir bir Node kurulumu da bulunur: `.tools/node-v22.22.2-win-x64`.

Kurulum:

```bash
npm install
npm run dev
```

PowerShell üzerinde `node` veya `npm` PATH'te yoksa:

```powershell
.\scripts\npm-local.ps1 install
.\scripts\npm-local.ps1 run dev
```

Veritabanı:

```bash
npm run db:generate
npm run db:push
```

## Doğrulama

Runtime smoke check:

```bash
npm run verify:runtime
```

Teknik mimari kalite kapısı:

```bash
npm run verify:architecture
```

UI/UX kalite kapısı:

```bash
npm run verify:uiux
```

Admin smoke:

```bash
npm run verify:admin
```

Playwright E2E:

```bash
npm run verify:e2e
```

Accessibility smoke:

```bash
npm run verify:a11y
```

Visual regression smoke:

```bash
npm run verify:visual
```

Uygulama doğrulaması:

```bash
npm run verify:app
```

Release öncesi tam kontrol:

```bash
npm run verify:release
```

PowerShell üzerinde lokal Node ile aynı doğrulama:

```powershell
.\scripts\npm-local.ps1 run verify:release
```

`verify:runtime` aşağıdaki kritik kontrolleri yapar:

- `DATABASE_URL` var mı
- PostgreSQL bağlantısı gerçekten kurulabiliyor mu
- `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` tanımlı mı
- Lokal test modunda `PAYTR_TEST_USER_IP` önerisi gerekiyor mu

`verify:architecture` aşağıdaki kontrolleri yapar:

- `docs/technical-architecture` altındaki ParkChargeEV'e uyarlanmış teknik mimari audit paketi mevcut mu
- Next.js, Drizzle, auth, admin, site, runtime config ve smoke test gibi kritik katman dosyaları mevcut mu
- API route handler dosyaları HTTP method export ediyor mu
- Release scriptleri mimari, admin, E2E, accessibility ve visual kalite kapılarını çalıştırıyor mu
- Kaynak ve dokümanlarda bilinen token/secret kalıpları var mı

`verify:uiux` aşağıdaki kontrolleri yapar:

- `docs/ui-ux` altındaki ParkChargeEV'e uyarlanmış UI/UX checklist ve prompt seti mevcut mu
- Mağaza, ürün, sepet, ödeme ve admin kritik rota dosyaları mevcut mu
- Saf `#` link, `javascript:` href ve boş event handler gibi bariz ölü kontrol kalıpları var mı

`verify:e2e`, `verify:a11y` ve `verify:visual` Playwright ile gerçek tarayıcıda çalışır:

- Admin login -> dashboard -> temel modül navigasyonu
- Mağaza -> ürün -> sepet -> ödeme akışı
- Kritik sayfalarda axe tabanlı accessibility smoke
- Visual smoke testleri tanımlıysa screenshot baseline

## Ortam Değişkenleri

Minimum canlı doğrulama için:

- `DATABASE_URL`
- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`

Lokal PayTR testlerinde önerilen ek değişken:

- `PAYTR_TEST_USER_IP`

Eksik runtime ayarları artık API tarafında sessiz `500` yerine `503` ve yapılandırma detaylarıyla döner.
