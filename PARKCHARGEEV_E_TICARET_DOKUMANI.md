# ParkChargeEV E-Ticaret ve Dijital Deneyim Dokümanı

Hazırlanma tarihi: 21 Nisan 2026

İncelenen tasarım ekranları:
`ana_sayfa`, `ma_aza`, `r_n_detay`, `sepetim`, `deme`, `sipari_detay`, `giri_yap`, `profilim`, `kullan_c_paneli`, `arj_haritas`, `hizmetler`, `kurulum_s_reci`, `neden_park_charge_ev`, `hakk_m_zda`, `i_leti_im`

İncelenen ek tasarım notu:
`stitch_parkchargeev_ak_ll_enerji_platformu/voltflow/DESIGN.md`

## 1. Yönetici Özeti

ParkChargeEV için hazırlanan tasarımlar, klasik bir e-ticaret sitesinden daha geniş bir yapıyı işaret ediyor. Görseller sadece ürün satışı değil; şarj istasyonu keşfi, kurulum hizmeti, satış sonrası destek, kullanıcı hesabı ve aktif şarj takibini de içeren hibrit bir enerji platformu fikrini taşıyor.

Bu nedenle proje, "sadece online mağaza" olarak değil, aşağıdaki üç katmanı birleştiren bir dijital ticaret platformu olarak ele alınmalıdır:

- Ürün satışı: Ev tipi ve iş yeri tipi şarj istasyonları, kablolar, aksesuarlar
- Hizmet satışı: Keşif, projelendirme, montaj, bakım, teknik destek
- Dijital servisler: İstasyon haritası, kullanıcı paneli, sipariş takibi, şarj geçmişi

En doğru konumlandırma:

- B2C: Evine şarj çözümü almak isteyen elektrikli araç sahipleri
- B2B: Site, ofis, AVM, filo ve işletme tarafı için kurumsal çözüm arayan şirketler
- Platform kullanıcıları: Şarj istasyonu ağını kullanan kayıtlı üyeler

Sonuç olarak ParkChargeEV için önerilen yapı, "premium enerji teknolojisi markası" dilinde çalışan, satış ve lead toplama hedefini birlikte taşıyan bir hibrit e-ticaret deneyimidir.

## 2. Tasarım Dili ve Marka Yorumu

Tasarım dili, `DESIGN.md` dosyasındaki "Luminous Eco-Tech" yaklaşımıyla büyük ölçüde uyumludur.

Öne çıkan güçlü taraflar:

- Mavi-yeşil gradyan kullanımı güven ve sürdürülebilirlik temasını aynı anda destekliyor.
- Açık arka planlar, geniş boşluklar ve yumuşak yüzeyler markayı premium ve erişilebilir gösteriyor.
- Hero alanları ve CTA yapısı kullanıcıyı fazla yormadan yönlendiriyor.
- Şarj haritası, kurulum süreci ve kullanıcı paneli gibi ekranlar markayı sadece ürün satan bir yapıdan çıkarıyor.
- Hizmet sayfaları ile mağaza sayfalarının aynı dilde tasarlanmış olması bütünlük sağlıyor.

Dikkat edilmesi gereken görsel sorunlar:

- Bazı ürün görselleri gerçek ürün kategorileriyle uyuşmuyor. Saat, palto, portre, anime karakteri gibi görseller canlı sistem için uygun değil.
- Ürün detay ekranındaki ana ürün görseli EV şarj cihazı algısını zayıflatıyor.
- Görsel kütüphane henüz demo veya placeholder aşamasında görünüyor.
- Bazı ekranlarda bilgi yoğunluğu ile aksiyon yoğunluğu dengesi yeterince satış odaklı değil.

Tasarımın canlıya alınmadan önce gerçek ürün fotoğrafları, teknik çizimler ve kurulum sahnesi görselleri ile yeniden beslenmesi gerekir.

## 3. Projenin İş Hedefi

Bu sitenin ana hedefleri aşağıdaki gibi tanımlanmalıdır:

1. Doğrudan ürün satışı yapmak
2. Kurulum ve keşif taleplerini toplamak
3. Kurumsal müşteri lead'i üretmek
4. İstasyon ağı kullanımını artırmak
5. Satış sonrası kullanıcıyı panel ve harita deneyimine taşımak

İkincil hedefler:

- Marka güveni oluşturmak
- Sürdürülebilirlik anlatısını güçlendirmek
- Teknik ürünleri daha anlaşılır hale getirmek
- Aksesuar ve kurulum paketi ile sepet ortalamasını yükseltmek

## 4. Hedef Kitleler

### Bireysel kullanıcı

- Evine wallbox kurmak isteyen EV sahipleri
- Apartman, villa veya müstakil ev kullanıcıları
- Şarj hızı, kurulum güvenliği ve mobil uygulama entegrasyonu arayan kullanıcılar

### Küçük ve orta ölçekli işletmeler

- Ofisine veya mağazasına şarj noktası kurmak isteyen işletmeler
- Müşteri trafiğini artırmak isteyen ticari alanlar
- Çalışanlarına özel şarj altyapısı sunmak isteyen şirketler

### Kurumsal müşteri

- Site yönetimleri
- AVM ve otopark işletmeleri
- Filo ve lojistik şirketleri
- Otel, restoran, hastane, kampüs gibi çoklu lokasyon sahipleri

## 5. Önerilen Site Konumlandırması

Sitenin iletişim dili "ürün kataloğu" merkezli değil, "çözüm platformu" merkezli olmalıdır.

Önerilen ana mesaj:

"ParkChargeEV, elektrikli araç kullanıcıları ve kurumlar için ürün, kurulum, şarj ağı ve dijital yönetimi tek platformda sunan premium enerji teknolojisi markasıdır."

Bu yaklaşım sayesinde site:

- Sadece fiyat karşılaştırılan bir mağaza gibi görünmez
- Hizmet ve güven katmanını satışın parçası haline getirir
- Kurumsal tarafta yüksek bütçeli fırsatlar üretir

## 6. Bilgi Mimarisi Önerisi

Önerilen ana menü:

- Ana Sayfa
- Ürünler
- Kurulum Hizmetleri
- İstasyon Haritası
- Kurumsal Çözümler
- Hakkımızda
- Destek
- İletişim
- Hesabım

Alt yapı önerisi:

- Ürünler
- Ev Tipi Şarj İstasyonları
- İş Yeri Tipi Şarj İstasyonları
- Kablolar ve Aksesuarlar
- Kurulum Paketleri
- Yedek Parça ve Servis

Kurumsal yapı önerisi:

- Filo Çözümleri
- Site ve Residence Çözümleri
- AVM ve Otopark Çözümleri
- Otel ve Ticari Alan Çözümleri
- Teklif Talep Formu

## 7. Tasarım Ekranlarının İşlevsel Değerlendirmesi

### Ana sayfa

Güçlü taraflar:

- Net hero alanı var
- "Şimdi keşfet" ve "İstasyon bul" CTA'ları doğru
- Hizmet ve mağaza birlikteliği iyi kurulmuş

Geliştirme ihtiyacı:

- Ana hero alanında hangi kullanıcı için hangi çözüm olduğu daha net ayrıştırılmalı
- Bireysel ve kurumsal giriş kapıları belirginleştirilmeli
- Güven unsurları artırılmalı: sertifikalar, müşteri yorumları, marka iş ortakları

### Mağaza listeleme

Güçlü taraflar:

- Kategori ve fiyat filtresi mevcut
- Kart yapısı sade ve anlaşılır
- Sepete ekleme hızlı

Geliştirme ihtiyacı:

- Filtreler teknik ürün mantığına göre genişletilmeli
- Güç seviyesi, priz tipi, kablo uzunluğu, kullanım alanı, bağlantı türü gibi filtreler eklenmeli
- Karşılaştırma özelliği düşünülmeli
- "Kurulum dahil", "stokta", "aynı gün keşif" gibi ticari rozetler eklenmeli

### Ürün detay

Güçlü taraflar:

- Fiyat, varyant, adet ve CTA düzeni doğru
- Teknik özellik tablosu gerekli güveni veriyor
- Kargo ve garanti mesajı faydalı

Geliştirme ihtiyacı:

- Ana ürün görseli mutlaka gerçek ürün ile değişmeli
- Kurulum paketleri ve ek hizmetler upsell olarak eklenmeli
- SSS, kullanıcı yorumları, kullanım senaryosu ve uyumlu araç listesi eklenmeli
- "Bu ürün size uygun mu?" danışman akışı eklenmeli

### Sepet

Güçlü taraflar:

- Özet alanı temiz
- Miktar yönetimi kolay
- Kullanıcıyı ödeme adımına net taşıyor

Geliştirme ihtiyacı:

- Kurulum hizmeti, ek garanti ve aksesuar önerisi eklenmeli
- Kupon/indirim alanı gerekiyorsa burada düşünülmeli
- Teslim süresi ve montaj planı daha görünür olabilir

### Ödeme

Güçlü taraflar:

- Adres, kargo, ödeme adımları ayrılmış
- Sipariş özeti yan paneli iyi çalışıyor
- Güven vurgusu doğru

Geliştirme ihtiyacı:

- Kart formu yerine gerçek ödeme sağlayıcısı bileşeni kullanılmalı
- Mesafeli satış sözleşmesi, KVKK, ön bilgilendirme ve açık rıza alanları eksiksiz tasarlanmalı
- Bireysel fatura ve kurumsal fatura seçimi eklenmeli

### Sipariş detay

Güçlü taraflar:

- Sipariş durumu zaman çizelgesi faydalı
- Ürün özeti ve teslimat bilgileri bir arada
- Fatura indirme düşünülmüş

Geliştirme ihtiyacı:

- Kurulum randevusu durumu ayrıca takip edilebilmeli
- İade, iptal, servis talebi ve destek butonları eklenmeli

### Giriş, profil ve kullanıcı paneli

Güçlü taraflar:

- SSO seçeneği düşünülmüş
- Profil, adres ve güvenlik alanları mevcut
- Panel tarafında aktif şarj ve geçmiş işlem mantığı güçlü

Geliştirme ihtiyacı:

- Kayıt ol, şifre sıfırlama ve doğrulama akışları da tasarlanmalı
- Kullanıcı paneli e-ticaret ve enerji yönetimi arasında daha net bölümlenmeli
- Siparişlerim, faturalarım, servis taleplerim, cihazlarım ve aboneliklerim ayrı modüller olarak yapılandırılmalı

### Şarj haritası

Güçlü taraflar:

- Markanın fark yaratan modüllerinden biri
- İstasyon uygunluğu, hız ve soket tipi birlikte gösteriliyor
- Yol tarifi aksiyonu doğru

Geliştirme ihtiyacı:

- Harita ile mağaza ilişkisi kurulmalı
- Kullanıcıyı üyeliğe veya uygulamaya taşıyan akış düşünülmeli
- "Bu istasyonda kullanılan cihazlar" gibi çapraz ticaret fırsatları değerlendirilebilir

### Hizmetler, neden biz, kurulum, hakkımızda, iletişim

Güçlü taraflar:

- Marka anlatısı güçlü
- Kurulum süreci satışa destek oluyor
- İletişim ve destek alanları güven oluşturuyor

Geliştirme ihtiyacı:

- Hizmet sayfaları kurumsal lead toplama açısından daha agresif optimize edilmeli
- Her içerik sayfasında sabit teklif/keşif CTA'sı olmalı
- Referans projeler ve vaka çalışmaları eklenmeli

## 8. Önerilen Ürün Kataloğu Yapısı

Ana kategoriler:

- Ev tipi AC şarj istasyonları
- Ticari AC/DC şarj istasyonları
- Kablolar
- Soket ve adaptörler
- Duvar aparatı ve aksesuarlar
- Kurulum paketleri
- Bakım ve servis paketleri

Ürün kartında görünmesi gereken alanlar:

- Ürün adı
- Güç bilgisi
- Kullanım tipi
- Bağlantı tipi
- Stok durumu
- Kurulum dahil veya hariç bilgisi
- Fiyat
- Taksit veya ödeme avantajı bilgisi

Ürün detayda görünmesi gereken ek alanlar:

- Uyumlu araç tipi
- Kurulum gereksinimleri
- Elektrik altyapı ihtiyacı
- Garanti kapsamı
- Teslimat ve montaj süresi
- Teknik doküman indir

## 9. Temel E-Ticaret Gereksinimleri

Zorunlu modüller:

- Üyelik ve oturum yönetimi
- Ürün listeleme ve detay
- Sepet ve checkout
- Adres ve fatura yönetimi
- Sipariş ve iade yönetimi
- Kampanya ve kupon altyapısı
- Stok ve varyant yönetimi
- Kurulum paketi satışı
- Fatura ve sipariş PDF çıktısı
- Teknik servis ve destek talebi

Özel gereksinimler:

- Ürün ile hizmetin aynı sepette satılabilmesi
- Şehir bazlı kurulum uygunluğu kontrolü
- Kurulum randevu slot yönetimi
- Harita ve kullanıcı paneli entegrasyonu
- Kurumsal teklif formu ve CRM aktarımı

## 10. Eksik veya Tasarlanması Gereken Sayfalar

Mevcut görsellerde henüz görünmeyen ama canlı sistem için kritik olan sayfalar:

- Kayıt ol
- Şifre sıfırlama
- Siparişlerim listesi
- İade ve iptal süreci
- SSS
- Karşılaştırma sayfası
- Arama sonuçları sayfası
- Kampanya veya sezon sayfası
- Kurumsal teklif talep sayfası
- Referans projeler
- Blog veya rehber içerikleri
- KVKK, çerez, mesafeli satış sözleşmesi, ön bilgilendirme ve teslimat/iade politikaları

## 11. İçerik ve Dönüşüm Önerileri

Satışı güçlendirecek içerikler:

- "Evime hangi şarj cihazı uygun?" rehberi
- Apartman ve site kurulumu için karar ağacı
- Kurulum öncesi kontrol listesi
- Şarj maliyeti hesaplayıcı
- Marka ve ürün karşılaştırma tabloları
- Müşteri yorumları ve saha fotoğrafları
- Sertifikalar, yetki belgeleri, garanti kapsamları

Dönüşüm artırıcı unsurlar:

- Sabit keşif CTA'sı
- WhatsApp veya canlı destek hattı
- Sepette aksesuar önerisi
- Ürün detayda kurulum paketi önerisi
- Kurumsal kullanıcılar için teklif al butonu

## 12. Görsel ve UX Revizyon Öncelikleri

Canlıya çıkmadan önce ilk sırada yapılması gerekenler:

1. Tüm placeholder ve alakasız görsellerin gerçek ürün veya gerçek kullanım senaryosu ile değiştirilmesi
2. Ürün taksonomisinin netleştirilmesi
3. B2C mağaza ile B2B hizmet kurgusunun menü ve CTA seviyesinde ayrıştırılması
4. Mobil kırılımlarının ayrıca tasarlanması
5. Checkout ve hukuki metin alanlarının tam akışa dönüştürülmesi

İkinci faz UX geliştirmeleri:

1. Ürün karşılaştırma
2. Filtre derinleştirme
3. Randevu planlama
4. Kurulum keşif sihirbazı
5. Panel ile sipariş ve servis modüllerinin birleşmesi

## 13. MVP Kapsam Önerisi

İlk canlı sürüm için önerilen kapsam:

- Ana sayfa
- Ürün listeleme
- Ürün detay
- Sepet
- Checkout
- Sipariş sonucu ve sipariş detay
- Hakkımızda
- Hizmetler
- Kurulum süreci
- İletişim
- Giriş / kayıt / profil
- Basit kullanıcı paneli
- Basit harita deneyimi
- Kurumsal teklif formu

İlk sürümde ertelenebilecek alanlar:

- Gelişmiş sadakat sistemi
- Gelişmiş kampanya motoru
- Çoklu dil
- Bayi paneli
- Abonelik tabanlı bakım sözleşmesi otomasyonu

## 14. Fazlandırma Yol Haritası

### Faz 1

- Marka sitesi + mağaza + temel checkout
- Kurulum talep toplama
- Temel kullanıcı hesabı

### Faz 2

- Şarj haritası entegrasyonu
- Sipariş ve servis takibi
- Gelişmiş ürün filtreleme ve karşılaştırma

### Faz 3

- Kurumsal teklif ve proje yönetimi
- Panel içinde cihaz, ödeme ve kullanım yönetimi
- Sadakat, üyelik veya mobil uygulama entegrasyonları

## 15. Başarı Göstergeleri

Takip edilmesi önerilen temel KPI'lar:

- Ürün görüntüleme -> sepete ekleme oranı
- Sepet -> ödeme tamamlama oranı
- Kurulum talep formu dönüşüm oranı
- Kurumsal teklif formu dönüşüm oranı
- Ortalama sepet tutarı
- Aksesuar ekleme oranı
- Sipariş sonrası panel aktivasyon oranı
- Harita kullanım oranı

## 16. Net Sonuç

ParkChargeEV tasarımları, iyi kurgulanırsa pazarda sıradan bir e-ticaret sitesi değil, "ürün + hizmet + ağ + yazılım" yaklaşımını bir araya getiren güçlü bir ticaret platformuna dönüşebilir.

Bu tasarım setinin en büyük avantajı:

- Premium bir marka hissi vermesi
- Enerji ve sürdürülebilirlik temasını iyi taşıması
- Satış sonrası deneyimi baştan düşünmüş olması

Bu tasarım setinin en büyük riski:

- Demo görseller ve placeholder öğeler nedeniyle güven algısının zayıflaması
- E-ticaret ile servis platformu mimarisinin net ayrıştırılmaması
- Teknik ürün satışında gereken detay ve güven katmanlarının henüz eksik olması

Genel değerlendirme:

ParkChargeEV için doğru yön, klasik mağaza mantığı yerine "elektrikli araç şarj ekosistemi platformu" yaklaşımını sahiplenmektir. Tasarım bu potansiyeli taşıyor. Bundan sonraki aşamada içerik, ürün verisi, gerçek görsel seti ve bilgi mimarisi netleştirilirse proje güçlü bir markaya dönüşebilir.
