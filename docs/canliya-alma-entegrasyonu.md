# ParkChargeEV Canliya Alma Entegrasyonu Runbook

Tarih: 23 Haziran 2026

Kapsam: parkchargeev.com production yayini, PayTR canli odeme, Vercel/Next.js runtime, PostgreSQL/Supabase, admin operasyonu, SEO indeksleme, test ve geri donus plani.

Bu dosya `PAYTR_ENTEGRASYON_NOTLARI.md` dosyasini tamamlar. PayTR teknik kurallari orada, canliya alma operasyon akisi burada tutulur.

## 1. Canliya Alma Hedefi

Canliya alma hedefi yalnizca sitenin yayina cikmasi degildir. Hedef su dort akisin production ortamda izlenebilir sekilde calismasidir:

1. Ziyaretci ana sayfa, magaza, urun detay, sepet ve odeme ekranlarinda kesintisiz ilerler.
2. Siparis tutari server tarafinda yeniden hesaplanir.
3. Kart dogrulamasi PayTR guvenli odeme akisi uzerinden tamamlanir.
4. Siparisin kesin odeme durumu PayTR callback ile dogrulanir.

## 2. Mevcut Entegrasyon Durumu

Kodda bulunan kritik yuzeyler:

| Alan | Dosya | Durum |
|---|---|---|
| PayTR payload ve hash yardimcilari | `src/lib/paytr.ts` | iFrame ve Direkt API payload uretiyor, callback hash dogruluyor. |
| Checkout siparis olusturma | `src/server/paytr/checkout-order.ts` | Sepeti server tarafinda fiyatlandirmak icin kullaniliyor. |
| Direkt API form hazirlama | `src/app/api/paytr/direct-form/route.ts` | Kart formu icin PayTR'a post edilecek signed alanlari uretiyor. |
| PayTR callback | `src/app/api/paytr/callback/route.ts` | Hash, tutar, para birimi, idempotency ve stok dusme kontrolleri yapiyor. |
| Checkout UI | `src/components/shop/checkout-page-client.tsx` | Kart verisini gizli form ile `https://www.paytr.com/odeme` adresine gonderiyor. |
| Runtime smoke | `scripts/runtime-smoke.mjs` | DB ve PayTR env kontrolleri yapiyor. |

## 3. Production Ortam Degiskenleri

Canli ortamda zorunlu minimum set:

```env
NEXT_PUBLIC_SITE_URL=https://parkchargeev.com
NEXT_PUBLIC_COMPANY_NAME=ParkChargeEV
NEXT_PUBLIC_SUPPORT_PHONE=05514914320
NEXT_PUBLIC_SUPPORT_EMAIL=info@parkchargeev.com
NEXT_PUBLIC_WHATSAPP_PHONE=905514914320

DATABASE_URL=<production-postgres-url>
DIRECT_URL=<production-postgres-direct-url>
ADMIN_JWT_SECRET=<strong-random-secret>
CUSTOMER_JWT_SECRET=<strong-random-secret>

PAYTR_MERCHANT_ID=<paytr-merchant-id>
PAYTR_MERCHANT_KEY=<paytr-merchant-key>
PAYTR_MERCHANT_SALT=<paytr-merchant-salt>
PAYTR_TEST_MODE=0
PAYTR_DEBUG_ON=0
PAYTR_CURRENCY=TL
PAYTR_TIMEOUT_LIMIT=30
PAYTR_REQUEST_TIMEOUT_MS=12000

NEXT_PUBLIC_GA_MEASUREMENT_ID=<optional>
NEXT_PUBLIC_SUPABASE_URL=<if-used>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<if-used>
SUPABASE_SERVICE_ROLE_KEY=<if-used>
SUPABASE_STORAGE_BUCKET=product-media
```

Canli ortamda olmamasi gerekenler:

- `PAYTR_TEST_MODE=1`
- `PAYTR_DEBUG_ON=1`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- Bos `DATABASE_URL`
- Bos PayTR merchant secretlari
- Client tarafina sizan `PAYTR_MERCHANT_KEY` veya `PAYTR_MERCHANT_SALT`

## 4. PayTR Panel Ayarlari

PayTR panelinde canli domain icin kontrol edilecek ayarlar:

| Ayar | Deger |
|---|---|
| Bildirim URL | `https://parkchargeev.com/api/paytr/callback` |
| Basarili donus URL | Uygulama tarafinda `https://parkchargeev.com/odeme?status=success&oid=<merchantOid>` olarak uretilir. |
| Basarisiz donus URL | Uygulama tarafinda `https://parkchargeev.com/odeme?status=failed&oid=<merchantOid>` olarak uretilir. |
| Test modu | Canlida kapali. |
| Debug | Canlida kapali. |
| Direkt API yetkisi | Direkt API kullanilacaksa PayTR tarafinda acik olmali. |

Onemli kural:

`merchant_ok_url` ve `merchant_fail_url` siparisi onaylamaz. Kullaniciya bilgi verir. Siparisin kesin durumu yalnizca `/api/paytr/callback` ile degismelidir.

## 5. Domain, DNS ve Vercel Kontrolu

Canliya alma oncesi:

1. `parkchargeev.com` ve gerekli ise `www.parkchargeev.com` Vercel projesine baglanir.
2. DNS kayitlari Vercel yonlendirmesine uygun hale getirilir.
3. SSL sertifikasi aktif ve gecerlidir.
4. `NEXT_PUBLIC_SITE_URL` canonical domain ile aynidir.
5. `robots.txt`, `sitemap.xml`, `manifest` ve `llms.txt` production URL uzerinden okunur.
6. Eski domain veya eski site varsa 301 yonlendirme plani kontrol edilir.

## 6. Veritabani ve Admin Kontrolu

Canli ortam oncesi:

1. Production DB yedegi veya rollback snapshot alin.
2. Migration durumu kontrol et.
3. Admin bootstrap bilgileri guvenli sekilde tanimla.
4. Urun, kategori, medya, stok, fiyat ve varyant verilerini kontrol et.
5. Admin panel login, urun guncelleme, siparis listesi, PayTR operasyon ekrani ve audit log test edilir.

Kritik kabul:

- Bos katalogla canliya cikilmaz.
- Fiyati olmayan veya stogu yanlis urun canliya alinmaz.
- Gorselsiz kritik urunler ana sayfa/magazada one cikarilmaz.

## 7. Canliya Alma Test Matrisi

### 7.1 Otomatik kontroller

Canliya alma oncesi lokal veya preview ortaminda:

```bash
npm run verify:runtime
npm run typecheck
npm run lint
npm run build
npm run verify:uiux
npm run verify:architecture
```

Tam release kapisi:

```bash
npm run verify:release
```

Not: `verify:release` e2e, a11y ve visual testleri de calistirir. Production credential veya dis servis gerektiren durumlarda preview/staging ortaminda tamamlanmalidir.

### 7.2 Manuel kritik akışlar

| Akis | Beklenen sonuc |
|---|---|
| Ana sayfa acilis | Hero, rota kartlari, CTA ve urun seridi gorunur. |
| Magaza arama | Arama sonucu filtrelenir, URL query ile korunur. |
| Magaza secici | 4 karar alanindan sonra ilgili urunler listelenir. |
| Urun detay | Gorsel, fiyat, stok, guc/kurulum/uyum ve sepete ekle gorunur. |
| Sepet | Miktar degisir, urun kaldirilir, KDV ve toplam dogru gorunur. |
| Checkout validasyon | Eksik ad/e-posta/telefon/adres icin Turkce hata gorunur. |
| PayTR hazirlama | Siparis olusur, signed form PayTR adresine post edilir. |
| Basarili PayTR donusu | Kullanici bilgilendirilir, kesin durum callback/polling ile gelir. |
| Basarisiz PayTR donusu | Kullanici bilgilendirilir, sepet ve destek yolu korunur. |
| PayTR callback duplicate | Ikinci callback `OK` ile idempotent doner, stok iki kez dusmez. |
| Tutar uyumsuz callback | Siparis paid olmaz, log uyarisi uretilir. |
| Para birimi uyumsuz callback | Siparis paid olmaz, log uyarisi uretilir. |
| Admin siparis | Siparis ve odeme durumu panelde okunur. |

## 8. PayTR Test Senaryolari

Canli mod oncesi staging/test:

1. Basarili kart testi.
2. Basarisiz kart testi.
3. Kullanici PayTR ekranindan geri donmeden sayfayi kapatir.
4. PayTR `merchant_ok_url` doner ama callback gec gelir.
5. Callback duplicate gelir.
6. Callback hash bozuk gelir.
7. Callback tutar uyumsuz gelir.
8. Callback currency `TL` ve `TRY` varyasyonlariyla dogrulanir.
9. PayTR direct API yetkisi kapaliysa kullaniciya temiz hata verilir.

Canli modda ilk islem:

- Dusuk tutarli gercek siparis ile test edilir.
- PayTR panelinde islem gorulur.
- Admin panelde siparis `paid` olur.
- Stok bir kez duser.
- Loglarda bad hash, amount mismatch veya runtime config error gorulmez.

## 9. Izleme ve Alarm

Ilk 24 saat izlenecek log eventleri:

- `paytr.direct_form.created`
- `paytr.direct_form.failed`
- `paytr.direct_form.runtime_config_error`
- `paytr.callback.processed`
- `paytr.callback.duplicate_ignored`
- `paytr.callback.bad_hash`
- `paytr.callback.amount_mismatch`
- `paytr.callback.currency_mismatch`
- `paytr.callback.order_not_found`
- `paytr.callback.failed`

Frontend izleme:

- `pce_checkout_start`
- `pce_checkout_paytr_submit`
- `pce_add_to_cart`
- `pce_selector_result_click`
- `pce_persona_route_click`

Onerilen ek eventler:

- `pce_checkout_validation_error`
- `pce_paytr_return_success`
- `pce_paytr_return_failed`
- `pce_order_paid`
- `pce_order_failed`

## 10. Go / No-Go Kapisi

Canliya alma oncesi asagidaki tablo "Go" olmadan production acilmaz:

| Kapi | Go kriteri |
|---|---|
| Domain | `https://parkchargeev.com` SSL ve canonical aktif. |
| Runtime env | DB, PayTR, admin secretlari eksiksiz. |
| PayTR | Bildirim URL production domain, test/debug kapali. |
| Build | `npm run build` basarili. |
| Runtime smoke | `npm run verify:runtime` kritik hatasiz. |
| Checkout | Basarili ve basarisiz PayTR testleri tamam. |
| Callback | Hash/tutar/currency/idempotency testleri tamam. |
| Admin | Siparis ve odeme durumu gorunuyor. |
| SEO | sitemap, robots, metadata ve llms.txt erisilebilir. |
| Geri donus | Onceki deployment ve DB snapshot hazir. |

## 11. Geri Donus Plani

Odeme veya siparis blokajinda:

1. Yeni deployment Vercel uzerinden onceki saglam deployment'a rollback edilir.
2. PayTR test/debug ayarlari canli ortamda acilmaz; once staging'de sorun tekrar uretilir.
3. Problemli siparisler admin panelden manuel incelenir.
4. PayTR panelindeki islem durumu ile DB siparis durumu karsilastirilir.
5. Stok dusumu hatasi varsa manuel stok duzeltme notu girilir.
6. Kullaniciya kart bilgisinin sitede saklanmadigi ve odeme durumunun kontrol edildigi net dille iletilir.

## 12. Canliya Alma Takvimi

### T-7 gun

- Production env listesi tamamlanir.
- PayTR panel erisimi ve Direkt API yetkisi dogrulanir.
- Urun, stok, fiyat ve medya kontrol edilir.
- SEO title/description ve schema kontrolu baslatilir.

### T-3 gun

- Preview ortaminda tam akış testi yapilir.
- Admin panel test edilir.
- Siparis, lead ve PayTR transaction kayitlari dogrulanir.
- E2E/a11y smoke tamamlanir.

### T-1 gun

- DNS/SSL hazirligi kontrol edilir.
- DB snapshot alinir.
- PayTR Bildirim URL canli domain olarak ayarlanir.
- `PAYTR_TEST_MODE=0`, `PAYTR_DEBUG_ON=0` hazirlanir.

### T gun

- Production deploy.
- `npm run verify:runtime` production env ile calistirilir.
- Dusuk tutarli canli test siparisi yapilir.
- Admin panel ve PayTR panel kontrol edilir.
- Loglar 60 dakika takip edilir.

### T+1 gun

- Checkout terkleri, callback hatalari ve admin siparisleri incelenir.
- En cok tiklanan persona rotalari ve urun secici sonuclari raporlanir.
- Ilk CRO iyilestirme listesi cikarilir.

## 13. Kaynaklar

- PayTR iFrame API 1. Adim: https://dev.paytr.com/iframe-api/iframe-api-1-adim
- PayTR iFrame API 2. Adim: https://dev.paytr.com/iframe-api/iframe-api-2-adim
- PayTR Direkt API 1. Adim: https://dev.paytr.com/direkt-api/direkt-api-1-adim
- ParkChargeEV PayTR notlari: `docs/PAYTR_ENTEGRASYON_NOTLARI.md`
- ParkChargeEV pazar/persona raporu: `docs/ui-ux/parkchargeev-2026-canli-pazar-persona-ux-satis-raporu.md`
