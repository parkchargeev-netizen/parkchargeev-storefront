# ParkChargeEV Admin Kullanım Rehberi

Bu rehber, ParkChargeEV admin panelinde siteyi, ürünleri, içerikleri ve satış operasyonunu düzenli yönetmek için hazırlanmıştır.

## 1. Giriş ve Ana Mantık

Admin paneline `/admin` adresinden girilir. Panelde amaç tek tek sayfa aramak değil, işi doğru yönetim alanına taşımaktır.

Önerilen günlük kullanım sırası:

1. Önce yeni sipariş, teklif ve keşif taleplerini kontrol edin.
2. Stok, fiyat ve ürün durumlarını güncelleyin.
3. Görsel, video, teknik özellik ve SEO metinlerini kontrol edin.
4. Blog, rehber ve yönetilebilir sayfaların yayın durumunu gözden geçirin.
5. Değişiklik sonrası canlı sitede ilgili sayfayı açıp kontrol edin.

## 2. Site Yönetimi

`/admin/site` ekranı site genel kontrol merkezidir.

Buradan şunlar yönetilir:

- Üst menü linkleri
- Footer linkleri
- Destek linkleri
- Yönetilebilir sayfalar
- SEO title ve description
- Sitemap ve noindex kararları

Menü etiketi kısa olmalıdır. Örnek: `Mağaza`, `Kurulum`, `Blog`, `İletişim`.

Sayfa başlığı kullanıcı niyetini net anlatmalıdır. Örnek: `Ev Tipi Şarj Cihazı Kurulumu`.

## 3. Ürün Yönetimi

Ürünler `/admin/urunler` ekranından yönetilir.

Ürün kaydında dikkat edilecek alanlar:

- Ürün adı: Kısa ve aranabilir olmalı.
- Kısa açıklama: Kartlarda görünür, satış faydasını net söyler.
- Açıklama: Ürün detay sayfasında kullanılır.
- Fiyat ve stok: Satın alma kararını doğrudan etkiler.
- Kategoriler: Mağaza filtrelerini ve ürün listelemeyi etkiler.
- Vitrin rozetleri: Çok satan, stokta, önerilen gibi sinyaller verir.
- Araç uyumluluğu: Ürün detayında güven oluşturur.

## 4. Teknik Alanlar Nasıl Kullanılır?

Teknik alanlar mağaza kartları, ürün detay özeti, ürün seçici ve karşılaştırma alanları için kullanılır.

Temel teknik alan örnekleri:

| Alan | Ne Yazılmalı | Örnek |
| --- | --- | --- |
| Güç | kW değeri | `11`, `22`, `60` |
| Şarj tipi | AC veya DC | `AC` |
| Konnektör | Soket tipi | `Type 2`, `CCS2` |
| Faz | Elektrik altyapısı | `Monofaz`, `Trifaz` |
| IP sınıfı | Koruma seviyesi | `IP54`, `IP65` |
| Kablo uzunluğu | Kablo bilgisi | `5 m`, `7 m`, `Soketli` |

Senaryo örnekleri:

- Ev tipi wallbox: `11 kW`, `AC`, `Type 2`, `Trifaz`, `IP54`, `5 m`
- Site/ofis cihazı: `22 kW`, `AC`, `Type 2`, `Trifaz`, `IP65`, `RFID + OCPP`
- Aksesuar kablo: `22 kW uyumlu`, `Type 2 - Type 2`, `Trifaz`, `5 m`

## 5. Teknik Özellikler Tablosu

Teknik özellikler ürün detayındaki tabloyu doldurur. Burada amaç uzun açıklama yazmak değil, karşılaştırılabilir net bilgi vermektir.

Örnek satırlar:

| Grup | Başlık | Değer |
| --- | --- | --- |
| Teknik | Maksimum güç | 22 kW |
| Teknik | Konnektör | Type 2 |
| Kurulum | Faz yapısı | Trifaz |
| Akıllı özellik | Uzaktan yönetim | RFID / OCPP uyumlu |
| Güvenlik | Koruma sınıfı | IP65 |

İyi kullanım:

- `Maksimum güç: 22 kW`
- `Konnektör: Type 2`
- `Kurulum: Trifaz hat önerilir`

Zayıf kullanım:

- Çok uzun paragraf yazmak
- Aynı bilgiyi 3 kez tekrar etmek
- Belirsiz değerler kullanmak: `çok güçlü`, `iyi kalite`, `uygun`

## 6. Görsel ve Video Yönetimi

Ürün görselleri ürün detay galerisinde doğrudan görünür.

Görsel kullanırken:

- Ana görsel net ve yüksek çözünürlüklü olmalı.
- Ürün veya kurulum sahnesi tüm çerçeveyi doldurmalı.
- Alt text ürün adı ve görüntü tipini anlatmalı.

Örnek alt text:

- `HomeCharge Pro 11kW ön görünüm`
- `Business Charge Dual 22kW kurulum görünümü`
- `Type-2 şarj kablosu detay görünümü`

Video eklenirse ürün veya kurulum sürecini göstermelidir. Sadece dekoratif video kullanılmamalıdır.

## 7. Blog ve Rehberler

Blog ekranı SEO ve müşteri itirazlarını azaltmak için kullanılır.

İyi blog başlıkları:

- `11 kW ve 22 kW Şarj Cihazı Farkı`
- `Apartmanda Şarj Cihazı Kurulumu Nasıl Yapılır?`
- `Type 2 Şarj Kablosu Seçerken Nelere Dikkat Edilmeli?`

Her blog yazısı şu sırayla hazırlanmalıdır:

1. Kullanıcının sorusunu net cevaplayan giriş
2. Kısa teknik açıklama
3. ParkChargeEV çözüm önerisi
4. SSS
5. CTA: ürün incele, keşif iste veya iletişime geç

## 8. Sipariş, Ödeme ve Teklif Yönetimi

Siparişler `/admin/siparisler` ekranından takip edilir.

Kontrol edilecek bilgiler:

- Sipariş durumu
- Ödeme durumu
- Ürün ve adet
- Müşteri bilgileri
- Teslimat veya kurulum notları

Teklif ve keşif talepleri `/admin/teklifler` ve `/admin/saha` ekranlarından yönetilir.

Teklif öncesi mutlaka kontrol edilecek bilgiler:

- Şehir ve ilçe
- Kurulum yeri
- Araç markası
- Elektrik altyapısı
- Talep edilen ürün veya güç
- Müşteri iletişim bilgisi

## 9. Yayın Öncesi Kontrol Listesi

Yeni ürün veya sayfa yayınlamadan önce:

- Başlık Türkçe karakterlerle doğru mu?
- Fiyat ve stok doğru mu?
- Görsel ana çerçeveyi dolduruyor mu?
- Teknik özellikler kısa ve anlaşılır mı?
- Ürün doğru kategoriye bağlı mı?
- SEO title ve description dolu mu?
- Mobil görünümde sepete ekleme kolay erişilebilir mi?
- Canlı sayfa açılıp kontrol edildi mi?

## 10. Pratik Yönetim Kuralı

Her alan tek bir amaca hizmet etmelidir:

- Menü: kullanıcıyı doğru yere götürür.
- Ürün kartı: hızlı karar verdirir.
- Ürün detay: güven oluşturur ve satışa götürür.
- Teknik tablo: karşılaştırmayı kolaylaştırır.
- Blog: arama trafiği ve güven sağlar.
- Teklif formu: kurumsal ve kurulum taleplerini toplar.
