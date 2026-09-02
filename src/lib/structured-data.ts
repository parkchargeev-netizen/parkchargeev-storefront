import { absoluteUrl, siteConfig } from "@/lib/site";
import {
  type PublicSiteSettings,
  normalizePublicSiteSettings
} from "@/lib/site-settings";
import type {
  ArticleModel,
  FaqItem,
  ProductModel,
  ServiceModel,
  SolutionModel
} from "@/lib/mock-data";

const organizationId = absoluteUrl("/#organization");
const localBusinessId = absoluteUrl("/#localbusiness");
const websiteId = absoluteUrl("/#website");
const merchantReturnPolicyId = absoluteUrl("/#merchant-return-policy");
const shippingServiceId = absoluteUrl("/#shipping-service");
const defaultImageUrl = absoluteUrl("/api/og/product/homecharge-pro-11kw");
const logoUrl = absoluteUrl("/images/parkchargeev-logo.svg");
const officeLatitude = 40.74146948542449;
const officeLongitude = 30.300722122192383;
const officeMapUrl =
  "https://www.google.com/maps/search/?api=1&query=40.74146948542449,30.300722122192383";

function getSameAsLinks(settings?: PublicSiteSettings) {
  return Object.values(settings?.socials ?? siteConfig.socials).filter(Boolean);
}

export function stringifyJsonLd(payload: unknown) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

function toAbsoluteMediaUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

export function getProductImageUrl(product: ProductModel) {
  if (product.imageUrl) {
    return toAbsoluteMediaUrl(product.imageUrl);
  }

  return absoluteUrl(`/api/og/product/${product.slug}`);
}

export function getOrganizationJsonLd(settingsInput?: PublicSiteSettings) {
  const settings = normalizePublicSiteSettings(settingsInput);
  const publicLogoUrl = settings.logoUrl ? toAbsoluteMediaUrl(settings.logoUrl) : logoUrl;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: settings.brandName,
    alternateName: "Park Charge EV",
    legalName: settings.brandName,
    slogan: "Elektrikli araç şarj cihazı, keşif, kurulum ve teknik destek çözümleri",
    url: siteConfig.url,
    description: settings.description,
    email: settings.email,
    telephone: settings.phone,
    image: defaultImageUrl,
    logo: publicLogoUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address.streetAddress,
      addressLocality: settings.address.addressLocality,
      addressRegion: settings.address.addressRegion,
      addressCountry: settings.address.addressCountry
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: settings.phone,
      email: settings.email,
      areaServed: "TR",
      availableLanguage: ["tr-TR"]
    },
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Elektrikli araç şarj cihazları",
          category: "EV charging equipment"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Elektrikli araç şarj cihazı keşif ve kurulum hizmeti",
          serviceType: "EV charger installation"
        }
      }
    ],
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      "@id": merchantReturnPolicyId,
      name: "ParkChargeEV standart iade politikasi",
      applicableCountry: "TR",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility"
    },
    hasShippingService: {
      "@type": "ShippingService",
      "@id": shippingServiceId,
      name: "ParkChargeEV Turkiye teslimat hizmeti",
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "TR"
      }
    },
    areaServed: settings.serviceAreas,
    knowsLanguage: ["tr-TR", "tr"],
    knowsAbout: [
      "Elektrikli araç şarj cihazları",
      "EV şarj istasyonu kurulumu",
      "AC wallbox",
      "DC hızlı şarj",
      "Site ve apartman şarj altyapısı",
      "Filo ve iş yeri şarj çözümleri"
    ],
    sameAs: getSameAsLinks(settings)
  };
}

export function getLocalBusinessJsonLd(settingsInput?: PublicSiteSettings) {
  const settings = normalizePublicSiteSettings(settingsInput);
  const publicLogoUrl = settings.logoUrl ? toAbsoluteMediaUrl(settings.logoUrl) : logoUrl;

  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "Electrician"],
    "@id": localBusinessId,
    name: settings.brandName,
    alternateName: "Park Charge EV",
    url: siteConfig.url,
    description:
      "Elektrikli araç şarj cihazı satışı, keşif, kurulum ve teknik destek hizmeti.",
    image: defaultImageUrl,
    logo: publicLogoUrl,
    email: settings.email,
    telephone: settings.phone,
    priceRange: "$$",
    currenciesAccepted: "TRY",
    paymentAccepted: "Credit Card",
    parentOrganization: {
      "@id": organizationId
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address.streetAddress,
      addressLocality: settings.address.addressLocality,
      addressRegion: settings.address.addressRegion,
      addressCountry: settings.address.addressCountry
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: officeLatitude,
      longitude: officeLongitude
    },
    hasMap: officeMapUrl,
    openingHours: settings.supportHours,
    areaServed: settings.serviceAreas,
    sameAs: getSameAsLinks(settings)
  };
}

export function getWebsiteJsonLd(settingsInput?: PublicSiteSettings) {
  const settings = normalizePublicSiteSettings(settingsInput);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: settings.brandName,
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

function getServiceEntity(service: ServiceModel) {
  return {
    "@type": "Service",
    "@id": absoluteUrl(`/hizmetler#${service.id}`),
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    url: absoluteUrl(service.href),
    provider: {
      "@id": localBusinessId
    },
    areaServed: {
      "@type": "Country",
      name: "Türkiye"
    },
    availableLanguage: ["tr-TR"]
  };
}

export function getServiceCatalogJsonLd(services: ServiceModel[]) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": absoluteUrl("/hizmetler#service-catalog"),
    name: "ParkChargeEV elektrikli araç şarj hizmetleri",
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: getServiceEntity(service)
    }))
  };
}

export function getSolutionServiceJsonLd(solution: SolutionModel) {
  const solutionUrl = absoluteUrl(`/kurumsal-cozumler/${solution.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${solutionUrl}#service`,
    name: solution.title,
    serviceType: solution.title,
    description: solution.summary,
    url: solutionUrl,
    provider: {
      "@id": localBusinessId
    },
    areaServed: {
      "@type": "Country",
      name: "Türkiye"
    },
    audience: {
      "@type": "Audience",
      audienceType: solution.segment
    },
    category: "Elektrikli araç şarj altyapısı",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${solution.title} kapsamı`,
      itemListElement: solution.features.map((feature) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: feature,
          provider: {
            "@id": localBusinessId
          }
        }
      }))
    }
  };
}

function getProductOffer({
  productUrl,
  id,
  priceKurus,
  inStock
}: {
  productUrl: string;
  id: string;
  priceKurus: number;
  inStock: boolean;
}) {
  const offerId = encodeURIComponent(id);
  const priceValidUntil = new Date();
  priceValidUntil.setUTCFullYear(priceValidUntil.getUTCFullYear() + 1);

  return {
    "@type": "Offer",
    "@id": `${productUrl}#offer-${offerId}`,
    priceCurrency: "TRY",
    price: (priceKurus / 100).toFixed(2),
    priceValidUntil: priceValidUntil.toISOString().slice(0, 10),
    itemCondition: "https://schema.org/NewCondition",
    availability: inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: productUrl,
    areaServed: {
      "@type": "Country",
      name: "Türkiye"
    },
    acceptedPaymentMethod: "https://schema.org/CreditCard",
    availableAtOrFrom: {
      "@id": localBusinessId
    },
    seller: {
      "@id": organizationId
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      "@id": `${productUrl}#shipping-${offerId}`,
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
      "@id": merchantReturnPolicyId,
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
  };
}

function getProductCommonProperties(product: ProductModel, productUrl: string) {
  return {
    name: product.name,
    description: product.description,
    image: [getProductImageUrl(product)],
    productID: product.id,
    model: product.powerLabel,
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    manufacturer: {
      "@id": organizationId
    },
    category: product.category,
    keywords: product.seoIntent.join(", "),
    url: productUrl,
    inLanguage: "tr-TR",
    audience: {
      "@type": "Audience",
      audienceType: product.useCases.join(", ") || product.category
    },
    positiveNotes: product.highlights.length
      ? {
          "@type": "ItemList",
          itemListElement: product.highlights.map((highlight, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: highlight
          }))
        }
      : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": productUrl
    }
  };
}

export function getProductJsonLd(product: ProductModel) {
  const productUrl = absoluteUrl(`/urun/${product.slug}`);
  const commonProperties = getProductCommonProperties(product, productUrl);
  const variants = product.variants?.filter((variant) => variant.sku) ?? [];

  if (variants.length > 1) {
    return {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      "@id": `${productUrl}#product-group`,
      ...commonProperties,
      productGroupID: product.id,
      variesBy: ["https://schema.org/additionalProperty"],
      additionalProperty: product.specs.map((spec) => ({
        "@type": "PropertyValue",
        name: spec.label,
        value: spec.value
      })),
      hasVariant: variants.map((variant) => ({
        "@type": "Product",
        "@id": `${productUrl}#variant-${encodeURIComponent(variant.sku)}`,
        name: `${product.name} - ${variant.title}`,
        description: `${product.description} Seçenek: ${variant.title}.`,
        image: [getProductImageUrl(product)],
        sku: variant.sku,
        category: product.category,
        url: productUrl,
        additionalProperty: [
          variant.powerLabel
            ? {
                "@type": "PropertyValue",
                name: "Şarj gücü",
                value: variant.powerLabel
              }
            : null,
          variant.cableLength
            ? {
                "@type": "PropertyValue",
                name: "Kablo uzunluğu",
                value: variant.cableLength
              }
            : null,
          variant.connectorType
            ? {
                "@type": "PropertyValue",
                name: "Konnektör tipi",
                value: variant.connectorType
              }
            : null
        ].filter(Boolean),
        offers: getProductOffer({
          productUrl,
          id: variant.sku,
          priceKurus: variant.priceKurus,
          inStock: variant.stockQuantity > 0
        })
      }))
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    ...commonProperties,
    sku: variants[0]?.sku ?? product.id,
    additionalProperty: product.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.label,
      value: spec.value
    })),
    offers: getProductOffer({
      productUrl,
      id: variants[0]?.sku ?? product.id,
      priceKurus: variants[0]?.priceKurus ?? product.priceKurus,
      inStock:
        variants[0] !== undefined
          ? variants[0].stockQuantity > 0
          : product.stockLabel !== "Stokta Yok"
    })
  };
}

export function getDefinedTermSetJsonLd(
  name: string,
  path: string,
  terms: Array<{ name: string; description: string }>
) {
  const pageUrl = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${pageUrl}#terms`,
    name,
    url: pageUrl,
    inLanguage: "tr-TR",
    hasDefinedTerm: terms.map((term) => ({
      "@type": "DefinedTerm",
      name: term.name,
      description: term.description,
      inDefinedTermSet: `${pageUrl}#terms`
    }))
  };
}

export function getLocalInstallationServiceJsonLd({
  city,
  path,
  description
}: {
  city: string;
  path: string;
  description: string;
}) {
  const pageUrl = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: `${city} elektrikli araç şarj cihazı kurulumu`,
    serviceType: "Elektrikli araç şarj cihazı keşif ve kurulum hizmeti",
    description,
    url: pageUrl,
    provider: {
      "@id": localBusinessId
    },
    areaServed: {
      "@type": "City",
      name: city,
      containedInPlace: {
        "@type": "Country",
        name: "Türkiye"
      }
    },
    category: "Elektrikli araç şarj cihazı kurulumu",
    availableLanguage: ["tr-TR"]
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
    dateModified: article.updatedAt ?? article.publishedAt,
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
