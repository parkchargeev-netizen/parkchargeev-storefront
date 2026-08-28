# Faz 9 - Performans Regresyon Korumasi

Olcum tarihi: 2026-08-28.

## Uygulanan Korumalar

- GitHub Actions icinde typecheck, cache'li lint, production build, bundle butcesi ve kritik
  rota performans testi eklendi.
- Ortak root layout JS icin `400,000 B` ham ve `100,000 B` Brotli ust siniri kondu.
- Ana sayfa, magaza, urun detayi ve checkout icin rota bazli JS butceleri eklendi.
- Pixel 5 ve 4x CPU profilinde TTFB, LCP ve TBT esiklerini asan kritik rota testi eklendi.
- Public urun linklerinde otomatik Next.js prefetch kapatildi; urun detayi chunk'i ilk ekran
  ana thread calismasindan cikarildi.
- Sentry client monitoring ilk render penceresi disina alindi; SDK 12 saniye sonraki idle
  araliginda yuklenir, global hata yakalama davranisi korunur.
- Cache sozlesmesi, yeni kod kurallari ve tekrar edilebilir olcum komutlari
  `docs/perf/README.md` altinda toplandi.

## Bundle Butcesi

| Hedef | Ham JS | Butce | Brotli JS | Butce |
| --- | ---: | ---: | ---: | ---: |
| Ortak root layout | 354.6 KiB | 390.6 KiB | 88.2 KiB | 97.7 KiB |
| Ana sayfa | 372.4 KiB | 410.2 KiB | 94.6 KiB | 107.4 KiB |
| Magaza | 387.2 KiB | 429.7 KiB | 99.4 KiB | 112.3 KiB |
| Urun detayi | 401.2 KiB | 444.3 KiB | 102.9 KiB | 117.2 KiB |
| Checkout | 402.4 KiB | 444.3 KiB | 100.9 KiB | 115.2 KiB |

`PERF_MAX_COMMON_JS_RAW_BYTES=1` ile yapilan negatif test exit code 1 verdi ve
`common root layout JS budget exceeded` mesaji uretti. Esik geri alindiktan sonra normal
butce kosusu basarili oldu.

## Kritik Rota Olcumu

Yontem: yerel production build, Playwright Pixel 5, CDP 4x CPU throttle, sicak rota istegi,
rota basina uc ornegin medyani ve bilinen analytics istekleri engellenmis first-party CI profili.

| Rota | TTFB / esik | LCP / esik | TBT / esik | Long task |
| --- | ---: | ---: | ---: | ---: |
| `/` | 13 / 1,000 ms | 1,416 / 3,600 ms | 742 / 2,100 ms | 6 |
| `/magaza` | 37 / 1,000 ms | 2,208 / 5,000 ms | 934 / 2,100 ms | 5 |
| `/urun/hims-11kw-akilli-tasinabilir-arac-sarj-cihazi` | 15 / 1,000 ms | 1,544 / 3,800 ms | 988 / 2,200 ms | 7 |
| `/checkout` | 31 / 1,000 ms | 1,444 / 4,500 ms | 569 / 2,200 ms | 5 |

## Faz 0 - Son Durum

Farkli birim veya olcum yontemleri birbiriyle karistirilmadi. Rota metrikleri ayni yerel
production ve mobil 4x CPU profiliyle karsilastirildi.

| Metrik | Faz 0 | Son | Fark |
| --- | ---: | ---: | ---: |
| Public asset toplam boyutu | 2,623,451 B | 619,558 B | -76.4% |
| Ana sayfa route JS ham | 624.9 KiB | 372.4 KiB | -40.4% |
| Ana sayfa route JS Brotli | 161.2 KiB | 94.6 KiB | -41.3% |
| Ana sayfa First Load JS | 190 kB | 114 kB | -40.0% |
| Shared First Load JS | 183 kB | 105 kB | -42.6% |
| Production build | 311.40 sn | 111.2 sn | -64.3% |
| ESLint tam/soguk kosu | 94.6 sn | 46.32 sn | -51.0% |
| ESLint sicak cache kosusu | 94.6 sn | 4.92 sn | -94.8% |
| Kaynak CSS | 447,920 B | 433,428 B | -3.2% |
| Animation bildirimi | 168 | 145 | -13.7% |
| Ana sayfa mobil LCP | 1,972 ms | 1,416 ms | -28.2% |
| Ana sayfa mobil TBT | 1,244 ms | 742 ms | -40.4% |
| Magaza mobil LCP | 2,844 ms | 2,208 ms | -22.4% |
| Magaza mobil TBT | 1,227 ms | 934 ms | -23.9% |
| Urun mobil LCP | 1,912 ms | 1,544 ms | -19.2% |
| Urun mobil TBT | 1,264 ms | 988 ms | -21.8% |

Ana sayfa, magaza ve urun rotalarinda hem LCP hem TBT medyanlari Faz 0'a gore dusmustur.
CI kapisi sonraki buyumeyi durdurur. Canli RUM p75 verisi olmadan bu metrikler icin
genelleme yapilmaz; yerel kosu first-party laboratuvar profili olarak ele alinmalidir.

## Dogrulama

- `npm run typecheck`: basarili.
- `npm run lint`: basarili.
- `npm run build`: basarili; 88 statik sayfa, Next 15.5.24.
- `npm run verify:performance-budget`: basarili.
- `npm run verify:performance-routes`: dort rota da basarili.
- `npm audit --audit-level=high`: basarili; 0 acik.
- Negatif bundle butce testi: beklenen exit code 1 dogrulandi.
- `PERF_BASE_URL=http://127.0.0.1:3103 node scripts/capture-perf-screenshots.mjs .tmp/perf-screenshots`:
  desktop/mobile ana sayfa, magaza, urun detayi ve admin login screenshotlari uretildi.

## Risk ve Geri Alma

Performans scriptleri uygulama runtime'ina girmez. CI esikleri ortam degiskeniyle gecici olarak
daraltilabilir; kalici esik degisikligi olcum kaniti gerektirir. Faz 9 tek commit revert edilerek
uygulama koduna dokunmadan geri alinabilir.

## Dogrulanamayanlar

- Canli Cloudflare/Vercel RUM p75 ve gercek Android cihaz metrikleri bu yerel kosuda olculmedi.
- CI first-party testi analytics ve lead scriptlerini engeller; bunlarin canli etkisi ayri
  Lighthouse/RUM izlemesine tabidir.
- Kritik rota tablosu rota basina uc ornek medyanidir; uzun donemli dagilim veya p75 degildir.
