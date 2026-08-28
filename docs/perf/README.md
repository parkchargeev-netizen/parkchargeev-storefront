# ParkChargeEV Performans Rehberi

Bu klasor performans taban cizgisini, faz raporlarini ve regresyon kapilarini saklar.
Butceler rastgele skor hedefleri degil, ayni production build uzerinde olculen degerlere
kontrollu CI payi eklenerek belirlenir.

## Cache Sozlesmesi

| Veri veya rota | Strateji | Sure | Invalidation |
| --- | --- | ---: | --- |
| Public site layout | ISR | 300 sn | Site ayari ve navigasyon mutation'lari |
| Public urun listesi | `unstable_cache` | 300 sn | `public-products` etiketi ve katalog rotalari |
| Urun slug/detay | SSG + `unstable_cache` | 300 sn | Urun slug rotasi ve `public-products` etiketi |
| Site ayarlari/navigasyon/sayfalar | `unstable_cache` | 300 sn | Ilgili `site-*` etiketi ve public layout |
| Blog listesi | `unstable_cache` | 300 sn | `public-blog` etiketi ve blog rotalari |
| Admin katalog/urun lookup | `unstable_cache` | 120 sn | Admin mutasyonlarindan sonra ilgili etiket |

Katalog mutation'lari `src/server/catalog/cache.ts` uzerindeki merkezi invalidation
sozlesmesini kullanir. Urun ekleme, guncelleme, arsivleme, silme veya ice aktarma sonrasinda
bu sozlesme atlanmamalidir; aksi halde public fiyat ve stok bayat kalabilir.

## Yeni Kod Kurallari

- Listeleme ekranlarinda tam `ProductModel` client'a tasinmaz; kart icin hedefli DTO kullanilir.
- Liste sorgulari limit/pagination olmadan tum katalogu yuklemez.
- Kart basina ayri global state/provider hydrate edilmez; grid seviyesinde tek koordinasyon kullanilir.
- Liste kartinda urun basina ilk yukte tek ana gorsel bulunur. Hover gorseli uygun cihazda lazy yuklenir.
- LCP gorseli lazy yapilmaz; diger medya dogru `sizes`, boyut ve lazy stratejisi kullanir.
- Ambient/motion katmani admin, checkout, sepet ve hesap gibi operasyon rotalarina eklenmez.
- Surekli animasyonlar `transform` ve `opacity` ile calisir; reduced-motion tercihi korunur.
- Admin editor, tablo ve buyuk form sekmeleri ilk ekranda gerekmiyorsa dinamik yuklenir.
- Yeni third-party script ilk render yoluna eklenmez; ihtiyac ve yukleme zamani belgelenir.
- Public liste/kart linklerinde agir hedef sayfalar icin otomatik prefetch acilmadan once
  bundle etkisi olculur.

## Otomatik Butceler

`npm run verify:performance-budget`, production build manifestini denetler. Ortak root layout
JS butcesi `400,000 B` ham ve `100,000 B` Brotli'dir. Bu, Faz 9 olcumu olan
`354.6 KiB / 88.2 KiB` degerine yaklasik yuzde 10 regresyon payi verir. Kritik public rotalar
icin ayrica rota bazli bundle sinirlari vardir.

`npm run verify:performance-routes`, calisan production sunucusunda Pixel 5 ve 4x CPU profiliyle
`/`, `/magaza`, `/urun/<slug>` ve `/checkout` rotalarinin TTFB, LCP ve TBT degerlerini denetler.
CI kararliligi icin her rotada uc ornegin medyani alinir. GTM, Analytics, Clarity ve
Sendnomi istekleri bu first-party kapisinda
engellenir. Third-party etkisi Lighthouse/canli RUM ile ayrica izlenmelidir.

## Olcum Komutlari

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run verify:performance-budget

# Ayri bir terminalde production sunucusu:
npm.cmd run start -- --port 3103
$env:PERF_BASE_URL = "http://127.0.0.1:3103"
npm.cmd run verify:performance-routes

# Gorsel regresyon kaniti:
node scripts/capture-perf-screenshots.mjs .tmp/perf-screenshots
```

Butceyi kalici olarak genisletmeden once yeni ve eski bundle raporu, kritik rota olcumu ve
gerekce dokumante edilmelidir. Esik sadece CI'yi yesile cevirmek icin yukseltilmez.
