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

- Node.js `20+` veya `22 LTS`
- PostgreSQL

Kurulum:

```bash
npm install
npm run dev
```

Veritabanı:

```bash
npm run db:generate
npm run db:push
```

## Sonraki Adımlar

1. `npm install` ile bağımlılıkları kur
2. `.env.example` dosyasını gerçek ortam değişkenleriyle doldur
3. PostgreSQL bağlantısını aç ve `db:push` çalıştır
4. Gerçek ürün görselleri, marka logoları ve kurumsal içerikleri bağla
5. PayTR canlı anahtarları ve sipariş yazma mantığını tamamla
6. İlk çalıştırma sonrası `npm run typecheck` ve `npm run build` ile doğrula

## Not

Bu çalışma alanında Node.js kurulu olmadığı için uygulama burada çalıştırılamadı. Kod iskeleti, dosya yapısı ve entegrasyon noktaları hazırlanmıştır; ilk çalıştırma sonrası tip/lint ve UI ince ayarlarının yapılması gerekir.
