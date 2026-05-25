import type { ProductModel } from "@/lib/mock-data";

export type ProductDetailTextPair = {
  label: string;
  value: string;
};

export type ProductPolicyDetail = {
  title: string;
  body: string;
};

export type ProductDetailFaq = {
  question: string;
  answer: string;
};

export type ProductSupportContent = {
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
};

export type ProductDetailContent = {
  galleryItems: string[];
  galleryFeatureLabels: string[];
  galleryDeviceCaption: string;
  specsHeading: string;
  intentHeading: string;
  intentBody: string;
  seoIntents: string[];
  useCasesHeading: string;
  useCases: string[];
  highlightsHeading: string;
  highlights: string[];
  purchaseBenefits: string[];
  purchaseReadiness: ProductDetailTextPair[];
  decisionChecks: string[];
  support: ProductSupportContent;
  policyDetails: ProductPolicyDetail[];
  faqHeading: string;
  faqs: ProductDetailFaq[];
  relatedEyebrow: string;
  relatedHeading: string;
};

export type ProductDetailContentInput = Partial<
  Omit<
    ProductDetailContent,
    "support" | "purchaseReadiness" | "policyDetails"
  >
> & {
  support?: Partial<ProductSupportContent>;
  purchaseReadiness?: ProductDetailTextPair[];
  policyDetails?: ProductPolicyDetail[];
};

export const productDetailContentSchemaKey = "_parkchargeevPageContent";

function compactList(values?: string[]) {
  return (values ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
}

function hasItems<T>(values: T[] | undefined): values is T[] {
  return Array.isArray(values) && values.length > 0;
}

function getReadinessDefaults(product?: ProductModel): ProductDetailTextPair[] {
  const category = product?.category ?? "";
  const powerLabel = product?.powerLabel ?? "";
  const isAccessory = category === "Aksesuar";
  const isHighPower =
    powerLabel.toLocaleLowerCase("tr-TR").includes("dc") || powerLabel.includes("22");

  return [
    {
      label: "Kurulum dahil mi?",
      value: isAccessory
        ? "Kurulum gerektirmez"
        : "Keşif sonrası kurulum teklifi eklenebilir"
    },
    {
      label: "Keşif gerekiyor mu?",
      value: isHighPower ? "Önerilir" : "Altyapı bilinmiyorsa önerilir"
    },
    {
      label: "Uyumlu araçlar",
      value: isAccessory
        ? "Type 2 AC soketli araçlar"
        : "Type 2 AC veya CCS2 desteğine göre seçilir"
    }
  ];
}

export function getDefaultProductDetailContent(product?: ProductModel): ProductDetailContent {
  return {
    galleryItems: product?.galleryItems?.length
      ? product.galleryItems
      : ["Ön görünüm", "Yan profil", "Montaj görünümü", "Video"],
    galleryFeatureLabels: ["IP koruma", "Type 2", "Kurulum"],
    galleryDeviceCaption: "Ölçekli cihaz temsili",
    specsHeading: "Teknik özellikler",
    intentHeading: "Satın alma niyetleri",
    intentBody:
      "Bu ürün kullanıcıların en çok aşağıdaki karar sorularında öne çıkar.",
    seoIntents: product?.seoIntent?.length ? product.seoIntent : [],
    useCasesHeading: "Kullanım senaryoları",
    useCases: product?.useCases?.length ? product.useCases : [],
    highlightsHeading: "Öne çıkan avantajlar",
    highlights: product?.highlights?.length ? product.highlights : [],
    purchaseBenefits: [
      "Ücretsiz kargo ve hızlı gönderim",
      "2 yıl garanti ve kurulum desteği",
      "PayTR ile güvenli ödeme altyapısı"
    ],
    purchaseReadiness: getReadinessDefaults(product),
    decisionChecks: [
      "Kargo, KDV ve kurulum kapsamı karar öncesinde ayrı ayrı gösterilir.",
      "Keşif talebiyle pano kapasitesi ve kablo hattı netleştirilebilir.",
      "PayTR iFrame akışı kart verisini site sunucusuna taşımaz."
    ],
    support: {
      title: "Satın alma öncesi destek",
      body:
        "Ürünün saha uygunluğunu netleştirmek için teknik keşif ve kurulum danışmanlığı talebinizi iletebilirsiniz.",
      ctaLabel: "Teknik Değerlendirme İste",
      href: "/iletisim"
    },
    policyDetails: [
      {
        title: "Teslimat ve kurulum",
        body:
          "Stoktaki ürünlerde standart sevkiyat 2-5 iş günü olarak planlanır. Kurulum talebi varsa saha keşfi sonrası randevu ve kapsam ayrıca netleştirilir."
      },
      {
        title: "İade ve değişim",
        body:
          "Kullanılmamış ürünlerde 14 gün içinde iade talebi alınabilir. Saha montajı yapılan projelerde keşif ve kurulum kapsamı ayrı değerlendirilir."
      },
      {
        title: "Garanti ve servis",
        body:
          "Ürünler için 2 yıl garanti ve kurulum sonrası teknik destek süreci sunulur. Kurumsal projelerde bakım periyodu teklif kapsamına eklenebilir."
      }
    ],
    faqHeading: "Sık sorulan sorular",
    faqs: product?.faqs?.length ? product.faqs : [],
    relatedEyebrow: "İlgili ürünler",
    relatedHeading: "Karşılaştırılabilecek alternatifler"
  };
}

export const defaultProductDetailContent = getDefaultProductDetailContent();

export function mergeProductDetailContent(
  base: ProductDetailContent,
  input?: ProductDetailContentInput | null
): ProductDetailContent {
  if (!input) {
    return base;
  }

  return {
    ...base,
    ...input,
    galleryItems: hasItems(input.galleryItems) ? compactList(input.galleryItems) : base.galleryItems,
    galleryFeatureLabels: hasItems(input.galleryFeatureLabels)
      ? compactList(input.galleryFeatureLabels)
      : base.galleryFeatureLabels,
    purchaseBenefits: hasItems(input.purchaseBenefits)
      ? compactList(input.purchaseBenefits)
      : base.purchaseBenefits,
    seoIntents: hasItems(input.seoIntents)
      ? compactList(input.seoIntents)
      : base.seoIntents,
    useCases: hasItems(input.useCases)
      ? compactList(input.useCases)
      : base.useCases,
    highlights: hasItems(input.highlights)
      ? compactList(input.highlights)
      : base.highlights,
    purchaseReadiness: hasItems(input.purchaseReadiness)
      ? input.purchaseReadiness
      : base.purchaseReadiness,
    decisionChecks: hasItems(input.decisionChecks)
      ? compactList(input.decisionChecks)
      : base.decisionChecks,
    support: {
      ...base.support,
      ...input.support
    },
    policyDetails: hasItems(input.policyDetails)
      ? input.policyDetails
      : base.policyDetails,
    faqs: hasItems(input.faqs) ? input.faqs : base.faqs
  };
}

export function getProductDetailContent(product: ProductModel): ProductDetailContent {
  return mergeProductDetailContent(
    getDefaultProductDetailContent(product),
    product.detailContent
  );
}

export function getProductDetailContentFromSchemaJsonLd(
  schemaJsonLd: unknown
): ProductDetailContentInput | undefined {
  if (!schemaJsonLd || typeof schemaJsonLd !== "object") {
    return undefined;
  }

  const value = (schemaJsonLd as Record<string, unknown>)[productDetailContentSchemaKey];

  if (!value || typeof value !== "object") {
    return undefined;
  }

  return value as ProductDetailContentInput;
}

export function withProductDetailContentSchemaJsonLd<T extends Record<string, unknown>>(
  schemaJsonLd: T,
  detailContent?: ProductDetailContentInput | null
) {
  if (!detailContent) {
    return schemaJsonLd;
  }

  return {
    ...schemaJsonLd,
    [productDetailContentSchemaKey]: detailContent
  };
}
