# ParkChargeEV 2026 Pazar, Persona, UX ve Satış Tasarım Raporu

Tarih: 22 Haziran 2026  
Kapsam: Türkiye pazarı, elektrikli araç şarj cihazları, kurulum hizmetleri, site/apartman çözümleri, işletme çözümleri, e-ticaret satış yolculuğu, sepet ve PayTR uyumlu ödeme deneyimi.

Bu raporun amacı ParkChargeEV'i sadece "şarj cihazı satan bir mağaza" olmaktan çıkarıp, kullanıcıya "doğru cihaz + doğru altyapı + güvenli kurulum" kararını hızlı ve güvenli şekilde aldıran premium bir satış platformuna dönüştürmektir.

## 1. Yönetici Özeti

Türkiye elektrikli araç ve şarj pazarı artık erken meraklı kullanıcı döneminden çıkıp daha geniş ve parçalı bir satın alma evresine girmiş durumda. Kullanıcılar tek tip değil:

- Yeni elektrikli araç sahibi evde güvenli şarj çözümü arıyor.
- Site veya apartman yöneticisi ortak otopark için teknik, hukuki ve maliyet açısından yönetilebilir bir çözüm arıyor.
- KOBİ/ofis yöneticisi çalışan, misafir veya filo deneyimini iyileştirmek istiyor.
- Ticari lokasyon yatırımcısı şarjı gelir modeline çevirmek istiyor.
- Aksesuar alıcısı hızlıca doğru Type 2 kablo veya ekipmanı satın almak istiyor.
- Elektrikçi veya kurulum partneri doğru ürün, teknik doküman ve standart kurulum bilgisi arıyor.

ParkChargeEV'in en güçlü konumlandırması:

> Türkiye geneline ürün gönderen, Sakarya ve Kocaeli odaklı planlı saha hizmeti sunan, ev, site ve işletmeler için doğru şarj kararını sade bir alışveriş deneyimine çeviren uzman platform.

Kazanan site modeli üç şeyi aynı anda yapmalıdır:

1. Premium ve güven veren ilk izlenim.
2. Hızlı e-ticaret alışverişi.
3. Belirsiz kalan kurulum ve altyapı kararlarında uzman yönlendirme.

## 2. Araştırma Kaynakları ve Pazar Sinyalleri

### 2.1 Resmi ve sektörel sinyaller

| Kaynak | Bulgu | ParkChargeEV için anlamı |
|---|---|---|
| EPDK Şarj Hizmeti Piyasası İstatistikleri | EPDK, 2026 Ocak, Şubat, Mart, Nisan ve Mayıs şarj piyasası raporlarını yayımlıyor. | Şarj pazarı regüle edilen, aylık izlenen ve güven beklentisi yüksek bir pazardır. Site dili teknik güven ve süreç şeffaflığı taşımalıdır. |
| ODMD perakende satış raporları | 2026 Ocak-Mayıs dahil aylık perakende otomobil pazarı raporları yayımlanıyor. | Elektrikli araç ivmesi aylık takip edilmeli; ana sayfa ve kampanya mesajları pazar momentumuna göre güncellenmelidir. |
| ZES | 81 il, soket sayısı, AC/DC/HPC filtreleri, araç seçici, rota planlama, rezervasyon ve uygulama deneyimi öne çıkarılıyor. | Kullanıcı kapsama, uygunluk, kolaylık ve anlık kontrol görmek istiyor. ParkChargeEV bu sinyali ürün, kurulum ve teslimat netliğiyle vermelidir. |
| Eşarj | Araç sahipleri, ev/işyeri çözümleri, filo, iş ortaklığı ve portal akışları ayrıştırılıyor. | Bireysel, kurumsal ve iş ortaklığı akışları tek menü altında ezilmemeli; her segmentin kendi dönüşüm yolu olmalıdır. |
| Tesla Wall Connector | Güç, araç uyumu, power management, uygulama kontrolü, garanti ve ticari kullanım sade bir teknik dille sunuluyor. | Ürün detaylarında "kimler için uygun", "kaç kW", "hangi altyapı", "hangi garanti" bilgileri en üstte görünmelidir. |
| Wallbox Pulsar Plus | Ev, apartman ve enerji yönetimi odağı; dinamik yük yönetimi ve uygulama kontrolü vurgulanıyor. | Site/apartman ve ev kullanıcısı için yük yönetimi, sigorta atması, altyapı yükseltme ihtiyacı gibi korkular açıkça ele alınmalıdır. |
| NN/g kullanılabilirlik heuristikleri | Sistem durumu, kullanıcı dili, hata önleme, minimalist tasarım ve anlaşılır hata mesajları vurgulanıyor. | ParkChargeEV'in tüm akışlarında teknik terimler sade açıklamayla desteklenmeli, ödeme ve form hataları Türkçe ve aksiyon odaklı olmalıdır. |
| Baymard checkout araştırmaları | Ortalama online sepet terk oranı yüksektir; uzun ve karmaşık checkout terk sebebidir. | Sepet ve ödeme akışı kısa, güvenli, PayTR uyumlu ve form alanı sayısı kontrollü olmalıdır. |

Kaynaklar:

- EPDK: https://www.epdk.gov.tr/Detay/Icerik/3-0-222/enerji-donusumusarj-hizmeti-piyasasi--istatistik
- ODMD: https://www.odmd.org.tr/web_2837_1/neuralnetwork.aspx?type=36
- ZES: https://zes.net/
- Eşarj: https://esarj.com/
- Tesla Wall Connector: https://www.tesla.com/support/charging/wall-connector
- Wallbox Pulsar Plus: https://wallbox.com/en_us/pulsar-plus-ev-charger
- NN/g Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- Baymard Cart Abandonment: https://baymard.com/lists/cart-abandonment-rate

## 3. Rakip UX Analizi

### 3.1 Rakip desenleri

| Rakip tipi | Örnekler | Öne çıkan UX deseni | ParkChargeEV için ders |
|---|---|---|---|
| Şarj ağı operatörü | ZES, Eşarj | Harita, soket sayısı, uygulama, rota, istasyon filtreleri, kapsama | ParkChargeEV şarj ağı gibi davranmamalı; ama aynı güven sinyalini teslimat, kurulum ve teknik destek netliğiyle vermelidir. |
| Cihaz üreticisi | Tesla, Wallbox | Güç, uyum, kurulum, enerji yönetimi, uygulama, garanti | Ürün detay sayfası teknik kararları sade ve üstte göstermelidir. |
| Genel e-ticaret | Trendyol, Hepsiburada, İkas, Ideasoft desenleri | Kompakt ürün kartı, hızlı filtre, stok, fiyat, mobil sticky satın alma | Mağaza sayfası büyük hero yerine ürün, arama, kategori ve filtre odaklı açılmalıdır. |
| Kurumsal çözüm sitesi | Enerji ve altyapı firmaları | Teklif formu, saha keşfi, referans, teknik rapor | Site/apartman ve işletme akışlarında teklif paketi, keşif ve teknik güven daha güçlü olmalıdır. |
| SaaS/premium teknoloji markası | Tesla, Apple, modern B2B SaaS | Minimal metin, güçlü görsel, net CTA, güvenli motion | Animasyon satışa hizmet etmeli; metin yığını ve ağır efekt performansı düşürmemelidir. |

### 3.2 ParkChargeEV rekabet fırsatı

Pazardaki boşluk şudur: Kullanıcı ya teknik ürün bilgisi içinde kayboluyor ya da sadece kurumsal teklif akışına zorlanıyor. ParkChargeEV iki dünyayı birleştirebilir:

- Hızlı ürün satın alma: aksesuar, kablo, ev tipi cihaz.
- Rehberli karar: altyapı, faz, güç, kurulum, keşif.
- Kurumsal teklif: site, işletme, filo, ticari lokasyon.

## 4. Müşteri Personalaları

### 4.1 Persona 1 - Yeni EV sahibi ev kullanıcısı

| Alan | Detay |
|---|---|
| Temsilci kişi | Murat, 38, özel sektör çalışanı |
| Araç | Togg T10X, Tesla Model Y, BYD Atto 3, MG4 |
| Ana ihtiyaç | Evde güvenli AC şarj, 7.4 kW veya 11 kW kararını netleştirmek |
| Acı noktası | "Pano uygun mu?", "Trifaze gerekir mi?", "Yanlış cihaz alır mıyım?" |
| Satın alma motivasyonu | Aracı her sabah dolu bulmak, istasyon bekleme derdinden kurtulmak |
| İtiraz | Fiyat + kurulum toplam maliyeti belirsizliği |
| Karar süresi | 1-7 gün |
| En iyi CTA | Evime Uygun Cihazı Bul, Ücretsiz Keşif İste, Sepete Ekle |
| Gerekli UX | Araç uyumu, güç seçimi, kurulum gereksinimi, WhatsApp hızlı cevap, mobil sticky sepete ekle |
| Dönüşüm potansiyeli | 9/10 |

### 4.2 Persona 2 - Site/apartman karar vericisi

| Alan | Detay |
|---|---|
| Temsilci kişi | Selin, 45, site yöneticisi veya yönetim kurulu üyesi |
| Ana ihtiyaç | Ortak otoparkta adil, güvenli, ölçeklenebilir şarj altyapısı |
| Acı noktası | Sakin itirazları, maliyet paylaşımı, pano/trafo belirsizliği |
| Satın alma motivasyonu | Sakin taleplerini çözmek, site değerini artırmak |
| İtiraz | Teknik sorumluluk, yangın güvenliği, yönetim onayı |
| Karar süresi | 2-8 hafta |
| En iyi CTA | Site İçin Keşif Planla, Yönetim Teklifi Al |
| Gerekli UX | RFID, yük yönetimi, raporlama, yönetim kuruluna sunulacak teklif paketi, referans kurulumlar |
| Dönüşüm potansiyeli | 8/10 |

### 4.3 Persona 3 - KOBİ/ofis otoparkı yöneticisi

| Alan | Detay |
|---|---|
| Temsilci kişi | Emre, 41, işletme sahibi veya idari işler yöneticisi |
| Ana ihtiyaç | Çalışan, misafir veya filo araçları için 22 kW AC şarj |
| Acı noktası | Servis sorumluluğu, fatura takibi, arıza durumunda muhatap bulma |
| Satın alma motivasyonu | Premium işletme algısı, çalışan memnuniyeti, filo verimliliği |
| İtiraz | Operasyon ve bakım yükü |
| Karar süresi | 1-4 hafta |
| En iyi CTA | Kurumsal Teklif Al, 22 kW Çözümleri Gör |
| Gerekli UX | Kurumsal landing, teknik tablo, garanti, servis süreci, teklif formu |
| Dönüşüm potansiyeli | 8/10 |

### 4.4 Persona 4 - Ticari lokasyon yatırımcısı

| Alan | Detay |
|---|---|
| Temsilci kişi | Hakan, 50, akaryakıt, AVM, restoran, otel veya yol üstü lokasyon sahibi |
| Ana ihtiyaç | DC hızlı şarj veya çoklu AC yatırım kararı |
| Acı noktası | Trafo, lisans, saha uygunluğu, geri dönüş süresi |
| Satın alma motivasyonu | Şarjı gelir modeline çevirmek, lokasyon trafiğini artırmak |
| İtiraz | Yüksek yatırım bedeli ve operasyon karmaşası |
| Karar süresi | 1-3 ay |
| En iyi CTA | ROI Ön Fizibilite Al, Saha Keşfi Planla |
| Gerekli UX | ROI hesaplayıcı, saha uygunluk testi, DC teknik rehber, iş ortaklığı modeli |
| Dönüşüm potansiyeli | 6.5/10 |

### 4.5 Persona 5 - Aksesuar ve hızlı alışveriş kullanıcısı

| Alan | Detay |
|---|---|
| Temsilci kişi | Deniz, 32, yeni elektrikli araç sahibi |
| Ana ihtiyaç | Type 2 kablo, taşıma çantası, adaptör, soket uyumu |
| Acı noktası | "5 metre mi 7 metre mi?", "Aracımla uyumlu mu?" |
| Satın alma motivasyonu | Aracı teslim alır almaz eksiksiz kullanmak |
| İtiraz | Uyum belirsizliği ve teslimat süresi |
| Karar süresi | Aynı gün - 2 gün |
| En iyi CTA | Hemen Satın Al, Araç Uyumluluğunu Kontrol Et |
| Gerekli UX | Kısa ürün kartı, stok, 81 il kargo, mobil hızlı sepet |
| Dönüşüm potansiyeli | 8.5/10 |

### 4.6 Persona 6 - Elektrikçi veya kurulum partneri

| Alan | Detay |
|---|---|
| Temsilci kişi | Ahmet, 36, elektrik teknikeri veya yerel kurulumcu |
| Ana ihtiyaç | Teknik doküman, montaj standardı, ürün tedariki |
| Acı noktası | Yanlış ürün tavsiyesi, garanti dışı montaj riski |
| Satın alma motivasyonu | Güvenilir tedarik ve müşteriye hızlı teklif |
| İtiraz | Marj, garanti ve teknik destek belirsizliği |
| Karar süresi | 1-14 gün |
| En iyi CTA | Bayi/İş Ortağı Başvurusu, Teknik Doküman İndir |
| Gerekli UX | Partner landing, teknik PDF, montaj checklist, ürün karşılaştırma |
| Dönüşüm potansiyeli | 7/10 |

### 4.7 Persona 7 - Filo ve operasyon yöneticisi

| Alan | Detay |
|---|---|
| Temsilci kişi | Ece, 39, filo veya operasyon yöneticisi |
| Ana ihtiyaç | Birden fazla araç için planlı şarj, raporlama, kullanıcı yetkilendirme |
| Acı noktası | Araçların sırayla şarj edilmesi, enerji tüketimi takibi, kullanıcı yönetimi |
| Satın alma motivasyonu | Operasyonel verimlilik, enerji maliyeti kontrolü, filo dönüşümü |
| İtiraz | Entegrasyon ve raporlama yeterliliği |
| Karar süresi | 2-6 hafta |
| En iyi CTA | Filo İçin Teklif Al, RFID ve Raporlama Çözümlerini Gör |
| Gerekli UX | Çoklu cihaz senaryosu, RFID, yük dengeleme, raporlama, bakım süreci |
| Dönüşüm potansiyeli | 7.5/10 |

## 5. Persona Bazlı Satın Alma Evrenleri

### Evren A - Hızlı e-ticaret evreni

| Başlık | Detay |
|---|---|
| Hedef persona | Aksesuar alıcısı, ev tipi cihaz alıcısı |
| Ana motivasyon | Ürünü hızlı bul, fiyatı gör, sepete ekle |
| Ekran dili | Ürün, fiyat, stok, kargo, uyum |
| Kritik bloklar | Kompakt mağaza, mobil sticky satın alma, 81 il kargo, araç uyumu mikro CTA |
| Risk | Teknik ürünlerde yanlış seçim korkusu |
| Başarı metriği | PLP -> PDP CTR, add-to-cart rate, mobile sticky CTA click |

### Evren B - Uzman rehber evreni

| Başlık | Detay |
|---|---|
| Hedef persona | Yeni EV sahibi, site/apartman yöneticisi |
| Ana motivasyon | Yanlış cihaz almamak, altyapı uygunluğunu netleştirmek |
| Ekran dili | Uygunluğu birlikte kontrol edelim |
| Kritik bloklar | Ürün seçici, güç karşılaştırma, keşif CTA, WhatsApp |
| Risk | Fazla rehberlik alışveriş hızını düşürebilir |
| Başarı metriği | Ürün seçici tamamlama, keşif formu, WhatsApp click |

### Evren C - Kurumsal çözüm evreni

| Başlık | Detay |
|---|---|
| Hedef persona | Site, işletme, filo, ticari lokasyon |
| Ana motivasyon | Operasyonel, teknik ve mali kararları güvenle almak |
| Ekran dili | Keşif, teklif, raporlama, güvenlik, ölçeklenebilirlik |
| Kritik bloklar | Kurumsal segment kartları, teklif formu, referanslar, teknik süreç |
| Risk | Bireysel kullanıcıyı soğutabilir |
| Başarı metriği | Teklif formu completion, kurumsal CTA CTR |

### Evren D - Premium teknoloji evreni

| Başlık | Detay |
|---|---|
| Hedef persona | Tüm personalar |
| Ana motivasyon | Güvenilir, modern ve teknik olarak yetkin marka algısı |
| Ekran dili | Sade, görsel, premium, teknik güven |
| Kritik bloklar | Gerçek ürün/kurulum görselleri, düşük maliyetli motion, net CTA |
| Risk | Aşırı animasyon performansı düşürür |
| Başarı metriği | Hero CTR, bounce rate, Core Web Vitals |

### Evren E - Yerel servis + ulusal kargo evreni

| Başlık | Detay |
|---|---|
| Hedef persona | Marmara bölgesi kurulum müşterileri, Türkiye geneli ürün alıcıları |
| Ana motivasyon | Ürün Türkiye geneline gelir, saha hizmeti planlı ilerler |
| Ekran dili | 81 il kargo, saha hizmeti, keşif, teslimat |
| Kritik bloklar | Hizmet kapsamı, il bazlı uygunluk, kargo ve kurulum ayrımı |
| Risk | Sadece yerel algı oluşursa ulusal satış zayıflar |
| Başarı metriği | Kargo ürün satışları, hizmet uygunluğu sorgusu, keşif talebi |

### Evren F - Teknik partner evreni

| Başlık | Detay |
|---|---|
| Hedef persona | Elektrikçi, bayi, montaj partneri |
| Ana motivasyon | Teknik bilgi, doğru ürün, iş ortaklığı |
| Ekran dili | Doküman, standart, garanti, tedarik |
| Kritik bloklar | Teknik doküman merkezi, partner başvuru, montaj checklist |
| Risk | Son kullanıcı ana akışında fazla teknik görünürlük |
| Başarı metriği | Partner başvurusu, PDF indirme, teknik içerik etkileşimi |

## 6. Kazanan Ortak Web Sitesi Modeli

Kazanan tasarım, bütün personaları tek bir ekranda konuşmaya zorlamamalıdır. Bunun yerine ilk ekranda güven ve seçim kolaylığı verip kullanıcıyı en doğru rota üzerinden ilerletmelidir.

### 6.1 Ana strateji

1. İlk ekran: premium güven, kısa mesaj, net CTA.
2. İlk karar: Ev, Site/Apartman, İşletme.
3. İlk ürün teması: kompakt mağaza seridi.
4. İlk belirsizlik çözümü: ürün seçici veya keşif CTA.
5. İlk güven kanıtı: PayTR, garanti, 81 il kargo, teknik destek, gerçek kurulum görselleri.

### 6.2 Navigasyon önerisi

Desktop:

- Ev Tipi
- Site & Apartman
- İşletmeler
- Mağaza
- Kurulum
- Blog
- İletişim
- CTA: Ürün Seçici
- CTA: Keşif Al
- Sepet

Mobil:

- Logo
- Menü
- Sepet
- Sticky alt bar: WhatsApp, Ürün Seçici, Sepet

Mega menü:

- Ev Tipi: 7.4 kW, 11 kW, Type 2, kurulum rehberi.
- Site & Apartman: RFID, yük yönetimi, yönetim teklifi, keşif.
- İşletmeler: 22 kW AC, filo, raporlama, kurumsal teklif.
- Mağaza: Ev tipi, ticari AC, DC, aksesuar, karşılaştırma.
- Kurulum: süreç, uygunluk, bölge, SSS.

## 7. Ana Sayfa Tasarımı

### 7.1 Desktop wireframe

```text
Top Trust Bar
PayTR güvenli ödeme | 81 il kargo | Uzman destek | WhatsApp

Header
Logo | Ev Tipi | Site & Apartman | İşletmeler | Mağaza | Kurulum | Blog | İletişim
CTA: Ürün Seçici | Keşif Al | Sepet

Hero
Sol:
  H1: "Aracınız ve altyapınız için doğru şarj çözümünü seçin."
  Kısa metin: "Ev, site ve işletmeler için ürün, uyumluluk ve kurulum süreci tek yerde."
  CTA: "Ürünleri İncele" | "Uygunluğu Kontrol Et" | "WhatsApp"
Sağ:
  Gerçek wallbox/kurulum görseli veya hafif cihaz motion sahnesi
  Overlay: 11 kW ev, 22 kW site/ofis, Type 2 uyum

Persona Rotaları
Ev için | Site/Apartman için | İşletme için
Her kart: sorun + çözüm + CTA

Kompakt Mağaza Seridi
4-6 ürün
Filtre çipleri: Ev | Site | İşletme | Aksesuar | DC

Kurulum Netliği
1. Uygunluk kontrolü
2. Ürün seçimi
3. Kurulum veya kargo

Güven ve Sosyal Kanıt
Garanti | PayTR | Teknik destek | Kurulum fotoğrafları | Müşteri yorumu

Rehberler
"11 kW mı 22 kW mı?"
"Apartmanda şarj cihazı kurulumu"
"Type 2 kablo nasıl seçilir?"

Final CTA
"Doğru cihazı birlikte netleştirelim."
```

### 7.2 Mobile wireframe

```text
Sticky Header
Logo | Menü | Sepet

Hero
H1 kısa
CTA: Ürünleri İncele
Secondary: Uygunluğu Kontrol Et

Trust Strip
PayTR | 81 il kargo | Uzman destek

3 Rota Kartı
Ev | Site | İşletme

Kompakt Ürün Slider
Ürün görseli | fiyat | stok | incele

Sticky Bottom Bar
WhatsApp | Ürün Seçici | Sepet
```

### 7.3 Ana sayfa içerik dili

Hero seçenekleri:

- "Aracınız ve altyapınız için doğru şarj çözümünü seçin."
- "Şarj cihazını değil, güvenli kurulumla birlikte doğru çözümü alın."
- "Ev, site ve işletmeler için şarj kararını netleştiren platform."

Persona kartları:

- Ev: "Aracınızı her sabah hazır bulun."
- Site: "Ortak otoparkta adil ve yönetilebilir şarj altyapısı kurun."
- İşletme: "Çalışan ve misafir deneyimini şarj çözümüyle güçlendirin."

## 8. Mağaza ve Ürün Listeleme Tasarımı

### 8.1 Mağaza hedefi

Mağaza sayfası bir landing page gibi değil, gerçek bir e-ticaret listeleme sayfası gibi açılmalıdır. Kullanıcı ilk ekranda ürünleri, arama alanını, kategori sekmelerini ve filtreyi görmelidir.

### 8.2 PLP yapısı

Desktop:

```text
Compact Page Header
"EV Şarj Mağazası"
Arama: "Togg, Tesla, 11 kW, Type 2..."

Category Tabs
Tüm ürünler | Ev Tipi | Site/Apartman | İşletme | DC | Aksesuar

Sol Filtre Paneli
Güç
Faz
Soket
RFID
Wi-Fi
OCPP
Yük dengeleme
Kurulum ihtiyacı
Fiyat

Sağ Grid
Sonuç sayısı + sıralama
Kompakt ürün kartları
```

Mobile:

```text
Arama
Yatay kategori çipleri
Filtre butonu
Sırala butonu
2 kolon kompakt ürün kartı veya yatay mini kart
```

### 8.3 Ürün kartı kuralı

Ürün kartında sadece karar için gerekli bilgiler kalmalıdır:

- Görsel
- Badge: Ev için, Kurumsal, Aksesuar, Yeni
- Ürün adı
- Güç veya kablo uzunluğu
- Soket tipi
- Kurulum notu
- Fiyat
- CTA: İncele
- İkincil CTA: Keşif

Azaltılacak alanlar:

- Uzun açıklama
- Tekrar eden teknik etiketler
- Çok büyük CTA blokları
- Büyük mağaza açılış hero alanı

## 9. Ürün Detay Sayfası Tasarımı

### 9.1 Desktop

```text
Breadcrumb

Sol kolon:
  Büyük ürün görseli
  Thumbnail galeri
  Teknik karar bilgileri
  Bu ürün kimler için?
  Uygun kullanım alanları

Sağ sticky kolon:
  Badge: Stokta
  Ürün adı
  Kısa özet
  Fiyat
  Güç / soket / kurulum çipleri
  Satın alma yolu:
    - Ürünü satın al
    - Keşifle ilerle
  Kablo / varyant
  Miktar
  Sepete ekle
  Tahmini ara toplam
  PayTR güvenli ödeme | 81 il kargo | Garanti

Alt:
  Teknik özellikler
  Kurulum bilgileri
  SSS
  İlgili ürünler
```

### 9.2 Mobile

```text
Üst:
  Görsel galeri
  Badge + ürün adı
  Fiyat
  3 karar çipi: güç/soket/kurulum
  Kısa özet

Orta:
  Satın alma yolu compact
  Teknik özellikler accordion
  Kurulum accordion
  SSS accordion

Alt:
  Kaydırılabilir ilgili ürünler

Sticky bottom buy bar:
  Fiyat
  Sepete ekle
```

Kritik kural: Mobilde iki adet "Sepete Ekle" görünmemeli. Kullanıcı sayfayı kaydırırken ekran altında tek ve sabit bir satın alma barı görmelidir.

### 9.3 Ürün detay mesaj sistemi

Üst kısa özet:

- Ev tipi: "Ev kullanımı için dengeli AC şarj çözümü. Altyapınız uygunsa günlük kullanımda pratik ve güvenlidir."
- Site/apartman: "Ortak otoparkta kullanıcı yönetimi ve kurulum planı gerektiren ölçeklenebilir çözüm."
- İşletme: "Çalışan, misafir veya filo kullanımında 22 kW AC şarj deneyimi için uygundur."
- Aksesuar: "Type 2 uyumlu araçlar için taşıması kolay, güvenli bağlantı ekipmanı."

## 10. Sepet ve PayTR Uyumlu Ödeme Yolculuğu

### 10.1 Sepet

```text
Sol:
  Ürünler
  Varyant/kablo uzunluğu
  Miktar
  Kaldır
  Aksesuar önerileri

Sağ:
  Sipariş özeti
  Ara toplam
  Kargo
  Kurulum teklifi notu
  Güvenli ödemeye geç
```

### 10.2 Ödeme

ParkChargeEV için ödeme akışı PayTR uyumlu ve güvenli kalmalıdır:

1. Sepet doğrulama
2. İletişim bilgileri
3. Teslimat/adres bilgileri
4. Mesafeli satış ve ön bilgilendirme onayı
5. PayTR ödeme doğrulaması
6. Sipariş sonucu ve durum takibi

Güvenlik ilkeleri:

- Kart verisi ParkChargeEV sunucusunda saklanmamalıdır.
- Tutar sunucuda yeniden hesaplanmalıdır.
- `/odeme`, `/api/*`, `/admin*` cache dışı kalmalıdır.
- Teknik hata mesajları kullanıcıya ham şekilde gösterilmemelidir.
- "Unexpected end of JSON input" gibi hatalar yerine Türkçe, aksiyon odaklı mesaj verilmelidir.

Örnek hata dili:

- "Ödeme oturumu başlatılamadı. Lütfen bilgilerinizi kontrol edin veya WhatsApp destekten yardım alın."
- "Sepetinizdeki ürünlerden biri güncellendi. Devam etmeden önce sepetinizi tekrar kontrol edin."
- "PayTR bağlantısı şu anda yanıt vermedi. Kart bilgileriniz kaydedilmedi, tekrar deneyebilirsiniz."

## 11. Heuristik UX Kontrol Matrisi

| Heuristik | ParkChargeEV uygulaması |
|---|---|
| Sistem durumu görünürlüğü | Sepete ekleme, PayTR yönlendirme, ödeme sonucu ve keşif formu gönderimi anlık geri bildirim vermeli. |
| Gerçek dünyanın dili | "Trifaze", "RFID", "OCPP" gibi terimlerin yanında sade açıklama bulunmalı. |
| Kullanıcı kontrolü | Filtre temizle, sepette ürün kaldır, formda geri dön, PayTR öncesi sipariş özeti görünmeli. |
| Tutarlılık | Ev, site ve işletme segmentleri tüm sitede aynı ikon, renk ve CTA diliyle devam etmeli. |
| Hata önleme | Araç uyumu, güç, faz ve kurulum ihtiyacı seçimlerinde yönlendirici uyarılar kullanılmalı. |
| Hatırlama yerine tanıma | Ürün kartlarında "Ev için", "Site için", "Kurulum gerekir" gibi çipler kullanılmalı. |
| Esnek kullanım | Hızlı satın alma, keşifle ilerleme, WhatsApp ve ürün seçici alternatifleri sunulmalı. |
| Minimalizm | Uzun metin yerine karar kartları, accordion ve kısa tooltip kullanılmalı. |
| Hata tanıma ve kurtarma | Teknik hata ham haliyle gösterilmemeli; kullanıcıya çözüm önerisi verilmeli. |
| Yardım ve dokümantasyon | Ürün detayda teknik özellik örnekleri, admin panelde "nereye ne yazılır" rehberi bulunmalı. |

## 12. UI Tasarım Dili

### 12.1 Marka hissi

- Premium teknoloji.
- Güvenli enerji altyapısı.
- Sade ama uzman.
- Gereksiz karanlık ve ağır animasyon yok.
- Yeşil/mint marka rengi, beyaz/soft zemin, kontrollü koyu vurgu.

### 12.2 Renk sistemi

| Token | Kullanım |
|---|---|
| `brand-900` | Header, primary CTA, güven alanları |
| `brand-700` | Hover, aktif menü, vurgulu ikon |
| `mint-400` | Başarı, uygunluk, enerji çizgisi |
| `surface-50` | Sayfa zemini |
| `surface-100` | Kart zemini |
| `ink-900` | Ana metin |
| `ink-600` | Yardımcı metin |
| `danger-600` | Form hatası |

### 12.3 Component kuralları

- Kart radius: 12-18 px.
- İç içe kart kullanımından kaçınılmalı.
- Ürün kartı sabit yükseklikli ve mobilde kompakt olmalı.
- CTA hiyerarşisi:
  - Birincil: Sepete Ekle, Ürünleri İncele.
  - İkincil: Keşif İste, Uygunluğu Kontrol Et.
  - Destek: WhatsApp.
- Teknik bilgiler tablo veya accordion olarak sunulmalı.
- Animasyonlar CSS `transform` ve `opacity` ağırlıklı olmalı.
- `prefers-reduced-motion` desteklenmeli.

## 13. DX ve Frontend Mimari Önerisi

### 13.1 Component sınıflandırması

```text
src/components/conversion
  trust-bar.tsx
  cta-cluster.tsx
  persona-route-card.tsx
  sticky-mobile-buy-bar.tsx

src/components/commerce
  product-grid.tsx
  product-filter-drawer.tsx
  product-sort-control.tsx
  product-card-compact.tsx
  product-detail-buy-panel.tsx

src/components/decision
  compatibility-check.tsx
  power-comparison.tsx
  installation-need-card.tsx
  roi-calculator.tsx

src/components/content
  guide-card.tsx
  faq-accordion.tsx
  case-study-card.tsx

src/lib
  conversion-events.ts
  product-routing.ts
  service-coverage.ts
```

### 13.2 Performans kuralları

- Ürün listeleme server-first olmalı.
- Filtre UI client tarafında minimal JS ile çalışmalı.
- Görseller `next/image` veya boyutları tanımlı optimize medya ile gelmeli.
- Video varsa lazy yüklenmeli ve poster görseli olmalı.
- Above-the-fold içerikte gereksiz client component kullanılmamalı.
- Mobilde 3D/WebGL sadece performans testi geçerse yüklenmeli.
- Checkout ve admin cache dışı, katalog sayfaları kontrollü cache/revalidate ile çalışmalı.
- Analytics eventleri hafif ve data-attribute tabanlı olmalı.

### 13.3 Ölçüm eventleri

| Event | Ne zaman çalışır |
|---|---|
| `pce_hero_cta_click` | Hero CTA tıklandığında |
| `pce_persona_route_click` | Ev/site/işletme rota kartı tıklandığında |
| `pce_product_filter_apply` | Mağaza filtreleri uygulandığında |
| `pce_product_detail_view` | Ürün detay sayfası görüntülendiğinde |
| `pce_purchase_mode_select` | Satın al veya keşifle ilerle seçildiğinde |
| `pce_add_to_cart` | Sepete ekleme gerçekleştiğinde |
| `pce_checkout_start` | Ödeme akışı başladığında |
| `pce_paytr_session_request` | PayTR oturumu başlatılmak istendiğinde |
| `pce_contact_submit` | Keşif veya iletişim formu gönderildiğinde |

## 14. A/B Test Planı

| Test | Hipotez | Variant A | Variant B | Başarı metriği |
|---|---|---|---|---|
| Hero mesajı | Kısa ve karar odaklı hero daha iyi dönüştürür. | Ürün odaklı | Çözüm odaklı | Hero CTA CTR |
| Mağaza açılışı | Büyük hero yerine ürün odaklı açılış daha fazla ürün tıklatır. | Hero + ürün | Arama + kategori + ürün | PLP -> PDP CTR |
| PDP mobil | Sticky buy bar satın almayı artırır. | Normal CTA | Sticky fiyat + sepet | Add-to-cart rate |
| Keşif CTA | Belirsizlik azaltan metin formu artırır. | Keşif İste | Uygunluğu Birlikte Netleştirelim | Form completion |
| Teknik bilgi | Accordion bilgi yorgunluğunu azaltır. | Açık uzun tablo | Kapalı accordion | Scroll depth + CTA CTR |
| Güven barı | Trust bar üst görünürlükte güveni artırır. | Header altında yok | Header üstünde trust bar | Checkout start rate |

## 15. Sayfa Bazlı Uygulama Planı

### 15.1 Ana sayfa

Öncelik:

1. Hero metnini sadeleştir.
2. Üç ana rota ekle: Ev, Site/Apartman, İşletme.
3. Kompakt mağaza seridi ekle.
4. Hizmet kapsamını sade kartlarla göster.
5. Rehber ve final CTA alanlarını kısa tut.

Kaldırılacak veya azaltılacak:

- Tekrar eden güven metinleri.
- Büyük ve yavaş animasyonlar.
- Çok uzun açıklama paragrafları.

### 15.2 Mağaza

Öncelik:

1. Büyük açılış kartını kaldır.
2. Arama ve kategori çiplerini ilk ekrana al.
3. Mobil filtre drawer kullan.
4. Ürün kartlarını kompakt ve e-ticaret odaklı tut.
5. Kayan ürün seritlerini ekran genişliğine göre küçült.

### 15.3 Ürün detay

Öncelik:

1. Görsel galeri ve satın alma panelini dengeli iki kolona oturt.
2. Mobilde tek sticky satın alma barı kullan.
3. Teknik bilgileri accordion/tablo yapısına al.
4. Tekrarlanan blokları azalt.
5. İlgili ürünleri mobilde yatay slider olarak göster.

### 15.4 Sepet ve ödeme

Öncelik:

1. Sepet özeti sade olmalı.
2. İletişim ve adres alanları kısa ve net olmalı.
3. PayTR ödeme akışı güvenli ilerlemeli.
4. Kart ve ödeme hataları Türkçe olmalı.
5. Sipariş sonucu ve takip sayfası net olmalı.

### 15.5 Admin ve içerik operasyonu

Öncelik:

1. Admin içinde sayfa metni, hero, CTA, ürün medya, teknik özellik, SSS yönetimi.
2. Her alan için "nereye ne yazılır" yardım metni.
3. Medya URL ve dosya yükleme önizlemesi.
4. Ürün açıklama editörü.
5. Araç uyumluluğu ekleme/silme.

## 16. Faz Faz Yol Haritası

### Faz 0 - Hijyen ve ölçüm

- Türkçe karakter ve encoding kontrolü.
- Analytics event haritası.
- Sepet, checkout ve PayTR hata eventleri.
- Core Web Vitals ölçümü.

### Faz 1 - Tasarım sistemi

- Marka renk tokenları.
- Tipografi ve spacing sistemi.
- Button, chip, card, form, accordion, sticky bar komponentleri.
- Mobil compact kurallar.

### Faz 2 - Ana sayfa

- Yeni hero.
- Üç persona rotası.
- Kompakt mağaza seridi.
- Kurulum netliği.
- Güven ve sosyal kanıt.
- Rehberler ve final CTA.

### Faz 3 - Mağaza

- Büyük açılış kartını kaldır.
- Arama + kategori + filtre yapısını öne al.
- Mobil filtre drawer.
- Kompakt ürün listesi.
- Karşılaştırma tepsisi.

### Faz 4 - Ürün detay

- Desktop iki kolon + sticky satın alma.
- Mobil sticky buy bar.
- Tekrarlanan blokları azalt.
- Teknik bilgiler accordion.
- İlgili ürünler mobil slider.

### Faz 5 - Sepet ve ödeme

- Sepet özeti sade.
- Adres ve iletişim bölümleri net.
- PayTR güvenli akış.
- Türkçe hata mesajları.
- Sipariş sonucu ve takip.

### Faz 6 - Admin ve içerik operasyonu

- Admin içerik rehberleri.
- Ürün medya yönetimi.
- Teknik özellik örnekleri.
- SSS ve blog yönetimi.
- Site geneli metin ve CTA yönetimi.

### Faz 7 - QA, SEO ve performans

- Lighthouse ve Core Web Vitals kontrolü.
- Mobil kullanılabilirlik testi.
- Checkout test siparişi.
- SEO title/description ve structured data kontrolü.
- Form hata ve başarı senaryoları.

## 17. Kabul Kriterleri

Yeni tasarımın başarılı sayılması için:

- Ana sayfada ilk ekranda tek ana mesaj, üç net rota ve birincil CTA görünür olmalı.
- Mağaza ilk açılışta ürün odaklı olmalı; kullanıcı ürün görmek için uzun hero geçmemeli.
- Mobil ürün detayda tek sticky sepete ekle alanı kalmalı.
- Sepet ve ödeme akışında kart verisi güvenli PayTR akışı dışında saklanmamalı.
- Hata mesajları Türkçe ve aksiyon odaklı olmalı.
- Ürün, keşif ve kurulum ayrımı tüm site genelinde net olmalı.
- Ürünler 81 ile kargo mesajını, saha hizmeti ise hizmet kapsamı mesajını doğru taşımalı.
- Admin panelde içerik ekleyen kişi nereye ne yazacağını yardım metinlerinden anlayabilmeli.
- Animasyonlar görsel kaliteyi artırmalı ama scroll performansını düşürmemeli.

## 18. Sonuç

ParkChargeEV'in en güçlü yeni sitesi; Tesla ve Apple tarzı premium ilk izlenimi, Trendyol ve Hepsiburada tarzı hızlı alışveriş mantığını, ZES ve Eşarj tarzı güven sinyallerini ve kurulum uzmanlığını birleştirmelidir.

Kazanan strateji:

```text
Premium ilk izlenim
  -> Persona rotası
  -> Kompakt mağaza
  -> Uygunluk ve keşif güveni
  -> Net ürün detay
  -> Mobil sticky satın alma
  -> PayTR uyumlu sürtünmesiz ödeme
```

Bu yaklaşım ev tipi alıcıyı hızlı sepete, site ve işletme karar vericisini teklif/keşif akışına, aksesuar alıcısını ise doğrudan satın almaya götürür.
