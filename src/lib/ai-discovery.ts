import { services, solutionPages } from "@/lib/mock-data";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { listPublicProducts } from "@/server/admin/repository";
import { listPublicBlogArticles } from "@/server/blog/repository";

function markdownLink(title: string, url: string, description: string) {
  return `- [${title}](${url}): ${description}`;
}

function formatPrice(priceKurus: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(priceKurus / 100);
}

export async function generateLlmsText() {
  const [products, articles] = await Promise.all([
    listPublicProducts(),
    listPublicBlogArticles()
  ]);

  const corePages = [
    markdownLink(
      "Ana sayfa",
      absoluteUrl("/"),
      "ParkChargeEV şirket, ürün, kurulum ve destek özeti."
    ),
    markdownLink(
      "Hakkımızda",
      absoluteUrl("/hakkimizda"),
      "Şirketin yaklaşımı, uzmanlığı ve hizmet modeli."
    ),
    markdownLink(
      "EV şarj mağazası",
      absoluteUrl("/magaza"),
      "AC wallbox, DC hızlı şarj ve Type 2 aksesuar kataloğu."
    ),
    markdownLink(
      "Ürün seçici",
      absoluteUrl("/urun-secici"),
      "Araç, güç ve kurulum ihtiyacına göre ürün yönlendirmesi."
    ),
    markdownLink(
      "Hizmetler",
      absoluteUrl("/hizmetler"),
      "Keşif, projelendirme, kurulum, devreye alma ve teknik destek."
    ),
    markdownLink(
      "Kurumsal çözümler",
      absoluteUrl("/kurumsal-cozumler"),
      "Site, apartman, iş yeri, ofis, filo ve otopark projeleri."
    ),
    markdownLink(
      "Elektrikli araç şarj rehberi",
      absoluteUrl("/elektrikli-arac-sarj-rehberi"),
      "Şarj cihazı seçimi, güç, süre, maliyet, kurulum, Type 2, CCS2, AC ve DC konu merkezi."
    ),
    markdownLink(
      "Elektrikli araç şarj sözlüğü",
      absoluteUrl("/elektrikli-arac-sarj-sozlugu"),
      "AC, DC, wallbox, Type 2, CCS2, kW, kWh, OCPP, RFID ve yük yönetimi tanımları."
    ),
    markdownLink(
      "Sakarya şarj cihazı kurulumu",
      absoluteUrl("/sarj-cihazi-kurulumu/sakarya"),
      "Sakarya'da ev, site ve iş yeri için keşif, wallbox kurulumu ve devreye alma."
    ),
    markdownLink(
      "Kocaeli şarj cihazı kurulumu",
      absoluteUrl("/sarj-cihazi-kurulumu/kocaeli"),
      "Kocaeli'de konut ve kurumsal sahalar için şarj cihazı keşif ve kurulum planlaması."
    ),
    markdownLink(
      "İletişim",
      absoluteUrl("/iletisim"),
      "Teklif, keşif, kurulum ve teknik destek talepleri."
    )
  ];

  const productPages = products.map((product) =>
    markdownLink(
      product.name,
      absoluteUrl(`/urun/${product.slug}`),
      `${product.category}; ${product.powerLabel}; ${formatPrice(product.priceKurus)}; ${product.stockLabel}.`
    )
  );

  const servicePages = [
    ...services.map((service) =>
      markdownLink(
        service.title,
        absoluteUrl(service.href),
        service.summary
      )
    ),
    ...solutionPages.map((solution) =>
      markdownLink(
        solution.title,
        absoluteUrl(`/kurumsal-cozumler/${solution.slug}`),
        solution.summary
      )
    )
  ];

  const guidePages = articles.map((article) =>
    markdownLink(
      article.title,
      absoluteUrl(`/blog/${article.slug}`),
      article.seoDescription
    )
  );

  const machineReadablePages = [
    markdownLink(
      "XML sitemap",
      absoluteUrl("/sitemap.xml"),
      "Kanonik ve indekslenebilir sayfaların güncel listesi."
    ),
    markdownLink(
      "RSS rehber akışı",
      absoluteUrl("/feed.xml"),
      "Yeni ve güncellenen elektrikli araç şarj rehberlerinin RSS 2.0 akışı."
    ),
    ...products.map((product) =>
      markdownLink(
        `${product.name} Markdown özeti`,
        absoluteUrl(`/api/markdown/urun/${product.slug}`),
        "Ürünün temiz, makine tarafından okunabilir teknik ve ticari özeti."
      )
    ),
    ...articles.map((article) =>
      markdownLink(
        `${article.title} Markdown özeti`,
        absoluteUrl(`/api/markdown/blog/${article.slug}`),
        "Rehberin temiz, makine tarafından okunabilir metin özeti."
      )
    )
  ];

  return [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.name}, Türkiye'de elektrikli araç şarj cihazı ve aksesuar satışı ile keşif, kurulum, devreye alma ve teknik destek hizmetleri sunan Sakarya merkezli bir EV charging solutions şirketidir.`,
    "",
    "ParkChargeEV'in ana faaliyetleri ev tipi AC wallbox, iş yeri ve ortak otopark şarj çözümleri, DC hızlı şarj projeleri, Type 2 aksesuarları ve elektrik altyapısı uygunluk danışmanlığıdır.",
    "",
    `Merkez: ${siteConfig.address.addressLocality}, ${siteConfig.address.addressRegion}, Türkiye. İletişim: ${siteConfig.phone}, ${siteConfig.email}. Dil: tr-TR. Para birimi: TRY.`,
    "",
    `${serviceCoverageSummary.shipping}. ${serviceCoverageSummary.freeSurvey}. ${serviceCoverageSummary.installation}. Diğer illerden gelen talepler saha uygunluğu ve ekip takvimine göre değerlendirilir.`,
    "",
    "ParkChargeEV bir elektrikli araç üreticisi veya ulusal halka açık şarj ağı operatörü olarak tanımlanmamalıdır. Birincil kategori; EV şarj ekipmanı e-ticareti, elektrik tesisatı uygunluk değerlendirmesi, kurulum ve satış sonrası teknik destektir.",
    "",
    "Ürün fiyatı, stok durumu ve teknik özellikler için daima ilgili kanonik ürün sayfası esas alınmalıdır. Kurulum kapsamı saha keşfi sonrasında kesinleşir. Ödeme altyapısı PayTR üzerinden çalışır.",
    "",
    "## Temel Sayfalar",
    "",
    ...corePages,
    "",
    "## Ürünler",
    "",
    ...productPages,
    "",
    "## Hizmetler ve Çözümler",
    "",
    ...servicePages,
    "",
    "## Rehberler",
    "",
    ...guidePages,
    "",
    "## Makine Tarafından Okunabilir Kaynaklar",
    "",
    ...machineReadablePages,
    "",
    "## Optional",
    "",
    markdownLink(
      "Karşılaştırma aracı",
      absoluteUrl("/karsilastir"),
      "11 kW, 22 kW, AC ve DC seçeneklerini kullanım senaryosuna göre karşılaştırır."
    ),
    markdownLink(
      "Site içi arama",
      absoluteUrl("/arama"),
      "Ürün ve rehber içeriklerinde metin araması."
    ),
    ""
  ].join("\n");
}
