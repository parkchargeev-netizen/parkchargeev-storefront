import type { ArticleModel, ProductModel } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/site";

function joinList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function renderProductMarkdown(product: ProductModel) {
  const lines = [
    `# ${product.name}`,
    "",
    `- URL: ${absoluteUrl(`/urun/${product.slug}`)}`,
    `- Kategori: ${product.category}`,
    `- Fiyat: ${(product.priceKurus / 100).toLocaleString("tr-TR")} TL`,
    `- Durum: ${product.stockLabel}`,
    `- Güç: ${product.powerLabel}`,
    product.badge ? `- Etiket: ${product.badge}` : null,
    "",
    "## Özet",
    "",
    product.summary,
    "",
    "## Açıklama",
    "",
    product.description,
    "",
    "## Teknik Özellikler",
    "",
    joinList(product.specs.map((spec) => `${spec.label}: ${spec.value}`)),
    "",
    "## Öne Çıkan Avantajlar",
    "",
    joinList(product.highlights),
    "",
    "## Kullanım Senaryoları",
    "",
    joinList(product.useCases),
    "",
    "## Arama Niyetleri",
    "",
    joinList(product.seoIntent),
    "",
    "## Sıkça Sorulan Sorular",
    "",
    product.faqs
      .map((item) => `### ${item.question}\n\n${item.answer}`)
      .join("\n\n")
  ];

  return lines.filter(Boolean).join("\n");
}

export function renderArticleMarkdown(article: ArticleModel) {
  const lines = [
    `# ${article.title}`,
    "",
    `- URL: ${absoluteUrl(`/blog/${article.slug}`)}`,
    `- Kategori: ${article.category}`,
    `- Yayın Tarihi: ${article.publishedAt}`,
    `- Okuma Süresi: ${article.readingMinutes} dakika`,
    "",
    "## Özet",
    "",
    article.excerpt,
    ""
  ];

  for (const section of article.sections) {
    lines.push(`## ${section.heading}`, "");

    for (const paragraph of section.paragraphs) {
      lines.push(paragraph, "");
    }

    if (section.bullets?.length) {
      lines.push(joinList(section.bullets), "");
    }
  }

  if (article.faq?.length) {
    lines.push("## Sıkça Sorulan Sorular", "");
    lines.push(
      article.faq.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")
    );
  }

  return lines.filter(Boolean).join("\n");
}
