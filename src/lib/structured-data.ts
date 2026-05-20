import { absoluteUrl, siteConfig } from "@/lib/site";
import type {
  ArticleModel,
  FaqItem,
  ProductModel
} from "@/lib/mock-data";

const organizationId = absoluteUrl("/#organization");
const localBusinessId = absoluteUrl("/#localbusiness");
const websiteId = absoluteUrl("/#website");
const defaultImageUrl = absoluteUrl("/api/og/product/homecharge-pro-11kw");
const officeLatitude = 40.74146948542449;
const officeLongitude = 30.300722122192383;
const officeMapUrl =
  "https://www.google.com/maps/search/?api=1&query=40.74146948542449,30.300722122192383";

function getSameAsLinks() {
  return Object.values(siteConfig.socials).filter(Boolean);
}

export function stringifyJsonLd(payload: unknown) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export function getProductImageUrl(product: ProductModel) {
  return absoluteUrl(`/api/og/product/${product.slug}`);
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    image: defaultImageUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      addressCountry: siteConfig.address.addressCountry
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: siteConfig.phone,
      email: siteConfig.email,
      areaServed: "TR",
      availableLanguage: ["tr-TR"]
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "TR",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility"
    },
    hasShippingService: {
      "@type": "ShippingService",
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "TR"
      }
    },
    areaServed: siteConfig.serviceAreas,
    sameAs: getSameAsLinks()
  };
}

export function getLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": localBusinessId,
    name: siteConfig.name,
    url: siteConfig.url,
    description:
      "Elektrikli araç şarj istasyonu satışı, keşif, kurulum ve teknik destek hizmeti.",
    image: defaultImageUrl,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    priceRange: "$$",
    parentOrganization: {
      "@id": organizationId
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      addressCountry: siteConfig.address.addressCountry
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: officeLatitude,
      longitude: officeLongitude
    },
    hasMap: officeMapUrl,
    openingHours: siteConfig.supportHours,
    areaServed: siteConfig.serviceAreas,
    sameAs: getSameAsLinks()
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "tr-TR",
    publisher: {
      "@id": organizationId
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/arama?q={search_term_string}")
      },
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
  const productUrl = absoluteUrl(`/urun/${product.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description,
    image: [getProductImageUrl(product)],
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    manufacturer: {
      "@id": organizationId
    },
    sku: product.id,
    category: product.category,
    keywords: product.seoIntent.join(", "),
    url: productUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": productUrl
    },
    additionalProperty: product.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.label,
      value: spec.value
    })),
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      priceCurrency: "TRY",
      price: (product.priceKurus / 100).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: "2026-12-31",
      availability:
        product.stockLabel === "Stokta Yok"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: productUrl,
      seller: {
        "@id": organizationId
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR"
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "TRY"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY"
          }
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility"
      },
      warranty: {
        "@type": "WarrantyPromise",
        durationOfWarranty: {
          "@type": "QuantitativeValue",
          value: 2,
          unitCode: "ANN"
        }
      }
    }
  };
}

export function getArticleJsonLd(article: ArticleModel) {
  const articleUrl = absoluteUrl(`/blog/${article.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}#article`,
    headline: article.title,
    description: article.seoDescription,
    image: [defaultImageUrl],
    url: articleUrl,
    inLanguage: "tr-TR",
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@id": organizationId
    },
    publisher: {
      "@id": organizationId
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    articleSection: article.category,
    keywords: article.sections
      .flatMap((section) => section.bullets ?? [])
      .join(", ")
  };
}
