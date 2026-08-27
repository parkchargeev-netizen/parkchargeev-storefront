# Faz 6 - JavaScript Butcesi

Olcum tarihi: 2026-08-27. Build ve runtime testleri yerel production build uzerinde yapildi.

## Olcum

| Metrik | Faz 0 | Faz 6 | Fark |
| --- | ---: | ---: | ---: |
| Ana sayfa route JS (ham) | 624.9 KB | 409.9 KB | -34.4% |
| Ana sayfa route JS (Brotli) | 161.2 KB | 102.5 KB | -36.4% |
| Ana sayfa First Load JS | 190 KB | 114 KB | -40.0% |
| Shared First Load JS | 183 KB | 104 KB | -43.2% |
| Build suresi | 311.40 sn | 126.28 sn | -59.4% |

Ilk iki satir `.next/app-build-manifest.json` dosyasindaki `/page` JS varliklarinin
ham ve Brotli toplami ile hesaplandi. Build suresi makine ve cache durumuna duyarlidir;
bu nedenle CI kazanci olarak degil, ayni is istasyonundaki yon gosteren olcum olarak ele alinmalidir.

## En Buyuk Chunk Aciklamalari

1. `7294` (441.5 KB ham): Sentry tarayici SDK'si. Ilk route manifestinde degil; `load` ve
   idle sonrasinda dinamik yukleniyor.
2. `3767` (358.7 KB ham): Sentry entegrasyonlarinin devam chunk'i. Ilk render yolundan ayrildi.
3. Ana global CSS (430.9 KB ham): uzun suredir biriken global tasarim katmani. Faz 7'de
   yalnizca kanitlanmis olu kurallar temizlenecek.
4. Tiptap/editor chunk'i: yalnizca admin urun formu rotasinda gerekli. Public storefront
   manifestlerinde bulunmuyor ve Faz 8'de sekme bazli ertelenecek.
5. Next/React framework chunk'lari: App Router ve React runtime'i; kaldirilamaz. Ortak ilk
   yuk boyutu route raporunda 104 KB'a indi.

Next tarafindan uretilen `polyfills` varligi build klasorunde kalir; modern App Router route
manifestleri bu dosyayi istemez. Browserslist destegi Chrome/Edge 91+, Firefox 90+, Safari/iOS
15+ ve Android 10+ olarak netlestirildi. IE, Safari 14 ve daha eski Android tarayicilari destek
hedefinin disindadir.

## Runtime Kaniti

- Sentry: ilk route buyuk Sentry SDK'sini icermedi; 5 Sentry varligi hydrate/load sonrasinda
  istendi. Bilerek tetiklenen hata yerel transport yakalamasinda 3 POST envelope uretti.
- Gizlilik ve maliyet: client trace orani `0.01`, server/edge `0.05`; logs, replay ve PII kapali.
- Veritabani fallback: `DATABASE_URL` bos production sunucusunda `/` 200 (231258 byte),
  `/magaza` 200 (681164 byte) dondu.
- Fallback veri dosyasi surum, kaynak commit ve 24 saat tazelik kontrolu ile korunuyor.
- Eski sessionStorage sepet kaydinda urun snapshot'i yoksa bayat mock urun gostermek yerine
  kayit guvenli bicimde atiliyor.

## Dogrulanamayanlar

Sentry'nin uzak servis paneline girilmedi. SDK'nin hata envelope'u olusturup transport'a
gonderdigi dogrulandi; production Sentry projesinde gorunurluk bu oturumda dogrulanmadi.

