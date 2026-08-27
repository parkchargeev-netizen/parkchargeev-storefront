# ParkChargeEV Bundle Envanteri

Yöntem: güncel production build altındaki JS/CSS assetleri Node zlib ile ham, gzip ve Brotli olarak ölçüldü. Marker sütunu minified chunk içinde ilgili paket adının bulunmasını gösterir; boyutun tamamının o pakete ait olduğu anlamına gelmez.

## En Büyük 15 Asset

| Asset | Ham | Gzip | Brotli | Marker |
|---|---:|---:|---:|---|
| `static/css/184a8162d42606b6.css` | 420,3 KB | 65,6 KB | 50,2 KB | - |
| `static/chunks/3434-b74af27ac959e6a3.js` | 402,6 KB | 122,9 KB | 100,3 KB | sentry |
| `static/chunks/main-48c32e1d15afd804.js` | 261,3 KB | 80,8 KB | 68,8 KB | sentry |
| `static/chunks/3943.409731d3f9f40f81.js` | 196,8 KB | 63,5 KB | 54,3 KB | sentry, tiptap |
| `static/chunks/framework-a1da64928df0abe4.js` | 185,7 KB | 58,6 KB | 49,9 KB | sentry |
| `static/chunks/4bd1b696-f94129cdfcc25a36.js` | 169,3 KB | 53,2 KB | 45,8 KB | sentry |
| `static/chunks/4669-681d3202d6893b70.js` | 129,1 KB | 33,7 KB | 29,7 KB | sentry |
| `static/chunks/polyfills-42372ed130431b0a.js` | 110,0 KB | 38,7 KB | 34,3 KB | - |
| `static/chunks/6672-250e3c75fffb2eb0.js` | 95,1 KB | 19,8 KB | 17,2 KB | sentry |
| `static/chunks/70e0d97a.1ba7bf991f7e2b50.js` | 94,3 KB | 29,9 KB | 26,5 KB | sentry |
| `static/chunks/54a60aa6.62244baf3ae4282f.js` | 78,8 KB | 24,8 KB | 22,0 KB | sentry, tiptap |
| `static/chunks/2135-1484ec5d015ec2cc.js` | 53,0 KB | 13,9 KB | 12,5 KB | sentry |
| `static/chunks/79-bb69117a1874546e.js` | 42,1 KB | 7,7 KB | 6,7 KB | sentry |
| `static/chunks/4528-bb378eb1f904f06a.js` | 38,3 KB | 10,2 KB | 9,0 KB | sentry |
| `static/chunks/app/(site)/sepet/page-20e160d19c516db1.js` | 34,2 KB | 10,1 KB | 9,0 KB | sentry |

## Rota Bütçeleri

| Rota grubu | Ham | Gzip | Brotli | Asset sayısı |
|---|---:|---:|---:|---:|
| layout | 1.023,7 KB | 250,0 KB | 203,5 KB | 7 |
| home | 1.045,2 KB | 258,8 KB | 211,4 KB | 10 |
| store | 1.061,9 KB | 264,5 KB | 216,5 KB | 10 |
| search | 1.045,2 KB | 258,8 KB | 211,4 KB | 10 |
| product | 1.074,4 KB | 267,3 KB | 218,9 KB | 10 |
| checkout | 1.082,7 KB | 268,8 KB | 220,3 KB | 11 |
| adminLogin | 1.215,0 KB | 297,6 KB | 245,4 KB | 11 |
| adminProductForm | 1.316,9 KB | 319,9 KB | 264,8 KB | 13 |

## Bulgular

- Ortak layout tek başına 203,5 KB Brotli JS+CSS taşıyor.
- En büyük CSS asseti 420,3 KB ham / 50,2 KB Brotli.
- En büyük ortak JS chunk'ı Sentry marker'ı içeriyor ve 402,6 KB ham / 100,3 KB Brotli.
- Admin ürün formu rota bütçesi 264,8 KB Brotli.
- Bundle analyzer paketi projede bulunmadığı ve Faz 0 yeni bağımlılık eklemeyi yasakladığı için webpack HTML analyzer üretilmedi; app-build-manifest ve sıkıştırılmış asset ölçümü kullanıldı.
