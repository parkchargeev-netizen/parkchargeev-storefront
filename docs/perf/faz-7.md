# Faz 7 - Kanitli CSS Temizligi

Olcum tarihi: 2026-08-27.

## Uygulanan Guvenli Temizlik

Faz 5'te DOM'dan tamamen kaldirilan `GlobalAmbientLayer` bileşeninin iki global stil
dosyasinda kalan secicileri parser ile temizlendi. Karma `:where(...)` kurallarinda
`site-ambient` ve `premium-section` secicileri korunarak yalnizca `global-ambient`
uyeleri ayiklandi. Urun karti v3-v6.1 katmanlari, dead-css envanterinde kesin kanit
olmadigi icin silinmedi.

| Metrik | Once | Sonra | Fark |
| --- | ---: | ---: | ---: |
| Kaynak CSS byte | 447,920 | 433,428 | -14,492 (-3.2%) |
| Kaynak CSS satir | 18,055 | 17,601 | -454 |
| Kural/accolade sayimi | 2,670 | 2,593 | -77 |
| Keyframe | 85 | 81 | -4 |
| Animation bildirimi | 168 | 145 | -23 |
| `blur()` | 65 | 61 | -4 |
| `will-change` | 28 | 25 | -3 |
| `!important` | 921 | 918 | -3 |
| Uretilen CSS (ham/Brotli) | 447.9 KB / yaklasik 55 KB | 443.0 KB / 53.9 KB | ham -1.1% |
| Lint (sicak dosya cache'i) | 45.25 sn | 11.77 sn | -74.0% |

Production build 94.78 saniyede tamamlandi. `typecheck`, `lint` ve `build` yesil.

## Risk ve Geri Alma

Degisiklik sadece artik render edilmeyen sinif ailesine baglidir. Geri alma tek Faz 7
commitinin revert edilmesiyle yapilabilir. Urun karti katmanlari ve admin/public global CSS
ayrimi, gorsel esdegerlik kaniti olmadan uygulanmadi; bu iki alanda kanitsiz toplu silme
planda acikca yasaklanmistir.

## Dogrulanamayanlar

- Veritabanindan donen urun sayisi iki screenshot kosusu arasinda degistigi icin tam sayfa
  piksel karsilastirmasi deterministik degildi; 15.5 MB gecersiz kanit repo'ya eklenmedi.
- Admin ve public rotalar halen ayni Tailwind/global CSS derlemesini paylasiyor. Admin CSS'ini
  ana sayfanin %20'si altina indirmek, birden cok root layout ve admin stillerinin modullere
  tasinmasini gerektiren ayri bir gorsel regresyon projesidir.
- Lighthouse `unused CSS` byte farki yerel kosuda guvenilir bicimde ayrıştırilamadi.

