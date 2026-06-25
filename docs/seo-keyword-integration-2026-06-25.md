# ParkChargeEV SEO ve AI Arama Entegrasyonu

Tarih: 25 Haziran 2026

## Hedef

ParkChargeEV'i tek bir anahtar kelimeye aşırı yüklemek yerine elektrikli araç şarj cihazı satın alma, kurulum, teknik bilgi ve kurumsal proje niyetlerini kapsayan güvenilir bir konu otoritesi olarak yapılandırmak.

Arama motorlarında birinci sıra garanti edilemez. Teknik SEO ve içerik kalitesi uygunluk sağlar; gerçek sıralama rekabet, bağlantı profili, marka sinyalleri, kullanıcı davranışı ve zaman içinde oluşan güvene bağlıdır.

## Araştırılan Arama Kümeleri

### Satın alma ve ürün

- elektrikli araç şarj cihazı
- elektrikli araç şarj aleti
- elektrikli araç şarj cihazı fiyatları
- ev tipi elektrikli araç şarj cihazı
- wallbox şarj cihazı
- elektrikli araç şarj aleti tavsiye

Hedef sayfalar:

- `/magaza`
- `/elektrikli-arac-sarj-rehberi`
- `/blog/elektrikli-arac-sarj-cihazi-secim-rehberi`
- ürün detay sayfaları

### Güç, süre ve altyapı

- 7.4 kW şarj cihazı
- 11 kW şarj cihazı
- 22 kW şarj cihazı
- 22 kW şarj cihazı kaç amper çeker
- elektrikli araç şarj süresi
- monofaze ve trifaze şarj

Hedef sayfalar:

- `/blog/11kw-ve-22kw-sarj-cihazi-farki`
- `/urun-secici`
- `/karsilastir`
- ilgili ürün detayları

### Maliyet

- elektrikli araç şarj maliyeti
- evde elektrikli araç şarj maliyeti
- elektrikli araç şarj maliyeti hesaplama
- elektrikli araç 100 km maliyeti

Hedef sayfa:

- `/blog/elektrikli-arac-sarj-maliyeti-hesaplama`

Güncel tarife hızla değiştiği için sabit fiyat iddiası yerine güncel birim fiyatla çalışan formül kullanıldı.

### Konnektör ve teknik terimler

- Type 2 şarj kablosu
- CCS2 nedir
- AC DC şarj farkı
- OCPP şarj cihazı
- RFID şarj istasyonu
- dinamik yük yönetimi
- load balancing

Hedef sayfalar:

- `/elektrikli-arac-sarj-sozlugu`
- `/blog/type-2-ccs2-ac-dc-sarj-farklari`
- `/blog/dinamik-yuk-yonetimi-nedir`
- `/kurumsal-cozumler`

### Taşınabilir ürünler

- taşınabilir elektrikli araç şarj cihazı
- mobil şarj cihazı
- taşınabilir şarj cihazı 7 kW
- taşınabilir şarj cihazı 22 kW
- taşınabilir şarj cihazı mı wallbox mı

Hedef sayfa:

- `/blog/tasinabilir-sarj-cihazi-mi-wallbox-mi`

### Kurulum ve yerel arama

- şarj istasyonu kurulumu
- şarj cihazı kurulumu yapan firmalar
- evde elektrikli araç şarj cihazı kurulumu
- site otoparkına şarj istasyonu
- Sakarya elektrikli araç şarj cihazı kurulumu
- Kocaeli elektrikli araç şarj cihazı kurulumu

Hedef sayfalar:

- `/hizmetler`
- `/blog/evde-elektrikli-arac-sarj-cihazi-kurulumu`
- `/blog/apartman-otoparkina-sarj-cihazi-kurulumu`
- `/sarj-cihazi-kurulumu/sakarya`
- `/sarj-cihazi-kurulumu/kocaeli`

### Araç markası niyeti

Togg, Tesla ve BYD ile birlikte kullanılan şarj cihazı sorguları araştırıldı. Bu aşamada model bazlı ince sayfalar oluşturulmadı. Araçların donanım ve AC/DC kabul değerleri model, versiyon ve üretim yılına göre değişebildiği için doğrulanmamış kapasite verisi yayımlamak yerine ürün seçim rehberinde aracın dahili şarj ünitesini kontrol etme yöntemi anlatıldı.

## Uygulanan Teknik SEO

- Varyantlı ürünler için `ProductGroup`, `hasVariant`, `variesBy`, ayrı SKU ve Offer verisi.
- Ürünlerde kargo, iade ve garanti verileri.
- Konu merkezi için `CollectionPage`.
- Teknik sözlük için `DefinedTermSet` ve `DefinedTerm`.
- Şehir kurulum sayfaları için `Service` ve `areaServed: City`.
- Mevcut `Organization`, `LocalBusiness`, `Article`, `BreadcrumbList`, `Product`, `Offer` verileri korundu.
- Gerçek müşteri puanı bulunmadığı için sahte `aggregateRating` veya `Review` eklenmedi.
- Yeni sayfalar sitemap, RSS, `llms.txt`, mağaza, ana sayfa ve footer iç linklerine eklendi.

## AI Arama Görünürlüğü

Google, AI sonuçları için ayrı bir özel şema veya `llms.txt` zorunluluğu belirtmez. Temel gereksinimler indekslenebilir sayfa, taranabilir bağlantı, açık metin, görünür içerikle eşleşen yapılandırılmış veri ve güçlü site içi bağlantıdır.

ParkChargeEV için:

- Her arama niyetinin kanonik ve açık başlıklı bir hedef sayfası var.
- Terimler kısa ve alıntılanabilir tanımlarla açıklanıyor.
- Şirketin ne olduğu ve ne olmadığı `llms.txt` içinde netleştiriliyor.
- Ürün, hizmet, şehir ve rehber varlıkları birbirine bağlanıyor.
- RSS yeni içerik keşfini destekliyor.

## Harici Operasyon Gerektiren Sonraki Adımlar

1. Google Search Console'da sitemap gönderimi ve URL denetimi.
2. Bing Webmaster Tools ve Yandex Webmaster sitemap gönderimi.
3. Google Business Profile hizmet, kategori, fotoğraf ve Sakarya adres doğrulaması.
4. Google Merchant Center kurulumu; gerçek marka, GTIN/MPN ve stok verisi sağlandıktan sonra ürün feed'i.
5. Gerçek müşterilerden izinli yorum toplama; yalnızca görünür ve doğrulanabilir puanlar oluştuğunda Review schema.
6. Search Console sorgularına göre üç ayda bir içerik yenileme ve yeni konu boşluğu analizi.

## Kaynaklar

- Google Search Central, Product variants: https://developers.google.com/search/docs/appearance/structured-data/product-variants
- Google Search Central, Product structured data: https://developers.google.com/search/docs/appearance/structured-data/product
- Google Search Central, AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google Search Central, Ecommerce product data: https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google
- Google Search Central, Structured data gallery: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- Schema.org ProductGroup: https://schema.org/ProductGroup
- Schema.org DefinedTermSet: https://schema.org/DefinedTermSet
