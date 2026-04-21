import { absoluteUrl, siteConfig } from "@/lib/site";
import type {
  ArticleModel,
  FaqItem,
  ProductModel
} from "@/lib/mock-data";

function getSameAsLinks() {
  return Object.values(siteConfig.socials).filter(Boolean);
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      addressCountry: siteConfig.address.addressCountry
    },
    areaServed: siteConfig.serviceAreas,
    sameAs: getSameAsLinks()
  };
}

export function getLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      addressCountry: siteConfig.address.addressCountry
    },
    openingHours: siteConfig.supportHours,
    areaServed: siteConfig.serviceAreas,
    sameAs: getSameAsLinks()
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "tr-TR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/arama?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function getBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function getFaqJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function getProductJsonLd(product: ProductModel) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    sku: product.id,
    category: product.category,
    keywords: product.seoIntent.join(", "),
    url: absoluteUrl(`/urun/${product.slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: (product.priceKurus / 100).toFixed(2),
      availability:
        product.stockLabel === "Stokta Yok"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: absoluteUrl(`/urun/${product.slug}`),
      seller: {
        "@type": "Organization",
        name: siteConfig.name
      }
    }
  };
}

export function getArticleJsonLd(article: ArticleModel) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: siteConfig.name
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name
    },
    mainEntityOfPage: absoluteUrl(`/blog/${article.slug}`),
    articleSection: article.category,
    keywords: article.sections
      .flatMap((section) => section.bullets ?? [])
      .join(", ")
  };
}
