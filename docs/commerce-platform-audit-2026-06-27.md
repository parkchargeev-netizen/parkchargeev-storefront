# ParkChargeEV Ticaret Platformu Denetimi ve Pazar Benchmark Raporu

Tarih: 2026-06-27  
Kapsam: ParkChargeEV.com frontend, backend, admin panel, ödeme, SEO/GEO/AIEO, performans, güvenlik ve ticari büyüme mimarisi.

## 1. Yönetici Özeti

ParkChargeEV artık yalnızca tanıtım sitesi değil; ürün satışı, kurulum lead'i, teknik servis, PayTR ödeme, müşteri hesabı, admin operasyonu ve içerik/SEO yönetimi olan hibrit bir EV charging commerce platformu seviyesine gelmiş durumda.

En güçlü fırsat alanı şudur:

> "Elektrikli araç şarj cihazı satışı + keşif + kurulum + satış sonrası destek" tek deneyimde birleşmeli.

Rakip benchmark'a göre kategori liderleri yalnızca ürün göstermiyor; teknik uyumluluk, kurulum güveni, stok/teslimat, garanti, ürün varyantı, profesyonel destek, kampanya, yorum/puan, karşılaştırma ve zengin yapılandırılmış veri katmanlarını aynı akışa yerleştiriyor. ParkChargeEV'in mevcut altyapısı bu seviyeye yaklaşmış durumda, ancak üst seviye e-ticaret için kampanya/kupon, gerçek yorum sistemi, gelişmiş stok hareketleri, müşteri segmentasyonu, raporlama ve admin modül ayrıştırması tamamlanmalı.

## 2. Araştırma Kaynakları ve Benchmark Kriterleri

İncelenen kaynak grupları:

- Google Search Central Product ve Merchant Listing yapılandırılmış veri rehberleri.
- web.dev Core Web Vitals ve INP optimizasyon rehberleri.
- PayTR iFrame API 1. ve 2. adım dokümantasyonu.
- Global EV charging ürün sayfası örneği olarak Tesla Wall Connector.
- Yerel ve bölgesel EV charging çözüm örneği olarak Voltrun.
- ParkChargeEV repo içindeki mevcut Next.js, Drizzle, PayTR, admin, SEO ve test dosyaları.

Öne çıkan benchmark ilkeleri:

- Ürün sayfası: fiyat, stok, SKU, varyant, teknik özellik, araç uyumu, kurulum gereksinimi, garanti, teslimat, iade, güvenli ödeme ve ilgili ürünler aynı sayfada açık olmalı.
- Kategori sayfası: filtre, arama, sıralama, karşılaştırma, kategori niyeti ve ürün seçici akışı bir arada çalışmalı.
- Checkout: kart bilgisi site backend'inde tutulmamalı, ödeme sağlayıcı iframe/token ile çalışmalı, callback asenkron ve idempotent olmalı.
- SEO: Product, Offer, MerchantReturnPolicy, shipping, Service, Organization, LocalBusiness, FAQ, Breadcrumb ve Article şemaları gerçek sayfa içeriğiyle uyumlu olmalı.
- Admin: ürün, sipariş, ödeme, müşteri, kampanya, stok, içerik ve raporlama ayrı domain modülleri olarak yönetilmeli.
- Performans: animasyonlar GPU dostu transform/opacity hattında kalmalı; ağır admin, rich text, chart ve checkout bileşenleri public bundle'a sızmamalı.

## 3. Pazar ve Rakip Analizi

### Global Liderlerden Çıkarımlar

Tesla Wall Connector sayfası önemli bir örnek: ürün başlığını, fiyatı, stok durumunu, kablo seçimini, sahiplik uygunluğunu, teknik özellikleri, garanti bilgisini ve kurulum rehberini aynı sayfada veriyor. Buradaki ana ders, EV şarj ürünlerinde satın alma kararının yalnızca "cihaz" değil "uyum + kurulum + güven" ekseninde alındığıdır.

Global premium ürün sayfalarında ortak desenler:

- Büyük ve gerçek ürün görselleri.
- Kısa karar özeti: güç, kablo, bağlantı, iç/dış mekân, yazılım özellikleri.
- Kurulum zorunluluğu ve yetkili elektrikçi/sertifikalı ekip yönlendirmesi.
- Stok ve yeniden stok bildirimi.
- Garanti, iade, destek ve uyumluluk vurgusu.
- Hesap/araç sahipliği ya da uygunluk kontrolü.

ParkChargeEV karşılığı:

- Ürün detay sayfaları teknik specs ve satın alma paneli açısından güçlü.
- "Bu ürün hangi araç/alan için?" akışı daha görünür ve ölçülebilir hale getirilmeli.
- Kurulum paketi, keşif talebi ve ürün satın alma birbirine daha yakın bağlanmalı.

### Yerel ve Bölgesel Rakiplerden Çıkarımlar

Voltrun gibi yerel oyuncular "network + çözüm + segment" modelini öne çıkarıyor. Bireysel kullanıcı, site/apartman, iş merkezi, ticari lokasyon, otel, AVM, akaryakıt, otopark ve kamu gibi segmentler ayrı anlatılıyor. Ayrıca kampanya, partnerlik, yatırımcı, lokasyon önerme ve destek akışları belirgin.

ParkChargeEV karşılığı:

- ParkChargeEV doğrudan ulusal şarj ağı gibi konumlanmamalı.
- Daha doğru konum: EV şarj ekipmanı e-ticareti + saha keşfi + kurulum + proje danışmanlığı.
- Kurumsal çözümler tarafı zaten mevcut; bunu daha fazla vaka, teklif formu ve hesaplanabilir yatırım/kurulum maliyeti ile güçlendirmek gerekir.

### Pazarda Öne Çıkan Satış Artırıcı Özellikler

- Ürün karşılaştırma.
- Kullanım senaryosuna göre ürün seçici.
- Kargo, garanti, iade ve teknik destek rozetleri.
- Kurulum paketi upsell'i.
- Stokta yoksa bildirim bırakma.
- Sepeti terk eden kullanıcıya e-posta/telefon lead kaydı.
- Ürün yorumları ve doğrulanmış satın alma puanları.
- Kampanya, kupon ve bundle teklifleri.
- Kurumsal teklif CRM'i.
- Teknik rehber, SSS ve araç uyumluluk sayfaları.

ParkChargeEV'de karşılaştırma, ürün seçici, sepet kurtarma niyeti, teklif ve saha lead akışı başlamış durumda. Eksik kalan ana ticari modüller gerçek yorum/puan, kampanya-kupon, stok hareketleri, gelişmiş raporlama ve müşteri segmentasyonu.

## 4. ParkChargeEV Mevcut Güçlü Yönler

- Next.js App Router ile sayfa, API ve admin yapısı kurulmuş.
- Ürün, varyant, medya, teknik özellik, kategori, marka, sipariş, müşteri, sepet, PayTR işlem, teklif, saha lead, blog, site CMS ve audit tabloları mevcut.
- Ürün sayfalarında Product/ProductGroup/Offer JSON-LD bulunuyor.
- Organizasyon, LocalBusiness, WebSite SearchAction, Service, OfferCatalog, Article, Breadcrumb ve FAQ şemaları mevcut.
- Mağaza sayfasında arama, filtre, kategori, sort, görünüm modu, ürün seçici, ItemList/CollectionPage semantiği bulunuyor.
- PayTR iframe/token akışı kart bilgisini backend'e almadan çalışacak şekilde tasarlanmış.
- PayTR callback hash doğruluyor, ödeme tutarı ve para birimini kontrol ediyor, duplicate callback'i idempotent ele alıyor.
- Admin panel ürün, sipariş, teklif, saha, blog, katalog, site yönetimi, PayTR, audit ve admin kullanıcı modüllerine sahip.
- Admin dashboard tek SQL read model ile KPI, dağılım ve aktivite özetlerini alıyor.
- Teknik mimari gate, runtime smoke, admin smoke, UI/UX gate ve e2e/a11y/visual test scriptleri mevcut.

## 5. Frontend Denetimi

### Güçlü Alanlar

- Ana sayfa, mağaza, ürün detay, ürün seçici, karşılaştırma, sepet, checkout, müşteri hesabı, blog ve hizmet sayfaları ayrı rotalara ayrılmış.
- Public sayfalarda semantik başlık, metadata ve JSON-LD kullanımı var.
- Mağaza kartları, ürün seçici, karşılaştırma ve checkout akışı e-ticaret kararını destekliyor.
- Motion sistemi performans kaygısıyla kademeli olarak optimize edilmiş; global ambient, section reveal ve reduced-motion guard'ları var.

### Eksik ve Riskli Alanlar

- Gerçek kullanıcı yorumu, puan ve doğrulanmış satın alma işareti yok. Sahte rating eklenmemeli; gerçek review domain modeli kurulmalı.
- Ürün kartlarında "kurulum dahil mi, hızlı kargo mu, stok miktarı kaç adet" gibi karar sinyalleri daha ölçülebilir hale getirilebilir.
- Stokta olmayan ürünlerde yeniden stok bildirimi veya alternatif ürün önerisi eksik.
- Kategori/filtre yapısı iyi; fakat "ev tipi", "site/apartman", "iş yeri", "DC hızlı şarj", "aksesuar" gibi ticari landing sayfaları kategori şemasıyla daha net bağlanmalı.
- Kurulum paketi upsell'i ürün detay ve checkout arasında daha görünür olabilir.
- Bundle akışı yok: cihaz + kurulum + kablo + kaçak akım koruma + keşif paketi.

## 6. Backend ve Veri Modeli Denetimi

### Güçlü Alanlar

- Drizzle schema domain kapsamı geniş.
- Order, OrderItem, OrderStatusHistory ve PayTR transaction ayrımı doğru.
- Product, ProductVariant, ProductMedia, ProductSpecs ve ProductRelations ayrımı e-ticaret için iyi temel.
- Customer ve CustomerAddress temel kullanıcı hesabını destekliyor.
- QuoteRequest, QuoteActivity ve ServiceLead EV sektöründeki proje/kurulum akışına uyuyor.
- AuditLogs ve AdminSessions güvenlik yönetimi için doğru katman.

### Eksik Domain Modelleri

P0/P1 büyüme için eklenmesi gereken tablolar:

- `product_reviews`: doğrulanmış satın alma, puan, yorum, medya, moderasyon, yayın durumu.
- `promotions`: kampanya adı, koşul, başlangıç/bitiş, minimum sepet, kategori/ürün kapsamı.
- `coupon_codes`: tekil kod, kullanım limiti, müşteri segmenti, indirim tipi, kullanım geçmişi.
- `inventory_movements`: stok giriş/çıkış, sipariş ilişkisi, admin, sebep, önce/sonra miktar.
- `customer_segments`: B2C, apartman yöneticisi, filo, işletme, bayi, tekrar müşteri.
- `merchant_feed_exports`: Google Merchant Center ve ürün feed izleme.
- `payment_reconciliations`: PayTR işlem no, mutabakat durumu, iade/chargeback takibi.
- `content_authors`: teknik yazar, editör, reviewer, E-E-A-T sinyali.
- `search_analytics_snapshots`: Search Console/Bing/AI visibility verisi için periyodik özet.

### Mimari Riskler

Kodda büyük dosya riskleri ölçüldü:

- `src/app/globals.css`: 11162 satır.
- `src/components/admin/product-form.tsx`: 2401 satır.
- `src/server/admin/repository.ts`: 2145 satır.
- `src/server/admin/fallback-store.ts`: 1468 satır.
- `src/components/shop/checkout-page-client.tsx`: 837 satır.

Bu dosyalar bugün çalışıyor; fakat SOLID ve sürdürülebilirlik açısından domain bazlı ayrıştırma yapılmalı. Öncelik, davranışı değiştirmeden küçük read/write repository'lere, form section bileşenlerine ve test edilebilir servis katmanlarına bölmek olmalı.

## 7. Admin Panel Denetimi

### Mevcut Modüller

- Dashboard.
- Ürünler.
- Siparişler.
- Teklifler.
- Saha talepleri.
- Blog/içerik.
- Katalog: kategori ve marka.
- Site yönetimi: sayfa ve navigasyon.
- PayTR operasyonları.
- Audit log.
- Admin kullanıcıları ve roller.

### Ürün Yönetimi

Güçlü:

- Ürün, varyant, medya, teknik specs, SEO, AI summary, ilişki ve kategori yönetimi bulunuyor.
- Ürün formu e-ticaret standardına yaklaşmış durumda.

Eksik:

- Bulk edit, bulk publish/archive, bulk price update.
- Stok hareket geçmişi.
- Kampanya/kupon ilişkisi.
- Ürün kalite skoru: eksik görsel, eksik SEO, eksik specs, stok riski, fiyat uyumsuzluğu.
- Merchant Center feed durumu.
- Ürün yorum moderasyonu.

### Sipariş Yönetimi

Güçlü:

- Durum yönetimi, kargo alanları, ödeme ve PayTR ilişki takibi var.
- OrderStatusHistory bulunuyor.

Eksik:

- İade/iptal/chargeback workflow.
- Fatura ve e-arşiv/e-fatura entegrasyon alanı.
- Kargo firması entegrasyonu ve otomatik takip linki üretimi.
- Sipariş not şablonları ve müşteri bilgilendirme eventleri.

### Ödeme Takibi

Güçlü:

- PayTR transaction, token, raw request/callback ve callback status tutuluyor.
- Hash doğrulama ve duplicate callback guard var.

Eksik/Risk:

- PayTR panelindeki Bildirim URL'nin `https://parkchargeev.com/api/paytr/callback` olarak tanımlı ve herkese açık olduğunun canlıda doğrulanması gerekir.
- 3D Secure banka iframe zinciri için CSP canlı header'ı checkout sayfasında tekrar doğrulanmalı.
- Mutabakat, iade ve PayTR işlem dökümü raporu ayrı admin modülü olmalı.

### Kategori, Müşteri, Kampanya, Raporlama

Eksikler:

- Kategori landing SEO alanları sınırlı; kategori açıklaması, FAQ, hero medya, internal link ve schema yönetimi eklenmeli.
- Müşteri listeleme/segmentasyon/CRM görünümü ayrı modül olarak eksik.
- Kampanya ve kupon yönetimi yok.
- Raporlama dashboard özetinde güçlü; fakat funnel, kanal, ürün performansı, stok dönüş hızı, sepet terk oranı ve ödeme hata oranı raporları eksik.
- İçerik yönetiminde blog var; teknik yazar/reviewer ve content freshness workflow eklenmeli.

## 8. SEO, GEO ve AIEO Denetimi

### Mevcut Güçlü Temel

- Robots, sitemap, llms, JSON-LD ve markdown endpointleri kurulmuş.
- Product, Offer, Service, Article ve Organization yapılandırılmış verileri mevcut.
- Store, product, service ve blog sayfaları semantik olarak ayrılmış.
- AI crawler ve LLM discovery stratejisi önceki dokümanlarda tanımlanmış.

### Geliştirilmesi Gerekenler

- Google Merchant Center feed'i kurulmalı ve Product schema ile senkron tutulmalı.
- Gerçek yorum sistemi kurulmadan `aggregateRating` eklenmemeli.
- Kategori sayfaları entity cluster olarak güçlendirilmeli:
  - `/magaza?category=Ev Tipi` yerine kanonik `/elektrikli-arac-sarj-cihazlari/ev-tipi` gibi SEO landing'leri.
  - `/elektrikli-arac-sarj-cihazi-kurulumu/sakarya`, `/kocaeli`, `/istanbul` gibi lokal servis sayfaları genişletilmeli.
- Ürün sayfalarına araç uyumu, pano/tesisat gereksinimi, monofaze/trifaze karar rehberi ve kurulum paketi bağlantısı daha güçlü bağlanmalı.
- Blog içerikleri "cevap motoru" formatında 40-80 kelimelik doğrudan yanıt + teknik tablo + ürün/hizmet bağlantısı yapısına çekilmeli.
- AI aramalarında öne çıkmak için marka varlığı tutarlı kullanılmalı: `ParkChargeEV` bir EV charger e-commerce ve kurulum hizmet sağlayıcısıdır; şarj ağı operatörü olarak anlatılmamalıdır.

## 9. Performans Denetimi

### Mevcut İyileştirmeler

- Public layout cart provider'dan ayrıştırılmış.
- Mobile nav panel dynamic chunk olarak izole edilmiş.
- Analytics lazy yüklenmiş.
- Motion sistemi `content-visibility`, reduced-motion, pointer guard ve transform/opacity ağırlıklı hale getirilmiş.
- Product image priority yalnızca ilk görünür ürünlerde kontrollü kullanılıyor.

### Kalan Darboğazlar

- Global CSS çok büyük; domain stillerine bölünmeli.
- Admin product formu ve repository büyük; admin route chunk ve bakım maliyetini artırıyor.
- Checkout client bileşeni hala bölünmeye aday.
- Recharts, TipTap, React Hook Form ve admin tablo kütüphaneleri public route'a sızmamalı; bundle analyzer ile takip edilmeli.
- Admin chart ve rich text editor lazy boundary'leri daha agresif yapılabilir.
- RUM yok; gerçek Android/desktop yavaşlıklarını INP/LCP seviyesinde görmek için field monitoring gerekli.

### Performans Hedefleri

- Mobil LCP: 2.5 saniye altı.
- INP: 200 ms altı.
- CLS: 0.1 altı.
- Public shared JS: aşamalı olarak 200 KB altı hedef.
- Store/product/checkout route chunk'ları için route bazlı ölçüm.
- Admin route'ları public landing performansını etkilememeli.

## 10. Güvenlik ve Operasyon Riski

- Admin ve customer API'lerde same-origin koruma ve role-based access mevcut.
- Admin response'larında no-store, noindex, frame deny gibi güvenlik header'ları var.
- PayTR callback herkese açık olmalı; authentication/session gerektirmemeli. Kod tarafında API route matcher buna izin veriyor, fakat Vercel/proxy header ve PayTR panel ayarı canlıda doğrulanmalı.
- Supabase service role key sadece server-side kalmalı; frontend'e sızmamalı.
- Raw PayTR payload'ları kart bilgisi içermemeli; mevcut iframe akışı bu açıdan doğru.
- Audit log kapsamı genişletilmeli: kampanya, stok, fiyat, SEO ve role mutation kayıtları zorunlu olmalı.

## 11. Öncelikli Roadmap

### P0 - Satış ve Ödeme Kaybını Önleme

1. PayTR canlı doğrulama:
   - Bildirim URL: `https://parkchargeev.com/api/paytr/callback`
   - OK response sade text olmalı.
   - Checkout CSP canlı header'ında `frame-src https:` veya PayTR'nin 3D banka gateway zincirini kapsayan izin doğrulanmalı.
   - Test işlem PayTR panelinde "Başarılı" görünene kadar hash, amount, currency ve callback logları karşılaştırılmalı.
2. Ürün detay ve checkout güven sinyalleri:
   - Kargo, iade, garanti, teknik destek, kurulum ve güvenli ödeme özetleri görünür olmalı.
3. Stokta yok akışı:
   - E-posta/telefon ile yeniden stok bildirimi.
   - Alternatif ürün önerisi.
4. Ürün kalite skoru:
   - Admin ürün listesinde eksik medya, eksik SEO, eksik specs, düşük stok ve fiyat yok uyarısı.

### P1 - Dönüşüm ve Yönetilebilirlik

1. Kampanya/kupon domain modeli.
2. Gerçek ürün yorumları ve moderasyon.
3. Stok hareketleri ve düşük stok raporu.
4. Müşteri CRM ve segmentasyon.
5. Kategori SEO landing sayfaları.
6. Google Merchant Center feed export.
7. Checkout funnel ölçümü: sepet, bilgi formu, token alınma, iframe açılma, callback başarı/başarısızlık.

### P2 - Ölçeklenebilirlik ve Enterprise Seviye

1. Admin repository'leri domain bazlı böl:
   - `product-repository`
   - `order-repository`
   - `catalog-repository`
   - `customer-repository`
   - `promotion-repository`
   - `content-repository`
2. Admin product formu section bileşenlerine ayır:
   - `ProductIdentitySection`
   - `PricingInventorySection`
   - `VariantMatrixSection`
   - `MediaManagerSection`
   - `SpecsSection`
   - `SeoAiSection`
   - `RelationsSection`
3. Global CSS'i base, layout, commerce, admin, motion ve print katmanlarına böl.
4. RUM ve observability:
   - Sentry performance.
   - Web Vitals event collector.
   - PayTR callback latency dashboard.
5. B2B teklif pipeline:
   - Lead scoring.
   - Teklif şablonu.
   - Kurulum keşif planı.
   - Satış sonrası servis SLA.

## 12. Uygulama İlkeleri

- Görsel tasarım ve mevcut özellikler korunmalı.
- Yeni özellikler domain-first yazılmalı; UI doğrudan DB veya API detayına bağlanmamalı.
- Schema ve sayfa içeriği aynı gerçeği anlatmalı; gerçek olmayan rating/yorum/sertifika eklenmemeli.
- Admin mutasyonları audit log üretmeli.
- Public route'lara admin-only bundle sızması engellenmeli.
- Büyük bileşenler davranış korunarak küçük, test edilebilir parçalara ayrılmalı.
- Her ticari özellik ölçüm olayı üretmeli: görüntülendi, tıklandı, sepete eklendi, checkout başladı, token alındı, ödeme sonucu geldi.

## 13. Kaynak Linkleri

- Google Product structured data: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Google Merchant listing structured data: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- web.dev Core Web Vitals: https://web.dev/articles/vitals
- web.dev INP optimization: https://web.dev/articles/optimize-inp
- PayTR iFrame API 1. Adım: https://dev.paytr.com/iframe-api/iframe-api-1-adim
- PayTR iFrame API 2. Adım: https://dev.paytr.com/iframe-api/iframe-api-2-adim
- Tesla Wall Connector benchmark: https://shop.tesla.com/product/wall-connector
- Voltrun benchmark: https://www.voltrun.com/
