# ParkChargeEV 2026 Yeni Site, Persona Evrenleri, UI/UX/DX ve Satış Yolculuğu Raporu

Tarih: 23 Haziran 2026  
Kapsam: Türkiye pazarı, EV şarj cihazı satışı, kurulum hizmetleri, ürün seçici, mağaza, ürün listeleme, ürün detay, sepet, PayTR uyumlu ödeme, müşteri paneli, admin içerik operasyonu ve ölçüm altyapısı.

Bu raporun amacı ParkChargeEV için yalnızca yeni bir görsel arayüz önermek değil; farklı müşteri personalarının satın alma davranışlarını modelleyip bu davranışların kesişiminden en yüksek satış potansiyeline sahip ortak web sitesi mimarisini çıkarmaktır.

## 1. Yönetici Özeti

ParkChargeEV'in yeni sitesi bir "şarj cihazı kataloğu" gibi değil, "doğru şarj kararını hızlandıran satış ve danışmanlık platformu" gibi çalışmalıdır.

Kazanan model:

```text
Güven veren ilk ekran
  -> Persona rotası
  -> Ürün seçici veya mağaza
  -> Ürün detayda karar kanıtı
  -> Mobilde sabit satın alma
  -> Sepette net toplam
  -> PayTR uyumlu güvenli ödeme
  -> Sipariş / keşif / kurulum takibi
```

Yeni siteyi taşıyacak ana fikir:

> Aracınız, otoparkınız ve altyapınız için doğru şarj çözümünü tek yerde seçin.

Bu cümle üç ana işi aynı anda yapar:

- Ev tipi alıcıya doğru cihazı buldurur.
- Site/apartman ve işletme karar vericisini keşif/teklif akışına sokar.
- Aksesuar veya kablo alıcısını hızlı e-ticaret akışına taşır.

## 2. Araştırma Kaynakları ve Güncel Pazar Sinyalleri

### 2.1 Resmi pazar sinyalleri

| Kaynak | Bulgular | ParkChargeEV çıkarımı |
|---|---|---|
| EPDK Şarj Hizmeti Piyasası İstatistikleri | EPDK, Enerji Dönüşümü altında şarj hizmeti piyasası istatistiklerini ve şarj ağı altyapısı projeksiyonlarını yayımlıyor. 2026 Ocak, Şubat, Mart ve Nisan raporları listeleniyor. | Şarj pazarı regüle edilen ve aylık izlenen bir pazardır. Site teknik güven, yasal süreç, kurulum netliği ve izlenebilirlik hissi vermelidir. |
| ODMD Perakende Satış Raporları | ODMD, 2026 Ocak-Mayıs dahil aylık perakende satış raporları yayımlıyor. | EV sahipliği artarken ev tipi wallbox, Type 2 kablo ve site/işletme altyapı talebi de büyür. Kampanya ve SEO içerikleri aylık pazar ivmesine göre güncellenmelidir. |
| ZES | ZES ana sayfasında 81 il, soket sayısı, AC/DC/HPC filtreleri, araç bulucu, rota planlama ve mobil uygulama deneyimi öne çıkıyor. | ParkChargeEV şarj ağı değil; ama "kapsama, uyum, kolaylık, hızlı destek" sinyallerini ürün ve kurulum tarafında aynı kuvvetle vermelidir. |
| Eşarj | Eşarj, araç sahipleri, ev-işyeri çözümleri, filo çözümleri, iş ortaklığı ve portal akışlarını ayrıştırıyor. | ParkChargeEV bireysel, kurumsal, filo ve iş ortağı akışlarını ayrı satış rotaları olarak tasarlamalıdır. |
| Tesla Wall Connector | Hız, araç uyumu, power management, uygulama kontrolü, garanti, ticari kullanım ve access control ürün anlatımında üstte sunuluyor. | Ürün detay sayfalarında güç, soket, altyapı, uyum, garanti, kurulum ve kime uygun olduğu ilk ekranda görünmelidir. |
| Wallbox Pulsar Plus | "Best for", güç seçimi, dinamik yük yönetimi, sigorta atmasını önleme, uygulama kontrolü ve teknik özellikler net gösteriliyor. | Ev ve apartman alıcısı için yük yönetimi, sigorta, pano, faz ve enerji yönetimi korkuları sade anlatılmalıdır. |
| NN/g kullanılabilirlik heuristikleri | Sistem durumu, gerçek dünya dili, hata önleme, tanıma, minimalist tasarım ve anlaşılır hata mesajları vurgulanıyor. | Teknik terimler sadeleştirilmeli, tüm formlar ve ödeme akışı açık durum geri bildirimi vermelidir. |
| Baymard checkout araştırması | Karmaşık checkout sepet terkini artırır; ideal checkout akışı çok daha az form alanıyla kurulabilir. | Sipariş ekranı kısa, güvenli ve PayTR odaklı tasarlanmalı; kullanıcıya gereksiz alan sorulmamalıdır. |

Kaynaklar:

- EPDK: https://www.epdk.gov.tr/Detay/Icerik/3-0-222/enerji-donusumusarj-hizmeti-piyasasi--istatistik
- ODMD: https://www.odmd.org.tr/web_2837_1/neuralnetwork.aspx?type=36
- ZES: https://zes.net/
- Eşarj: https://esarj.com/
- Tesla Wall Connector: https://www.tesla.com/support/charging/wall-connector
- Wallbox Pulsar Plus: https://wallbox.com/en_us/pulsar-plus-ev-charger
- NN/g Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- Baymard Checkout: https://baymard.com/lists/cart-abandonment-rate

## 3. Rakip UX ve Satış Deseni Analizi

### 3.1 Rakip tipi bazlı okuma

| Rakip grubu | Örnek | Kullandığı satış dili | Güçlü yanı | ParkChargeEV'in alması gereken ders |
|---|---|---|---|---|
| Şarj ağı operatörü | ZES | 81 il, istasyon, soket, araç bulucu, uygulama | Kapsama ve güven | 81 il ürün kargosu, araç uyumu ve hızlı destek daha görünür olmalı. |
| Şarj ağı operatörü | Eşarj | Araç sahibi, ev/işyeri, filo, iş ortaklığı | Segment ayrımı | Site menüsü bireysel, kurumsal, filo ve iş ortağı akışlarını ayırmalı. |
| Cihaz üreticisi | Tesla | Hız, uyum, kurulum, garanti, ticari kullanım | Sade teknik karar | Ürün detay ilk ekranı teknik ama yalın olmalı. |
| Cihaz üreticisi | Wallbox | Ev, apartman, enerji yönetimi, uygulama kontrolü | "Best for" ve enerji yönetimi | ParkChargeEV ürün kartlarında "kimler için" bilgisini kısa göstermeli. |
| Genel e-ticaret | Trendyol / Hepsiburada desenleri | Ürün, fiyat, stok, yorum, hızlı sepet | Hızlı satın alma | Mağaza açılışı katalog gibi olmalı; büyük hero kullanıcıyı ürünlerden uzaklaştırmamalı. |
| B2B çözüm sitesi | Enerji/altyapı firmaları | Teklif, keşif, referans, teknik rapor | Kurumsal güven | Site/apartman ve işletme için teklif ve keşif akışı ayrı tasarlanmalı. |

### 3.2 Rakiplerden çıkan ortak desen

Başarılı EV şarj siteleri şu sorulara hızlı cevap veriyor:

1. Bu ürün benim aracıma uygun mu?
2. Evimde veya otoparkımda çalışır mı?
3. Kaç kW seçmeliyim?
4. Kurulum gerekir mi?
5. Kargo ve servis nerede var?
6. Ödeme güvenli mi?
7. Emin değilsem kime soracağım?

ParkChargeEV'in yeni tasarımı bu yedi soruya ilk 90 saniyede cevap vermelidir.

## 4. ParkChargeEV İçin İdeal Konumlandırma

### 4.1 Marka vaadi

> Doğru cihazı, doğru altyapıyı ve güvenli kurulum yolunu birlikte netleştiren EV şarj platformu.

### 4.2 Ana fark

ParkChargeEV yalnızca ürün satmaz. Kullanıcıyı üç olası yoldan doğru olanına yönlendirir:

- **Hemen satın al:** Kablo, aksesuar, hazır cihaz.
- **Uygunluğu kontrol et:** Ev tipi AC cihaz, altyapı belirsizliği.
- **Teklif/keşif al:** Site, apartman, işletme, filo, ticari lokasyon.

### 4.3 Ticari öncelik sırası

| Öncelik | Segment | Neden |
|---|---|---|
| 1 | Ev tipi AC alıcısı | Karar süresi kısa, sepet dönüşümü yüksek, pazar büyüyor. |
| 2 | Aksesuar / Type 2 kablo alıcısı | Hızlı satın alma, düşük danışmanlık ihtiyacı, mobil e-ticaret uyumlu. |
| 3 | Site/apartman karar vericisi | Teklif bedeli yüksek, sosyal kanıtla dönüşebilir. |
| 4 | KOBİ/ofis otoparkı | 22 kW AC ve servis desteğiyle karlı segment. |
| 5 | Filo ve ticari lokasyon | Uzun karar süresi ama yüksek proje değeri. |
| 6 | Elektrikçi/partner | Dolaylı satış kanalı ve kurulum ağı değeri. |

## 5. Persona Seti

### 5.1 Persona 1 - Yeni EV sahibi ev kullanıcısı

| Alan | Detay |
|---|---|
| Temsilci | Murat, 38, özel sektör çalışanı |
| Araç | Togg T10X, Tesla Model Y, BYD Atto 3, MG4 |
| İhtiyaç | Evde güvenli AC şarj, 7.4/11 kW kararı |
| Acı noktası | Pano uygun mu, trifaze gerekir mi, yanlış cihaz alır mıyım? |
| Motivasyon | Aracı her sabah dolu bulmak |
| İtiraz | Kurulum maliyeti belirsizliği |
| Siteye giriş | Google: "ev tipi araç şarj cihazı", "Togg ev şarj cihazı", "11 kW wallbox" |
| En iyi CTA | Evime Uygun Cihazı Bul, Ücretsiz Keşif İste, Sepete Ekle |
| Dönüşüm skoru | 9/10 |

### 5.2 Persona 2 - Aksesuar ve hızlı alışveriş kullanıcısı

| Alan | Detay |
|---|---|
| Temsilci | Deniz, 32, yeni araç teslim almış kullanıcı |
| İhtiyaç | Type 2 kablo, adaptör, çanta, doğru kablo uzunluğu |
| Acı noktası | 5 metre mi 7 metre mi, aracımla uyumlu mu? |
| Motivasyon | Aracı hemen eksiksiz kullanmak |
| İtiraz | Yanlış soket veya düşük kalite korkusu |
| Siteye giriş | Google Shopping, sosyal medya, direkt mağaza |
| En iyi CTA | Hemen Satın Al, Aracımla Uyumlu mu? |
| Dönüşüm skoru | 8.8/10 |

### 5.3 Persona 3 - Site/apartman karar vericisi

| Alan | Detay |
|---|---|
| Temsilci | Selin, 45, site yöneticisi |
| İhtiyaç | Ortak otoparkta adil, güvenli ve ölçeklenebilir şarj altyapısı |
| Acı noktası | Yönetim onayı, maliyet paylaşımı, yangın güvenliği, trafo/pano belirsizliği |
| Motivasyon | Sakin taleplerini çözmek, site değerini artırmak |
| İtiraz | Teknik sorumluluk ve kurul kararı |
| Siteye giriş | Google: "apartmanda elektrikli araç şarj istasyonu", "site otopark şarj çözümü" |
| En iyi CTA | Site İçin Keşif Planla, Yönetim Teklifi Al |
| Dönüşüm skoru | 8/10 |

### 5.4 Persona 4 - KOBİ / ofis otoparkı yöneticisi

| Alan | Detay |
|---|---|
| Temsilci | Emre, 41, işletme sahibi veya idari işler yöneticisi |
| İhtiyaç | Çalışan, misafir veya filo için 22 kW AC şarj |
| Acı noktası | Bakım, servis, raporlama, kullanıcı takibi |
| Motivasyon | Kurumsal algı, çalışan memnuniyeti, filo verimliliği |
| İtiraz | Operasyon yükü ve arıza muhatabı |
| Siteye giriş | LinkedIn, Google, kurumsal çözüm sayfaları |
| En iyi CTA | Kurumsal Teklif Al, 22 kW Çözümleri Gör |
| Dönüşüm skoru | 8/10 |

### 5.5 Persona 5 - Filo ve operasyon yöneticisi

| Alan | Detay |
|---|---|
| Temsilci | Ece, 39, filo/operasyon yöneticisi |
| İhtiyaç | Çoklu araç şarj planı, RFID, raporlama, kullanıcı yetkilendirme |
| Acı noktası | Araç sırası, enerji tüketimi, takip ve vardiya planı |
| Motivasyon | Operasyonel verimlilik ve maliyet kontrolü |
| İtiraz | Yazılım entegrasyonu ve destek kalitesi |
| Siteye giriş | Kurumsal çözüm, teklif formu, LinkedIn |
| En iyi CTA | Filo İçin Teklif Al, RFID ve Raporlama Çözümlerini Gör |
| Dönüşüm skoru | 7.5/10 |

### 5.6 Persona 6 - Ticari lokasyon yatırımcısı

| Alan | Detay |
|---|---|
| Temsilci | Hakan, 50, otel, restoran, AVM, akaryakıt veya yol üstü lokasyon sahibi |
| İhtiyaç | DC hızlı şarj veya çoklu AC yatırım kararı |
| Acı noktası | Trafo, lisans, ROI, saha uygunluğu |
| Motivasyon | Şarjı gelir modeline çevirmek |
| İtiraz | Yüksek yatırım bedeli ve uzun geri dönüş |
| Siteye giriş | Google: "DC hızlı şarj istasyonu maliyeti", "şarj istasyonu yatırım" |
| En iyi CTA | ROI Ön Fizibilite Al, Saha Keşfi Planla |
| Dönüşüm skoru | 6.8/10 |

### 5.7 Persona 7 - Elektrikçi / kurulum partneri

| Alan | Detay |
|---|---|
| Temsilci | Ahmet, 36, elektrik teknikeri |
| İhtiyaç | Teknik doküman, ürün tedariki, montaj standardı |
| Acı noktası | Yanlış ürün tavsiyesi, garanti dışı kurulum, doküman eksikliği |
| Motivasyon | Güvenilir tedarik ve yeni müşteri kazanımı |
| İtiraz | Marj, garanti, teknik destek |
| Siteye giriş | Blog, teknik doküman, partner başvurusu |
| En iyi CTA | Partner Başvurusu, Teknik Doküman İndir |
| Dönüşüm skoru | 7/10 |

### 5.8 Persona 8 - Kararsız araştırmacı / ilk kez EV düşünen kullanıcı

| Alan | Detay |
|---|---|
| Temsilci | Ayşe, 34, EV satın almayı planlıyor |
| İhtiyaç | Evde şarj mümkün mü, aylık maliyet ne olur, hangi cihaz gerekir? |
| Acı noktası | Teknik terim korkusu ve bilgi yorgunluğu |
| Motivasyon | EV satın almadan önce altyapı riskini görmek |
| İtiraz | Henüz araç almadan yatırım yapma kararsızlığı |
| Siteye giriş | Blog, ürün seçici, maliyet rehberi |
| En iyi CTA | Şarj Uygunluğunu Test Et, Rehberi Oku |
| Dönüşüm skoru | 6.5/10 |

## 6. Çoklu Satın Alma Evrenleri

Bu bölümde her persona için farklı satın alma davranışı evreni tasarlanır. Amaç ayrı ayrı kazanan parçaları test edip ortak site tasarımına taşımaktır.

### Evren A - Hızlı e-ticaret evreni

| Alan | Detay |
|---|---|
| Hedef | Aksesuar alıcısı, ev tipi cihaz alıcısı |
| Psikoloji | Fiyat, stok, kargo ve sepete ekleme hızı |
| Ana ekran | Mağaza, kategori çipleri, kompakt ürün kartları |
| Kritik bileşen | Mobil sticky satın alma barı |
| Başarı metriği | Ürün detay tıklama, sepete ekleme, ödeme başlatma |
| Risk | Teknik ürünlerde yanlış seçim korkusu |
| Risk azaltma | "Aracımla uyumlu mu?" mikro CTA |

### Evren B - Uzman rehber evreni

| Alan | Detay |
|---|---|
| Hedef | Yeni EV sahibi, kararsız araştırmacı |
| Psikoloji | Yanlış ürün alma korkusu |
| Ana ekran | Ürün seçici, 4 soruluk karar akışı |
| Kritik bileşen | Sonuç ekranında önerilen güç + ürün + kurulum ihtiyacı |
| Başarı metriği | Ürün seçici tamamlanma, keşif formu |
| Risk | Çok soru sormak dönüşümü düşürür |
| Risk azaltma | Maksimum 4 soru, her soru tek karar aldırmalı |

### Evren C - Kurumsal teklif evreni

| Alan | Detay |
|---|---|
| Hedef | Site, KOBİ, filo, ticari lokasyon |
| Psikoloji | Risk azaltma, teknik güven, teklif netliği |
| Ana ekran | Kurumsal çözüm sayfaları ve teklif formu |
| Kritik bileşen | "Yönetim kuruluna sunulabilir teklif" dili |
| Başarı metriği | Kurumsal teklif formu tamamlanma |
| Risk | Çok teknik anlatım kullanıcıyı yorar |
| Risk azaltma | Katmanlı bilgi: kısa özet, accordion, teknik PDF |

### Evren D - Premium teknoloji güven evreni

| Alan | Detay |
|---|---|
| Hedef | Tüm personalar |
| Psikoloji | Modern, güvenilir ve uzman marka algısı |
| Ana ekran | Gerçek ürün/kurulum görseli, sade motion, net CTA |
| Kritik bileşen | PayTR, garanti, 81 il kargo, teknik destek |
| Başarı metriği | Hero CTA CTR, bounce rate, scroll depth |
| Risk | Aşırı animasyon performansı düşürür |
| Risk azaltma | CSS transform/opacity, lazy medya, reduced motion |

### Evren E - Yerel hizmet + ulusal kargo evreni

| Alan | Detay |
|---|---|
| Hedef | Türkiye geneli ürün alıcısı, Marmara saha hizmeti müşterisi |
| Psikoloji | "Bana hizmet var mı?" sorusu |
| Ana ekran | 81 il ürün kargosu + saha hizmeti bölge notu |
| Kritik bileşen | İl bazlı uygunluk kontrolü |
| Başarı metriği | Kargo satışları, keşif talepleri |
| Risk | Sadece yerel firma algısı |
| Risk azaltma | "Ürün kargosu Türkiye geneli, saha hizmeti planlı" ayrımı |

### Evren F - Teknik partner evreni

| Alan | Detay |
|---|---|
| Hedef | Elektrikçiler ve kurulum partnerleri |
| Psikoloji | Teknik doğruluk, garanti, tedarik hızı |
| Ana ekran | Partner sayfası, teknik doküman, başvuru |
| Kritik bileşen | Montaj checklist ve ürün teknik tabloları |
| Başarı metriği | Partner başvurusu, doküman indirme |
| Risk | Son kullanıcıyı teknik detayla boğmak |
| Risk azaltma | Partner içeriği ayrı rota olarak tutulmalı |

### Evren G - ROI ve yatırım evreni

| Alan | Detay |
|---|---|
| Hedef | Ticari lokasyon yatırımcısı |
| Psikoloji | Geri dönüş süresi ve operasyon riski |
| Ana ekran | ROI hesaplayıcı, saha fizibilite formu |
| Kritik bileşen | DC / çoklu AC yatırım ön değerlendirme |
| Başarı metriği | Fizibilite talebi |
| Risk | Yüksek fiyat ilk temas dönüşümünü düşürür |
| Risk azaltma | "Ön fizibilite" mikro dönüşümü |

### Evren H - İçerik ve SEO evreni

| Alan | Detay |
|---|---|
| Hedef | Araştırma aşamasındaki tüm kullanıcılar |
| Psikoloji | Önce öğren, sonra karar ver |
| Ana ekran | Blog, rehber, karşılaştırma, SSS |
| Kritik bileşen | Rehberden ürün seçiciye ve mağazaya net CTA |
| Başarı metriği | Blog -> ürün seçici, blog -> ürün detay |
| Risk | Bilgi tüketilip çıkılması |
| Risk azaltma | Her içerikte "uygunluğu kontrol et" CTA |

## 7. Ortak Yeni Site Mimarisi

### 7.1 Sitemap

```text
/
/magaza
/magaza?category=ev-tipi
/magaza?category=site-apartman
/magaza?category=isletme
/magaza?category=aksesuar
/urun-secici
/urun/[slug]
/karsilastir
/sepet
/odeme
/kurumsal-cozumler
/kurumsal-cozumler/site-ve-apartman
/kurumsal-cozumler/is-yeri-ve-ofis
/kurumsal-cozumler/filo-ve-otopark
/hizmetler
/blog
/blog/[slug]
/iletisim
/giris
/hesabim
/admin
```

### 7.2 Navigasyon

Desktop:

```text
Top Trust Bar:
PayTR güvenli ödeme | Ürün kargosu: 81 il | Uzman destek | Keşif ve kurulum planı

Header:
Logo | Ev Tipi | Site & Apartman | İşletmeler | Mağaza | Kurulum | Blog | İletişim
CTA: Ürün Seçici | Keşif Al | Sepet
```

Mobil:

```text
Logo | Menü | Sepet
Sticky Bottom:
WhatsApp | Ürün Seçici | Sepet
```

Mega menü:

| Menü | İçerik |
|---|---|
| Ev Tipi | 7.4 kW, 11 kW, Type 2, evde kurulum, uygunluk testi |
| Site & Apartman | RFID, yük yönetimi, yönetim teklifi, ortak otopark |
| İşletmeler | 22 kW AC, filo, raporlama, kurumsal teklif |
| Mağaza | Ev tipi, ticari AC, DC, aksesuar, karşılaştırma |
| Kurulum | Keşif, pano kontrolü, süreç, SSS |

## 8. Ana Sayfa Tasarımı

### 8.1 Hedef

Ana sayfa kullanıcının kim olduğunu hızlı anlamalı ve onu doğru satış yoluna sokmalıdır. Fazla metin değil, kısa karar blokları kullanılmalıdır.

### 8.2 Desktop wireframe

```text
Hero
Sol:
  H1: Aracınız ve altyapınız için doğru şarj çözümünü seçin.
  Alt metin: Ev, site ve işletmeler için ürün, uyumluluk ve kurulum süreci tek yerde.
  CTA 1: Ürünleri İncele
  CTA 2: Uygunluğu Kontrol Et
  CTA 3: WhatsApp
Sağ:
  Gerçek wallbox / kurulum görseli veya hafif cihaz motion sahnesi
  Overlay: 11 kW ev, 22 kW site/ofis, Type 2 uyum

Persona Rotaları
Ev için | Site/Apartman için | İşletme için

Satış Yolu
Hızlı alışveriş | Uygunluk kontrolü | Kurumsal teklif

Kompakt Mağaza Seridi
4-6 ürün, fiyat, stok, karar çipi

Kurulum Netliği
Uygunluk | Keşif | Kurulum | Destek

Güven ve Sosyal Kanıt
PayTR | 81 il kargo | garanti | teknik destek | referans kurulum

Rehberler
11 kW mı 22 kW mı?
Apartmanda şarj kurulumu
Type 2 kablo nasıl seçilir?

Final CTA
Doğru cihazı birlikte netleştirelim.
```

### 8.3 Mobile wireframe

```text
Sticky Header
Logo | Menü | Sepet

Hero
Kısa H1
CTA: Ürünleri İncele
CTA: Uygunluğu Kontrol Et

Trust Strip
PayTR | 81 il | Uzman destek

3 Rota
Ev | Site | İşletme

Kompakt Ürün Slider
Ürün görseli | fiyat | stok | incele

Sticky Bottom
WhatsApp | Ürün Seçici | Sepet
```

### 8.4 Ana sayfa bölüm kuralları

- Her bölüm tek amaca hizmet etmeli.
- H2 başlıkları kısa olmalı.
- Mobilde uzun açıklamalar gizlenmeli veya 2 satırla sınırlandırılmalı.
- Animasyonlar içerik okumayı engellememeli.
- Ürünler ana sayfada erken görünmeli.

## 9. Mağaza ve Ürün Listeleme

### 9.1 Mağaza hedefi

Mağaza sayfası ilk açılışta ürünleri göstermelidir. Kullanıcı "satın alma moduna" girmiştir; büyük pazarlama hero alanı yerine arama, kategori ve ürün kartı önceliklidir.

### 9.2 PLP wireframe

```text
Compact Header
Başlık: EV Şarj Mağazası
Arama: Togg, Tesla, 11 kW, Type 2, RFID...

Kategori Çipleri
Tümü | Ev Tipi | Site/Apartman | İşletme | DC | Aksesuar

Desktop:
Sol filtre:
  Güç
  Faz
  Soket
  RFID
  Wi-Fi
  OCPP
  Yük dengeleme
  Kurulum ihtiyacı
  Fiyat
Sağ:
  Sonuç sayısı
  Sıralama
  Grid / liste görünüm
  Ürün kartları

Mobile:
Arama
Yatay kategori çipleri
Filtrele butonu
Sırala butonu
2 kolon kompakt ürün kartı
```

### 9.3 Ürün kartı içeriği

Kartta kalacak:

- Ürün görseli
- Kategori / badge
- Ürün adı
- Güç veya kablo uzunluğu
- Soket
- Kurulum notu
- Stok
- Fiyat
- İncele CTA
- Keşif / uyum sor CTA

Karttan çıkarılacak veya gizlenecek:

- Uzun açıklama
- Tekrar eden teknik metin
- Büyük "tanıtım" blokları
- Ürün detayına ait uzun karar içerikleri

### 9.4 Sıralama

- Önerilenler
- Çok satanlar
- Fiyat artan
- Fiyat azalan
- Ev için önerilenler
- Ticari kullanım için önerilenler

## 10. Ürün Seçici Tasarımı

### 10.1 Hedef

Ürün seçici, teknik terimleri bilmeyen kullanıcının doğru ürüne yönlenmesini sağlar. Satış aracı gibi çalışmalıdır, quiz gibi uzun olmamalıdır.

### 10.2 Soru akışı

```text
Soru 1: Aracınız nedir?
  Togg | Tesla | BYD | MG | Diğer

Soru 2: Kurulum nerede yapılacak?
  Ev | Villa | Site/apartman | Ofis/işletme | Ticari lokasyon

Soru 3: Elektrik altyapınız nedir?
  Monofaze | Trifaze | Emin değilim

Soru 4: Günlük kullanım ihtiyacınız nedir?
  Geceden sabaha | Gün içinde hızlı | Çoklu araç | Ticari kullanım
```

### 10.3 Sonuç ekranı

```text
Önerilen güç: 7.4 / 11 / 22 kW / DC
Önerilen ürün: Ürün kartı
Kurulum ihtiyacı: Yok / Sabit kurulum / Keşif önerilir
Uyum notu: Araç ve soket açıklaması
CTA:
  Sepete Ekle
  Ürünü İncele
  Ücretsiz Keşif İste
```

### 10.4 Ürün seçici UX kuralları

- Her soru tek karar aldırmalı.
- "Emin değilim" seçeneği mutlaka olmalı.
- Sonuçta tek öneri + iki alternatif gösterilmeli.
- Kullanıcı mağazaya geri dönebilmeli.
- Sonuç sayfasında ürün, keşif ve WhatsApp CTA birlikte olmalı.

## 11. Ürün Detay Sayfası

### 11.1 Desktop wireframe

```text
Breadcrumb

Sol:
  Görsel galeri
  Thumbnail
  Teknik karar bilgileri
  Bu ürün kimler için?
  Uygun kullanım alanları

Sağ sticky buybox:
  Stok / badge
  Ürün adı
  Kısa özet
  Fiyat
  Güç / soket / kurulum çipleri
  Satın alma yolu:
    Ürünü satın al
    Keşifle ilerle
  Varyant / kablo
  Miktar
  Sepete ekle
  Ara toplam
  PayTR | 81 il kargo | garanti

Alt:
  Teknik özellikler
  Kurulum bilgileri
  SSS
  İlgili ürünler
```

### 11.2 Mobile wireframe

```text
Görsel galeri
Ürün adı
Fiyat
3 karar çipi
Kısa özet

Accordion:
  Satın alma yolu
  Teknik özellikler
  Kurulum
  Uyumlu araçlar
  SSS

İlgili ürünler:
  Yatay kaydırmalı

Sticky bottom:
  Fiyat
  Sepete Ekle
```

### 11.3 Kritik kurallar

- Mobilde iki adet "Sepete Ekle" görünmemeli.
- Fiyat ve sepete ekle ekranın altına sabitlenmeli.
- Masaüstünde sağ kolon sticky kalmalı.
- Görsel alanı ürünün gerçek fotoğrafını kapsamalı; filigran veya gereksiz overlay kullanılmamalı.
- Teknik karar bilgileri ürün görselinin altında boşluğu dolduracak şekilde yerleşmeli.

## 12. Sepet ve Sipariş Akışı

### 12.1 Sepet hedefi

Sepet kullanıcıya "ne alıyorum, ne kadar ödeyeceğim, kargo/kurulum nasıl ilerleyecek?" sorularını hızlı cevaplamalıdır.

### 12.2 Sepet wireframe

```text
Sol:
  Ürün satırları
  Görsel
  Ad
  Varyant
  Miktar
  Kaldır
  Aksesuar önerileri

Sağ:
  Ara toplam
  KDV
  Kargo notu
  Kurulum notu
  Güvenli ödemeye geç
  PayTR güvenli ödeme
```

### 12.3 PayTR uyumlu ödeme akışı

```text
1. Sepet doğrulama
2. İletişim bilgileri
3. Teslimat/adres bilgileri
4. Ön bilgilendirme ve mesafeli satış onayı
5. PayTR ödeme doğrulaması
6. Sipariş sonucu
7. Müşteri panelinde takip
```

Güvenlik kuralları:

- Kart verisi ParkChargeEV sunucusunda saklanmamalıdır.
- Tutar sunucuda yeniden hesaplanmalıdır.
- PayTR callback kesin ödeme sonucu olarak kabul edilmelidir.
- Teknik hata mesajları kullanıcıya ham haliyle gösterilmemelidir.

Örnek hata dili:

- "Ödeme oturumu başlatılamadı. Lütfen bilgilerinizi kontrol edin veya WhatsApp destekten yardım alın."
- "Sepetinizdeki ürünlerden biri güncellendi. Devam etmeden önce sepetinizi tekrar kontrol edin."
- "PayTR bağlantısı şu anda yanıt vermedi. Kart bilgileriniz kaydedilmedi, tekrar deneyebilirsiniz."

## 13. Müşteri Paneli

Müşteri paneli yalnızca hesap sayfası değil, sipariş ve kurulum güven alanı olmalıdır.

### 13.1 Panel bölümleri

- Siparişlerim
- Ödeme durumum
- Teslimat takibi
- Kurulum / keşif taleplerim
- Adreslerim
- Araç bilgilerim
- Favori ürünlerim
- Destek taleplerim

### 13.2 Müşteri paneli UX

- Sipariş durumu kartlarla gösterilmeli.
- PayTR ödeme sonucu ayrı rozetle görünmeli.
- Kurulum talebi varsa "sıradaki adım" açık yazılmalı.
- Adres ekleme checkout ile aynı alan düzeninde olmalı.
- Mobilde tüm kartlar kısa ve tek kolon olmalı.

## 14. Admin Paneli ve İçerik Operasyonu

Admin paneli satış operasyonunu hızlandırmalı ve içerik ekleyen kişiye rehberlik etmelidir.

### 14.1 Admin modülleri

- Dashboard
- Ürünler
- Ürün medya yönetimi
- Araç uyumluluğu
- Kategoriler
- Blog / rehberler
- Site sayfaları
- Navigasyon
- Siparişler
- PayTR operasyonları
- Keşif talepleri
- Kurumsal teklifler
- Müşteriler
- Roller ve erişim
- Audit log

### 14.2 Admin yardım metni kuralı

Her metin alanında şu üç bilgi görünmeli:

```text
Bu alan nerede görünür?
Nasıl yazılmalı?
İyi örnek nedir?
```

Örnek:

```text
Ürün kısa özeti
Nerede görünür: Mağaza kartı ve ürün detay üst bölümünde.
Nasıl yazılmalı: 1-2 cümle, kullanım alanı + fayda + kurulum bilgisi.
İyi örnek: Ev ve villa kullanımı için 11 kW AC şarj çözümü; Type 2 uyumlu araçlarda güvenli günlük şarj sağlar.
```

## 15. Heuristik UX Matrisi

| Heuristik | Site uygulaması |
|---|---|
| Sistem durumu görünürlüğü | Sepete eklendi, ödeme hazırlanıyor, PayTR yönleniyor, sipariş doğrulanıyor mesajları anlık görünmeli. |
| Gerçek dünya dili | Trifaze, RFID, OCPP gibi terimler sade açıklamayla desteklenmeli. |
| Kullanıcı kontrolü | Filtre temizle, sepetten çıkar, formda geri dön, ürün seçicide cevap değiştir. |
| Tutarlılık | Ev, site, işletme ve aksesuar segmentleri her sayfada aynı renk/ikon/CTA ile devam etmeli. |
| Hata önleme | Eksik adres, geçersiz kart, stok değişimi, yanlış varyant kullanıcı ödeme öncesi görmeli. |
| Tanıma, hatırlama değil | Ürün kartlarında "Ev için", "Site için", "Kurulum gerekir" gibi çipler kullanılmalı. |
| Esneklik | Hızlı satın al, keşifle ilerle, WhatsApp, ürün seçici alternatifleri aynı ekosistemde olmalı. |
| Minimalizm | Uzun metinler accordion, tooltip veya rehber sayfasına taşınmalı. |
| Hata kurtarma | Teknik hata yerine Türkçe çözüm mesajı verilmeli. |
| Yardım ve dokümantasyon | Teknik özellik örnekleri, admin alan açıklamaları, SSS ve rehberler bulunmalı. |

## 16. UI Tasarım Sistemi

### 16.1 Görsel dil

- Premium ama ağır değil.
- Beyaz/soft zemin + koyu yeşil + mint vurgu.
- Gerçek ürün ve kurulum görselleri.
- Hafif enerji çizgileri, grid ve motion.
- Mobilde büyük kartlar yerine kompakt karar blokları.

### 16.2 Component kuralları

| Component | Kural |
|---|---|
| Button | Birincil CTA koyu yeşil; ikincil CTA beyaz/çerçeveli. |
| Product Card | Sabit yükseklik, kısa açıklama, fiyat ve CTA görünür. |
| Filter Drawer | Mobilde tam ekran değil; alt sheet veya kompakt drawer. |
| Buybox | Desktop sticky, mobil bottom sticky. |
| Accordion | Teknik bilgi, kurulum, SSS için kullanılmalı. |
| Trust Bar | Header üstünde veya hero altında kısa rozetler. |
| Form | Her bölüm 4-6 alanı geçmemeli, hata mesajı alan altında Türkçe olmalı. |

### 16.3 Motion kuralları

- Scroll animasyonları 280-340 ms bandında olmalı.
- WebGL/3D mobilde yüklenmemeli veya lazy yüklenmeli.
- `prefers-reduced-motion` desteklenmeli.
- Arka plan efektleri düşük opacity ve düşük blur kullanmalı.
- Görsel hareket satış kararını desteklemeli, dikkat dağıtmamalı.

## 17. DX ve Frontend Mimarisi

### 17.1 Component katmanları

```text
src/components/conversion
  trust-bar.tsx
  persona-route-card.tsx
  funnel-lane-card.tsx
  sticky-mobile-buy-bar.tsx

src/components/commerce
  product-grid.tsx
  product-card-compact.tsx
  product-filter-drawer.tsx
  product-sort-control.tsx
  cart-summary.tsx

src/components/decision
  product-selector.tsx
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
  service-coverage.ts
  shop-merchandising.ts
  product-routing.ts
```

### 17.2 Performans kuralları

- Mağaza ürün listeleme server-first olmalı.
- Filtre state URL query ile yönetilmeli.
- Client JS yalnızca gerekli etkileşimlerde kullanılmalı.
- Görseller boyutları tanımlı gelmeli.
- Video lazy + poster ile yüklenmeli.
- Checkout ve admin cache dışı olmalı.
- Katalog sayfaları kontrollü revalidate ile çalışmalı.
- Analytics eventleri hafif data-attribute tabanlı olmalı.

## 18. CRO Ölçüm Planı

### 18.1 Event haritası

| Event | Tetikleyici |
|---|---|
| `pce_hero_cta_click` | Hero CTA tıklaması |
| `pce_persona_route_click` | Ev/site/işletme rota tıklaması |
| `pce_product_filter_apply` | Mağaza filtre kullanımı |
| `pce_product_detail_view` | Ürün detay görüntüleme |
| `pce_purchase_mode_select` | Satın al / keşifle ilerle seçimi |
| `pce_add_to_cart` | Sepete ekleme |
| `pce_checkout_start` | Ödeme akışı başlatma |
| `pce_paytr_session_request` | PayTR oturumu hazırlama |
| `pce_contact_submit` | Keşif / iletişim formu gönderimi |
| `pce_selector_complete` | Ürün seçici sonucu |

### 18.2 Funnel metrikleri

```text
Ana sayfa görüntüleme
  -> Persona rota tıklama
  -> Mağaza / ürün seçici
  -> Ürün detay
  -> Sepete ekleme
  -> Checkout başlatma
  -> PayTR ödeme
  -> Sipariş tamamlandı
```

Kurumsal funnel:

```text
Ana sayfa / kurumsal sayfa
  -> Site / işletme rota kartı
  -> Teklif formu
  -> Admin panelde lead
  -> Keşif planı
  -> Teklif
```

## 19. A/B Test Modeli

| Test | Hipotez | A | B | Başarı metriği |
|---|---|---|---|---|
| Hero mesajı | Çözüm odaklı H1 daha fazla tıklatır. | Ürün odaklı | Çözüm odaklı | Hero CTR |
| Persona rotası | 3 ana rota 5 karttan daha net karar aldırır. | 5 eşit kart | 3 ana + 2 mini | Rota CTR |
| Ürün seçici | 4 soruluk akış 6 sorudan daha iyi tamamlanır. | 6 soru | 4 soru | Completion rate |
| Mağaza açılışı | Kategori + ürün ilk ekran dönüşümü artırır. | Büyük hero | Kompakt katalog | PLP -> PDP CTR |
| PDP mobil | Sticky buy bar sepete eklemeyi artırır. | Normal CTA | Sticky fiyat + sepet | Add-to-cart |
| Checkout | Kısa checkout terk oranını düşürür. | Tüm alanlar tek form | Bölümlü kısa form | Checkout completion |

## 20. İçerik ve CTA Kütüphanesi

### 20.1 Ana mesajlar

- Aracınız ve altyapınız için doğru şarj çözümünü seçin.
- Şarj cihazını değil, güvenli kurulumla birlikte doğru çözümü alın.
- Ev, site ve işletmeler için şarj kararını tek yerde netleştirin.

### 20.2 Persona CTA'ları

| Persona | CTA |
|---|---|
| Ev kullanıcısı | Evime Uygun Cihazı Bul |
| Aksesuar alıcısı | Hemen Satın Al |
| Site yöneticisi | Site İçin Keşif Planla |
| İşletme | Kurumsal Teklif Al |
| Filo | Filo Çözümü Planla |
| Ticari lokasyon | ROI Ön Fizibilite Al |
| Elektrikçi | Partner Başvurusu Yap |

### 20.3 Güven mesajları

- PayTR güvenli ödeme altyapısı.
- Ürün kargosu Türkiye'nin 81 iline.
- Kurulum ve keşif süreci planlı ilerler.
- Araç, soket ve güç uyumu birlikte kontrol edilir.
- Sipariş ve ödeme durumu panelden takip edilir.

## 21. SEO, GEO ve AIEO Yapısı

### 21.1 SEO kümeleri

| Küme | Sayfa / içerik |
|---|---|
| Ev tipi şarj | Ev tipi araç şarj cihazı, wallbox, 11 kW, 7.4 kW |
| Araç marka uyumu | Togg şarj cihazı, Tesla wallbox, BYD Type 2 |
| Site/apartman | Apartmanda şarj cihazı kurulumu, site otopark şarj |
| İşletme | Ofis otopark şarj istasyonu, 22 kW AC |
| Aksesuar | Type 2 kablo, şarj kablosu 5m, adaptör |
| Yatırım | DC hızlı şarj istasyonu maliyeti, şarj istasyonu yatırım |

### 21.2 AIEO / LLM discovery

- `/llms.txt` güncel tutulmalı.
- Ürün sayfalarında teknik özellikler tablo olarak verilmeli.
- SSS alanları schema ile işaretlenmeli.
- Bloglarda net soru-cevap formatı kullanılmalı.
- Kurulum ve ödeme süreçleri adım adım açıklanmalı.

## 22. Faz Faz Uygulama Planı

### Faz 0 - Hijyen ve ölçüm

- Türkçe karakter kontrolü.
- Conversion event altyapısı.
- Core Web Vitals ölçümü.
- PayTR hata mesajı kontrolü.

### Faz 1 - Tasarım sistemi

- Renk tokenları.
- Tipografi.
- Button, card, chip, form, drawer, accordion.
- Mobil compact kurallar.

### Faz 2 - Ana sayfa

- Hero sadeleştirme.
- 3 ana persona rotası.
- Satış yolu akışı.
- Kompakt ürün seridi.
- Güven ve sosyal kanıt.

### Faz 3 - Mağaza

- Büyük hero kaldırma.
- Kategori çipleri.
- Sol filtre + mobil drawer.
- Kompakt ürün kartları.
- Kaydırmalı ürün rayı.

### Faz 4 - Ürün seçici

- 4 soruluk akış.
- Sonuç kartı.
- Ürün önerisi.
- Keşif CTA.
- Sepete ekle CTA.

### Faz 5 - Ürün detay

- Desktop sticky buybox.
- Mobil sticky buy bar.
- Teknik bilgi accordion.
- İlgili ürün slider.
- Gerçek ürün medya alanı.

### Faz 6 - Sepet ve ödeme

- Kısa sepet özeti.
- PayTR uyumlu ödeme.
- Türkçe hata mesajları.
- Sipariş sonucu ve takip.

### Faz 7 - Müşteri/admin panel

- Sipariş, ödeme, keşif ve kurulum takibi.
- Admin ürün medya, araç uyumu ve içerik yardım metinleri.
- Lead ve teklif yönetimi.

### Faz 8 - QA ve optimizasyon

- Lighthouse.
- Mobil kullanılabilirlik.
- Checkout test siparişi.
- A/B test kurulumu.
- SEO schema kontrolü.

## 23. Kabul Kriterleri

Yeni site başarılı sayılmak için:

- Ana sayfa ilk ekranda tek mesaj, 3 rota ve net CTA sunmalı.
- Mağaza ilk ekranda ürünleri göstermeli.
- Ürün seçici 4 soru içinde sonuç üretmeli.
- Ürün detayda mobil sticky satın alma tekil olmalı.
- Sepet ve ödeme akışı PayTR ile güvenli çalışmalı.
- Teknik hata mesajları kullanıcıya ham haliyle gösterilmemeli.
- Tüm sayfalarda Türkçe karakterler doğru olmalı.
- Mobilde kartlar ve formlar ekranı gereksiz büyütmemeli.
- Admin panel içerik yazan kişiye alan bazlı rehberlik sağlamalı.
- Ölçüm eventleri satış funnelını takip edebilmeli.

## 24. Sonuç

ParkChargeEV için en yüksek satış potansiyeline sahip yeni site; premium teknoloji markası algısını, gerçek e-ticaret hızını ve uzman kurulum danışmanlığını birleştirmelidir.

Kısa formül:

```text
Güven
  + doğru rota
  + kompakt mağaza
  + ürün seçici
  + net ürün detay
  + mobil sticky satın alma
  + PayTR uyumlu ödeme
  = daha düşük sürtünme ve daha yüksek satış dönüşümü
```

Bu yapı bütün personaları tek sayfada aynı mesaja zorlamaz. Her kullanıcı kendi karar evrenine girer; kazanan parçalar ortak bir ParkChargeEV deneyiminde birleşir.

## 25. 23 Haziran 2026 Uygulama Notu

Bu turda rapordaki strateji kod tarafında iki kritik satış yüzeyine taşındı: ana sayfa karar evrenleri ve mağaza girişindeki açılır ürün seçici. Amaç, kullanıcıyı uzun metinlerle yormadan kendi satın alma evrenine alıp ilgili ürünleri hızlıca göstermektir.

### 25.1 Ana Sayfa Karar Evrenleri

Ana sayfadaki karar evrenleri üç net satış rotasına indirildi:

| Evren | Hedef kullanıcı | Satış davranışı | Arayüz kararı |
|---|---|---|---|
| Hızlı satın alma | Aksesuar, kablo ve stoktan ürün arayan kullanıcı | Fiyat, stok, kargo ve hızlı inceleme görürse ilerler | Kompakt kart, kısa güven mesajı ve doğrudan mağaza CTA'sı |
| Uygunluk rehberi | Ev tipi wallbox alıcısı ve yeni EV sahibi | Pano, faz, soket ve güç belirsizliği azalırsa dönüşür | Ürün seçici ve uygunluk kontrolü CTA'sı |
| Kurumsal karar | Site yönetimi, işletme, filo ve yatırımcı | Teknik güven, teklif ve saha keşfi netleşirse lead bırakır | Kurumsal teklif, RFID/OCPP ve saha dili |

Bu yapı ana sayfada aynı anda hem e-ticaret hızını hem de uzman danışmanlık hissini verir. “Herkese aynı mesaj” yerine kullanıcının karar yükünü azaltan üç kapı oluşturur.

### 25.2 Mağaza Girişinde Açılır Şarj Aleti Seçici

Mağaza girişine açılır sekme olarak “Elektrikli şarj aleti seçici” eklendi. Kullanıcı dört kısa soruyla ilgili ürün listesine ulaşır:

1. Kullanım alanı: ev/villa, site, işletme, aksesuar.
2. Altyapı bilgisi: monofaze, trifaze, yüksek güç veya emin değilim.
3. Satın alma niyeti: satın al, keşif, ortak kullanım veya yatırım.
4. Öncelik: denge, hız veya kolaylık.

Seçici, ürünleri şu sinyallere göre puanlar:

- kategori,
- güç seviyesi,
- stok durumu,
- kurulum ihtiyacı,
- kullanım alanı,
- ortak kullanım / RFID / OCPP gibi kurumsal sinyaller,
- aksesuar veya DC yatırım niyeti.

Sonuç ekranında en alakalı dört ürün kısa nedenlerle gösterilir. Bu yapı Trendyol/Hepsiburada tarzı hızlı listeleme refleksini, EV şarj sektöründeki teknik uygunluk ihtiyacıyla birleştirir.

### 25.3 Ölçüm ve CRO Mantığı

Yeni alanlarda conversion event altyapısı kullanıldı:

- `persona_route_click`: persona/evren rotalarındaki tıklamaları ölçer.
- `seo_intent_click`: arama niyeti çipleriyle ürün/çözüm girişlerini ölçer.
- `selector_result_click`: mağaza seçici sonucundan ürün detayına geçişi ölçer.

Bu eventler A/B test aşamasında hangi evrenin daha yüksek ürün detay ziyareti, sepete ekleme ve keşif formu dönüşümü sağladığını göstermek için kullanılmalıdır.

### 25.4 Güncel Sayfa Kurgusu

| Sayfa | Güncel tasarım kararı | Dönüşüm etkisi |
|---|---|---|
| Ana sayfa | Üç karar evreni, persona CTA'ları, arama niyeti kümeleri ve güven mesajları birlikte çalışır | Kullanıcı kendi rotasını daha hızlı seçer |
| Mağaza | Arama, segment kartları, güven çipleri ve açılır ürün seçici üstte konumlanır | İlk ekranda ürün keşfi ve uygunluk kararı hızlanır |
| Ürün listeleme | Mevcut kompakt ürün kartları korunur; seçici ilgili ürünlere yönlendirir | Kart karmaşası artmadan yeni karar katmanı eklenir |
| Ürün detay | Mevcut sticky satın alma ve teknik bilgi düzeni, seçiciden gelen daha nitelikli trafikle desteklenir | Kullanıcı ürüne daha hazırlıklı gelir |
| Sepet / ödeme | PayTR uyumlu güvenli akış korunur | Teknik ödeme güveni zedelenmeden satış tamamlanır |

### 25.5 Kabul Kontrolü

- Mağaza girişinde açılır ürün seçici görünür.
- Seçici dört karar alanıyla ilgili ürünleri listeler.
- Sonuç kartları fiyat, stok, güç/ürün profili ve inceleme CTA'sı içerir.
- Ana sayfada karar evrenleri sade ve üçlü yapıya iner.
- Türkçe karakterler dosya içeriğinde UTF-8 olarak korunur.
- TypeScript tip kontrolü temiz geçer.

### 25.6 Sonraki Tasarım Kapıları

Bir sonraki iterasyonda en yüksek etki sağlayacak alanlar:

1. Ürün seçici bağımsız sayfasını mağaza açılır seçiciyle aynı skor mantığına bağlamak.
2. Ürün detay sayfasında “bu ürün kimler için?” alanını seçici sonucuna göre daha görünür yapmak.
3. Mağaza mobil filtre drawer davranışını event bazlı ölçmek.
4. Sepet ve PayTR dönüşüm hunisine kullanıcı terk eventleri eklemek.
5. Admin panelde ana sayfa mesajları, evren kartları ve seçici metinlerini CMS alanlarıyla yönetilebilir yapmak.

## 26. Premium Revizyon Katmanı

Bu aşamada plan “sayfa tasarımı” seviyesinden çıkarılıp ParkChargeEV için premium bir karar işletim sistemi modeline genişletildi.

### 26.1 Premium Deneyim Protokolü

| Katman | Ne yapar? | Kullanıcı etkisi |
|---|---|---|
| Güven konsolu | PayTR, 81 il kargo, uzman destek, kurulum ve sipariş takibi mesajlarını aynı deneyimde toplar | Kullanıcının ödeme ve teslimat kaygısını azaltır |
| Karar motoru | Ev, site, işletme, aksesuar ve yatırım niyetlerini ayrıştırıp ilgili ürünleri öne çıkarır | Kullanıcı yanlış ürüne gitmeden doğru ürün kümesine ulaşır |
| E-ticaret hızı | Fiyat, stok, kısa ürün özeti, hızlı CTA ve mobil satın alma davranışını önce gösterir | Ürün detay ve sepete ekleme oranı güçlenir |
| Operasyon takibi | Sipariş, keşif, kurulum ve destek süreçlerini müşteri/admin panellerine bağlar | Satış sonrası güven ve tekrar satın alma ihtimali artar |

### 26.2 Mağaza Seçici Geliştirmesi

Mağaza girişindeki açılır seçici artık yalnızca “ilgili ürünler” listesi değildir. Her öneri bir uyum skoru, kısa gerekçe ve karar CTA'sı ile sunulur.

Yeni gösterim mantığı:

```text
Kullanıcı cevabı
  -> ürün profili
  -> güç / kategori / kurulum / stok sinyali
  -> uyum skoru
  -> ürün detaya geçiş
```

Bu yapı özellikle şu üç sürtünmeyi azaltır:

1. “Bu ürün bana uygun mu?” belirsizliği.
2. “Kurulum gerekir mi?” kaygısı.
3. “Hangi ürünü önce incelemeliyim?” karar yorgunluğu.

### 26.3 Ana Sayfa Premium Karar Alanı

Ana sayfadaki karar evrenleri artık yalnızca segment kartı değil, ölçülebilir satış deneyimi bloklarıdır. Her evren şu bilgileri taşır:

- hedef persona,
- satın alma tetikleyicisi,
- uygulanacak UI deseni,
- ölçülecek başarı metriği,
- yönlendirme CTA'sı.

Bu sayede ana sayfa, tasarım olarak daha premium görünürken aynı zamanda CRO ve A/B test mantığına hazır hale gelir.

### 26.4 Geliştirilmiş Kabul Kriterleri

- Ana sayfa karar evrenleri üç rota ve ölçüm metriğiyle görünür olmalı.
- Premium deneyim protokolü güven, karar, hız ve operasyon katmanlarını açıklamalı.
- Mağaza seçici açılır sekme olarak çalışmalı ve önerilerde uyum skoru göstermeli.
- Ürün önerileri kullanıcıyı ürün detayına izlenebilir conversion event ile taşımalı.
- Mobilde bu alanlar yatay kaydırmalı, kompakt ve okunabilir kalmalı.
- TypeScript, lint ve production build hatasız geçmeli.
