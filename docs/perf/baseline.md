# ParkChargeEV Performans Taban Çizgisi

Ölçüm tarihi: 27.08.2026  
Kaynak commit: `0364ba9`  
Sunucu: yerel `next start`, production build, cache kapalı tarayıcı bağlamı.  
Mobil yöntem: Playwright Pixel 5 + CDP `Emulation.setCPUThrottlingRate(4)`.  
Metrikler: Navigation/Resource Timing, Paint Timing, LCP/LayoutShift/LongTask PerformanceObserver.

> Bu çalışma Lighthouse'ın simüle skorunu değil, aynı makinede tekrar edilebilir CDP ölçümlerini kullanır. INP kullanıcı etkileşimi olmadan ölçülemedi. Hydrate olan React component sayısı framework tarafından doğrudan sunulmadığı için tahmin edilmedi; script etiketi ve JS resource sayısı izleme göstergesi olarak kaydedildi.

| Profil | Rota | HTTP | TTFB | FCP | LCP | CLS | TBT | Long task adet/toplam | JS transfer | CSS transfer | HTML transfer | İstek | Görsel isteği | DOM | Script etiketi |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
desktop | `/` | 200 | 78 ms | Ölçülemedi | Ölçülemedi | 0,000 | 482 ms | 3 / 632 ms | 197,3 KB | 70,8 KB | 37,2 KB | 24 | 8 | 747 | 85
desktop | `/magaza` | 200 | 79 ms | 756 ms | 756 ms | 0,303 | 127 ms | 4 / 327 ms | 250,3 KB | 70,8 KB | 153,5 KB | 60 | 19 | 1757 | 231
desktop | `/arama?q=sarj` | 200 | 45 ms | 896 ms | 896 ms | 0,303 | 336 ms | 7 / 686 ms | 197,3 KB | 70,8 KB | 97,1 KB | 32 | 17 | 1457 | 174
desktop | `/urun/hims-11kw-akilli-tasinabilir-arac-sarj-cihazi` | 200 | 21 ms | 1.176 ms | 1.612 ms | 0,000 | 486 ms | 4 / 686 ms | 207,1 KB | 70,8 KB | 42,2 KB | 20 | 2 | 757 | 96
desktop | `/admin/login` | 200 | 56 ms | 720 ms | 720 ms | 0,000 | 147 ms | 2 / 247 ms | 246,0 KB | 70,8 KB | 14,0 KB | 20 | 0 | 141 | 43
mobile-4x | `/` | 200 | 16 ms | 740 ms | 1.972 ms | 0,000 | 1.244 ms | 10 / 1.744 ms | 207,1 KB | 70,8 KB | 37,2 KB | 23 | 4 | 749 | 87
mobile-4x | `/magaza` | 200 | 43 ms | 720 ms | 2.844 ms | 0,000 | 1.227 ms | 6 / 1.527 ms | 202,9 KB | 70,8 KB | 153,5 KB | 18 | 3 | 1757 | 231
mobile-4x | `/arama?q=sarj` | 200 | 111 ms | 752 ms | 2.496 ms | 0,000 | 1.738 ms | 10 / 2.238 ms | 197,3 KB | 70,8 KB | 94,6 KB | 21 | 6 | 1409 | 126
mobile-4x | `/urun/hims-11kw-akilli-tasinabilir-arac-sarj-cihazi` | 200 | 17 ms | 628 ms | 1.912 ms | 0,000 | 1.264 ms | 11 / 1.814 ms | 207,1 KB | 70,8 KB | 42,2 KB | 21 | 3 | 757 | 96
mobile-4x | `/admin/login` | 200 | 32 ms | 456 ms | 456 ms | 0,000 | 1.101 ms | 5 / 1.351 ms | 246,0 KB | 70,8 KB | 14,0 KB | 20 | 0 | 141 | 43

## Build Süreleri

| Kontrol | Süre | Sonuç |
|---|---:|---|
| `npm run typecheck` | 12,85 sn | Başarılı |
| `npm run lint` | 60,87 sn | Başarılı |
| `npm run build` | 311,40 sn | Başarılı |

Build uyarısı: webpack cache, 195 KiB ve 139 KiB büyük string serileştirmelerinin deserialization maliyeti oluşturduğunu bildirdi.

## Cache ve Veritabanı Notları

- Ana sayfa production build'de statik ve 5 dakika revalidate olarak üretildi.
- Mağaza ve arama route'u query parametreleri nedeniyle dinamik render edildi; veri katmanındaki ürün cache'i 300 saniye.
- Ürün detay route'u `generateStaticParams` ile mevcut slug'lar için SSG ve 5 dakika revalidate olarak üretildi.
- DB sorgu adedi/süresi: **doğrudan ölçülemedi**. Mevcut Drizzle/Postgres istemcisinde query logger kapalı ve Faz 0 kaynak değişikliğine izin vermiyor. Kaynak incelemesinde public katalog ilk cache miss sırasında bir ana sorgu ve altı toplu ilişki sorgusu çalıştırıyor; bu değer ölçüm değil, mimari envanterdir.
