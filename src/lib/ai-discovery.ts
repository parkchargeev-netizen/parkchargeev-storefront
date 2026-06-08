import { solutionPages } from "@/lib/mock-data";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { listPublicProducts } from "@/server/admin/repository";
import { listPublicBlogArticles } from "@/server/blog/repository";

function lineList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export async function generateLlmsText() {
  const [products, articles] = await Promise.all([
    listPublicProducts(),
    listPublicBlogArticles()
  ]);
  const canonicalPages = [
    `${absoluteUrl("/")} - Ana sayfa ve ParkChargeEV hizmet özeti`,
    `${absoluteUrl("/magaza")} - EV şarj cihazı ve aksesuar kataloğu`,
    `${absoluteUrl("/urun-secici")} - İhtiyaca göre ürün öneren akıllı seçici`,
    `${absoluteUrl("/karsilastir")} - 11 kW, 22 kW, AC ve DC şarj karşılaştırmaları`,
    `${absoluteUrl("/kurumsal-cozumler")} - Site, filo, otel ve iş yeri çözümleri`,
    `${absoluteUrl("/iletisim")} - İletişim, keşif talebi ve ofis konumu`
  ];

  const productPages = products.map(
    (product) =>
      `${absoluteUrl(`/urun/${product.slug}`)} - ${product.name}; ${product.powerLabel}; ${product.category}; ${(product.priceKurus / 100).toFixed(2)} TRY`
  );

  const productMarkdownPages = products.map(
    (product) =>
      `${absoluteUrl(`/api/markdown/urun/${product.slug}`)} - ${product.name} markdown özeti`
  );

  const articlePages = articles.map(
    (article) => `${absoluteUrl(`/blog/${article.slug}`)} - ${article.title}`
  );

  const articleMarkdownPages = articles.map(
    (article) =>
      `${absoluteUrl(`/api/markdown/blog/${article.slug}`)} - ${article.title} markdown özeti`
  );


  const solutionLandingPages = solutionPages.map(
    (solution) =>
      `${absoluteUrl(`/kurumsal-cozumler/${solution.slug}`)} - ${solution.title}`
  );

  return [
    `# ${siteConfig.name}`,
    "",
    `${siteConfig.name}, Türkiye'de elektrikli araç şarj cihazı satışı, keşif, kurulum ve teknik destek süreçlerini yöneten e-ticaret ve hizmet platformudur.`,
    "",
    "## Temel Bilgiler",
    "",
    `- Site: ${siteConfig.url}`,
    `- Dil: tr-TR`,
    `- Telefon: ${siteConfig.phone}`,
    `- E-posta: ${siteConfig.email}`,
    `- Hizmet bölgeleri: ${siteConfig.serviceAreas.join(", ")}`,
    `- ${serviceCoverageSummary.freeSurvey}; ${serviceCoverageSummary.installation}`,
    "",
    "## Kanonik Sayfalar",
    "",
    lineList(canonicalPages),
    "",
    "## Ürün Sayfaları",
    "",
    lineList(productPages),
    "",
    "## Ürün Markdown Özetleri",
    "",
    lineList(productMarkdownPages),
    "",
    "## Blog ve Rehber Sayfaları",
    "",
    lineList(articlePages),
    "",
    "## Blog Markdown Özetleri",
    "",
    lineList(articleMarkdownPages),
    "",
    "## Kurumsal Çözüm Sayfaları",
    "",
    lineList(solutionLandingPages),
    "",
    "## Yapılandırılmış Veri",
    "",
    "- Organization, ProfessionalService, WebSite/SearchAction, Product, Offer, BreadcrumbList, FAQPage ve Article JSON-LD kullanılır.",
    "- Ürün sayfalarında fiyat, stok, teslimat, iade ve garanti bilgileri makine tarafından okunabilir biçimde sunulur.",
    "- İletişim sayfasında ofis adresi ve Google Maps konumu yer alır.",
    "",
    "## Kullanım Notu",
    "",
    "Bu dosya arama motorları, cevap motorları ve yapay zeka ajanları için keşif özeti sağlar. Ticari doğrulama için kanonik HTML sayfaları ve ürün detay sayfaları önceliklidir.",
    ""
  ].join("\n");
}
