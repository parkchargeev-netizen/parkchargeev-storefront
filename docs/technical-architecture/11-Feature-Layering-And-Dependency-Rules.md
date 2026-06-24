# ParkChargeEV Feature Layering And Dependency Rules

ParkChargeEV public web deneyimi, iş yeteneklerine göre `src/features` altında
modülerleştirilir. Route dosyaları yalnızca composition root görevi görür.

## Katmanlar

1. `domain`: Framework ve veri kaynağından bağımsız tipler, içerik sözleşmeleri ve iş kuralları.
2. `application`: Kullanım senaryoları, portlar ve sayfa görünüm modelleri.
3. `infrastructure`: PostgreSQL, repository ve diğer dış sistem adaptörleri.
4. `ui`: Küçük, tek sorumluluklu React bileşenleri ve sayfa kompozisyonu.

## Bağımlılık Yönü

```text
route -> ui -> application -> domain
                  ^
                  |
            infrastructure
```

- `domain`, dış katmanları bilmez.
- `application`, somut repository veya UI bileşeni bilmez.
- `ui`, `server` katmanına doğrudan bağlanmaz.
- `infrastructure`, application portlarını uygular.
- Ortak navigasyon sözleşmeleri feature domain katmanında tutulur.

## Uygulanan Kararlar

- Anasayfa veri toplama akışı `HomePageDataSource` portuyla ayrıştırıldı.
- Ürün ve blog repository'leri altyapı adaptörü üzerinden bağlandı.
- Anasayfa büyük bileşeni küçük UI bölümlerine ayrıldı.
- Kurumsal çözümler içerik, view model ve görünüm katmanlarına ayrıldı.
- JSON-LD çıktıları tek güvenli `JsonLd` bileşeninde merkezileştirildi.
- Layout bileşenlerinin `server` tiplerine doğrudan bağımlılığı kaldırıldı.

## Otomatik Koruma

`npm run verify:architecture` aşağıdaki ihlalleri release sırasında engeller:

- Sunum katmanından doğrudan `server` importu
- Domain katmanından application, infrastructure, UI veya server importu
- Application katmanından infrastructure, UI, components veya server importu
