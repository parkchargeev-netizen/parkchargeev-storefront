# ParkChargeEV SEO ve AI Search Visibility Planı

Tarih: 24 Haziran 2026

## Amaç

ParkChargeEV'i arama motorları ve cevap motorları için şu ana varlık olarak konumlandırmak:

> Türkiye'de elektrikli araç şarj cihazı ve aksesuar satışı ile keşif, kurulum, devreye alma ve teknik destek hizmetleri sunan Sakarya merkezli EV charging solutions şirketi.

Şirket, bir elektrikli araç üreticisi veya ulusal halka açık şarj ağı operatörü olarak değil; EV şarj ekipmanı e-ticareti, elektrik altyapısı uygunluk değerlendirmesi, kurulum ve satış sonrası destek sağlayıcısı olarak anlatılmalıdır.

## Teknik Temel

- `robots.txt`: Googlebot, Bingbot, YandexBot, OAI-SearchBot, GPTBot, Google-Extended, ClaudeBot, Claude-SearchBot ve PerplexityBot için açık izin verir.
- `sitemap.xml`: Kanonik ve indekslenebilir statik sayfaları, CMS sayfalarını, ürünleri, blog yazılarını ve kurumsal çözüm sayfalarını kapsar.
- `llms.txt`: Şirket tanımı, kapsam, kanonik sayfalar, ürünler, hizmetler, rehberler ve temiz Markdown kaynaklarını listeler.
- `/.well-known/llms.txt`: Aynı LLM keşif içeriğini alternatif standart konumdan sunar.
- JSON-LD: `Organization`, `ProfessionalService`, `Electrician`, `WebSite`, `Product`, `Offer`, `Service`, `OfferCatalog`, `Article`, `BreadcrumbList` ve semantik `FAQPage` kullanır.

## Schema.org Stratejisi

### Organization ve LocalBusiness

- Ticari ad, alternatif ad, telefon, e-posta, adres, logo, çalışma saatleri ve hizmet bölgesi tüm kanallarda aynı olmalıdır.
- Google Business Profile, Bing Places, Instagram, Facebook ve varsa LinkedIn profilleri açıldıktan sonra gerçek profil URL'leri `sameAs` alanına eklenmelidir.
- Vergi numarası, MERSİS numarası veya ticaret sicil bilgileri yalnızca doğrulanmışsa `identifier`, `taxID` veya `legalName` olarak eklenmelidir.
- Her yeni fiziksel şube için ayrı bir `LocalBusiness` varlığı ve ayrı konum sayfası oluşturulmalıdır.

### Product

- Her ürünün tek kanonik URL'si, benzersiz SKU'su, gerçek fiyatı, stok durumu, marka bilgisi ve özgün görselleri bulunmalıdır.
- Fiyat ve stok JSON-LD ile görünür sayfa içeriğinde aynı olmalıdır.
- Ücretsiz kargo, garanti süresi veya fiyat geçerlilik tarihi gibi doğrulanmamış bilgiler schema içine yazılmamalıdır.
- Ürün varyantları farklı URL'lerle satılıyorsa `ProductGroup` ve `hasVariant` yapısına geçilmelidir.
- Google Merchant Center ürün feed'i ile sayfadaki Product schema verileri senkron tutulmalıdır.

### Service

- Keşif, kurulum, projelendirme, teknik servis ve enerji danışmanlığı ayrı `Service` varlıkları olarak tanımlanmalıdır.
- Her hizmet için `provider`, `areaServed`, `serviceType`, açıklama ve kanonik URL bulunmalıdır.
- Site, apartman, ofis ve filo çözümleri ayrı hizmet sayfalarında gerçek süreç, kapsam, teslimat ve uygunluk bilgileriyle açıklanmalıdır.

### FAQ

- Soru ve cevaplar sayfada kullanıcıya görünür olmalıdır.
- Her cevap önce 40-80 kelimelik doğrudan yanıt, ardından gerekli teknik ayrıntı düzeniyle yazılmalıdır.
- Aynı soru farklı sayfalarda aynı metinle tekrarlanmamalıdır.
- Google, FAQ rich result özelliğini 7 Mayıs 2026 itibarıyla sonlandırdı ve ilgili dokümantasyonu 12 Haziran 2026 tarihinde kaldırdı. Bu nedenle FAQ içeriği zengin sonuç vaadi için değil, kullanıcı faydası ve semantik açıklık için kullanılmalıdır.

## İçerik Stratejisi

### Ana Konu Kümeleri

1. Ev tipi şarj: 7.4 kW, 11 kW, monofaze, trifaze, wallbox kurulumu.
2. Araç uyumu: Togg, Tesla, BYD ve Type 2 uyumluluk rehberleri.
3. Site ve apartman: yönetim kararı, ortak alan, sayaç, yük yönetimi.
4. İş yeri ve ofis: çalışan şarjı, ziyaretçi kullanımı, RFID ve raporlama.
5. Filo ve ticari saha: AC/DC seçimi, vardiya planı, kapasite ve bakım.
6. Satın alma: fiyatı etkileyen unsurlar, kablo, pano, koruma ekipmanı ve toplam kurulum maliyeti.

### Öncelikli İçerikler

- Ev için 7.4 kW mı 11 kW mı seçilmeli?
- Togg için ev tipi şarj cihazı ve kurulum gereksinimleri
- Tesla ve BYD için Type 2 wallbox uyumluluk rehberi
- Apartman otoparkına şarj cihazı kurulumunda yönetim ve teknik süreç
- Şarj cihazı kurulumu toplam maliyeti nasıl hesaplanır?
- İş yeri otoparkında kaç adet şarj cihazıyla başlanmalı?
- Dinamik yük yönetimi nedir ve ne zaman gerekir?
- RFID ve OCPP hangi işletmeler için gereklidir?
- 22 kW AC şarj cihazı her araçta 22 kW verir mi?
- DC hızlı şarj yatırımı için trafo ve saha gereksinimleri

Her içerik özgün saha deneyimi, teknik kontrol listesi, tarih, yazar veya teknik kontrol eden kişi, kaynaklar ve ilgili ürün/hizmet bağlantıları içermelidir.

## Semantic SEO

- Her sayfa tek bir ana arama niyetini karşılamalıdır.
- H1 sayfanın gerçek konusunu, H2 başlıkları kullanıcı sorularını, tablolar ise karşılaştırılabilir teknik verileri taşımalıdır.
- "Şarj cihazı" gibi genel ifadeler; güç, bağlantı tipi, araç tipi, kullanım alanı ve şehir gibi varlıklarla birlikte açıklanmalıdır.
- Ürün, hizmet, rehber ve çözüm sayfaları arasında konu kümesi iç bağlantıları kurulmalıdır.
- Teknik terimler için kısa bir EV şarj sözlüğü oluşturulmalıdır: AC, DC, kW, kWh, Type 2, CCS2, OCPP, RFID, dinamik yük yönetimi.
- Sayfalarda cevap cümleleri kısa, açık ve alıntılanabilir olmalıdır. Gereksiz pazarlama dili azaltılmalıdır.

## Entity-Based SEO

- Marka adı her yerde `ParkChargeEV`, alternatif yazım `Park Charge EV` olarak tutarlı kullanılmalıdır.
- NAP bilgisi, yani şirket adı, adres ve telefon; site, Google Business Profile, Bing Places, sosyal profiller ve ticari dizinlerde birebir aynı olmalıdır.
- Resmi logo, telefon, e-posta, çalışma saatleri ve hizmet bölgeleri tek merkezi yapılandırmadan beslenmelidir.
- Şirketin gerçek uzmanları için yazar profilleri ve teknik inceleme bilgileri oluşturulmalıdır.
- Üniversite Teknokent konumu, kurumsal ortaklıklar, sertifikalar ve yetkiler yalnızca doğrulanabilir kaynaklarla yayınlanmalıdır.
- Harici güven sinyalleri için üretici partner sayfaları, sektörel dernekler, yerel basın, müşteri vaka çalışmaları ve doğrulanmış işletme profilleri hedeflenmelidir.

## Ölçüm ve Operasyon

- Google Search Console'a sitemap gönderilmeli ve ürün, blog, hizmet URL'leri URL Inspection ile örneklenmelidir.
- Bing Webmaster Tools kurulmalı, sitemap gönderilmeli ve AI Performance raporu kullanılmalıdır.
- Google Merchant Center feed'i kurulmalı ve ürün uygunluk hataları izlenmelidir.
- Haftalık olarak indekslenen URL, sorgu kümeleri, ürün rich result hataları, marka dışı gösterimler ve AI kaynaklı yönlendirmeler takip edilmelidir.
- Aylık olarak ChatGPT, Perplexity, Gemini ve Copilot üzerinde aynı 20 ticari sorgudan oluşan görünürlük testi yapılmalıdır.

## Resmi Kaynaklar

- Google robots.txt: https://developers.google.com/crawling/docs/robots-txt/create-robots-txt
- Google sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google Organization: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google LocalBusiness: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Google Product: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- Anthropic crawlers: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Perplexity crawlers: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- llms.txt proposal: https://llmstxt.org/
