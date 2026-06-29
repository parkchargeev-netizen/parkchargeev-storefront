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

export type ProductSmartFeature = {
  title: string;
  description: string;
  iconName?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type ProductTechnicalSpecItem = {
  name: string;
  value: string;
  unit?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type ProductTechnicalSpecGroup = {
  title: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  items: ProductTechnicalSpecItem[];
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
  smartFeatures: ProductSmartFeature[];
  technicalGroups: ProductTechnicalSpecGroup[];
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

function sortByOrder<T extends { sortOrder?: number }>(values: T[]) {
  return [...values].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

function normalizeSmartFeatures(values?: ProductSmartFeature[]) {
  return sortByOrder(values ?? [])
    .map((item, index) => ({
      title: item.title?.trim() ?? "",
      description: item.description?.trim() ?? "",
      iconName: item.iconName?.trim() || "sparkles",
      isActive: item.isActive !== false,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1
    }))
    .filter((item) => item.title && item.description);
}

function normalizeTechnicalGroups(values?: ProductTechnicalSpecGroup[]) {
  return sortByOrder(values ?? [])
    .map((group, groupIndex) => ({
      title: group.title?.trim() ?? "",
      description: group.description?.trim() ?? "",
      isActive: group.isActive !== false,
      sortOrder: Number.isFinite(Number(group.sortOrder)) ? Number(group.sortOrder) : groupIndex + 1,
      items: sortByOrder(group.items ?? [])
        .map((item, itemIndex) => ({
          name: item.name?.trim() ?? "",
          value: item.value?.trim() ?? "",
          unit: item.unit?.trim() ?? "",
          description: item.description?.trim() ?? "",
          isActive: item.isActive !== false,
          sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : itemIndex + 1
        }))
        .filter((item) => item.name && item.value)
    }))
    .filter((group) => group.title && group.items.length > 0);
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
        : "Cihaz fiyatından ayrı değerlendirilir; keşif sonrası netleşir"
    },
    {
      label: "Keşif gerekiyor mu?",
      value: isHighPower ? "Önerilir" : "Pano/faz bilgisi net değilse önerilir"
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
    specsHeading: "Teknik karar bilgileri",
    intentHeading: "Bu ürün kimin için?",
    intentBody:
      "Ürün, aşağıdaki satın alma senaryolarında hızlı ve güvenli karar vermenize yardımcı olur.",
    seoIntents: product?.seoIntent?.length ? product.seoIntent : [],
    useCasesHeading: "Uygun kullanım alanı",
    useCases: product?.useCases?.length ? product.useCases : [],
    highlightsHeading: "Satış ve kurulum avantajları",
    highlights: product?.highlights?.length ? product.highlights : [],
    smartFeatures: [],
    technicalGroups: [],
    purchaseBenefits: [
      "Tek sayfa güvenli ödeme ve net sipariş takibi",
      "Garanti, servis ve kurulum desteği",
      "Keşif talebiyle yanlış ürün riskini azaltma"
    ],
    purchaseReadiness: getReadinessDefaults(product),
    decisionChecks: [
      "Araç uyumu, güç ihtiyacı ve kurulum kapsamı ürün seçimi sırasında netleştirilir.",
      "Keşif talebiyle pano kapasitesi, faz yapısı ve kablo hattı netleştirilebilir.",
      "Güvenli ödeme akışı kart verisini site sunucusuna taşımaz."
    ],
    support: {
      title: "Uygunluğu birlikte kontrol edelim",
      body:
        "Aracınız, otoparkınız ve elektrik altyapınız için bu ürünün doğru seçim olup olmadığını teknik ekiple netleştirebilirsiniz.",
      ctaLabel: "Uygunluğu Kontrol Et",
      href: "/iletisim"
    },
    policyDetails: [
      {
        title: "Teslimat ve kurulum planı",
        body:
          "Stoktaki ürünlerde sevkiyat 2-5 iş günü olarak planlanır. Kurulum talebi varsa keşif sonrası randevu, kablo hattı ve kapsam ayrıca netleştirilir."
      },
      {
        title: "İade ve değişim",
        body:
          "Kullanılmamış ürünlerde 14 gün içinde iade talebi alınabilir. Montaj yapılan projelerde cihaz, keşif ve kurulum kapsamı ayrı değerlendirilir."
      },
      {
        title: "Garanti ve servis",
        body:
          "Ürünler için garanti ve kurulum sonrası teknik destek süreci sunulur. Site, ofis ve ticari projelerde bakım periyodu teklif kapsamına eklenebilir."
      }
    ],
    faqHeading: "Karar öncesi sık sorulanlar",
    faqs: product?.faqs?.length ? product.faqs : [],
    relatedEyebrow: "İlgili ürünler",
    relatedHeading: "Aynı ihtiyaca uygun alternatifler"
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
    smartFeatures: hasItems(input.smartFeatures)
      ? normalizeSmartFeatures(input.smartFeatures)
      : base.smartFeatures,
    technicalGroups: hasItems(input.technicalGroups)
      ? normalizeTechnicalGroups(input.technicalGroups)
      : base.technicalGroups,
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

export function getActiveProductSmartFeatures(product: ProductModel) {
  const detailContent = getProductDetailContent(product);
  const configuredFeatures = normalizeSmartFeatures(detailContent.smartFeatures)
    .filter((item) => item.isActive !== false);

  if (configuredFeatures.length > 0) {
    return configuredFeatures;
  }

  return product.specs
    .filter((spec) => {
      const haystack = `${spec.groupName ?? ""} ${spec.label} ${spec.value}`.toLocaleLowerCase("tr-TR");
      return /akıllı|akilli|wifi|wi-fi|rfid|4g|ocpp|yük|yuk|load|uygulama/.test(haystack);
    })
    .map((spec, index) => ({
      title: spec.label,
      description: spec.value,
      iconName: "sparkles",
      isActive: true,
      sortOrder: index + 1
    }));
}

export function getActiveProductTechnicalGroups(product: ProductModel) {
  const detailContent = getProductDetailContent(product);
  const configuredGroups = normalizeTechnicalGroups(detailContent.technicalGroups)
    .filter((group) => group.isActive !== false)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.isActive !== false)
    }))
    .filter((group) => group.items.length > 0);

  if (configuredGroups.length > 0) {
    return configuredGroups;
  }

  const groupMap = new Map<string, ProductTechnicalSpecItem[]>();

  product.specs.forEach((spec, index) => {
    const groupName = spec.groupName?.trim() || "Genel Bilgiler";
    groupMap.set(groupName, [
      ...(groupMap.get(groupName) ?? []),
      {
        name: spec.label,
        value: spec.value,
        isActive: true,
        sortOrder: index + 1
      }
    ]);
  });

  return Array.from(groupMap.entries()).map(([title, items], index) => ({
    title,
    description: "",
    isActive: true,
    sortOrder: index + 1,
    items
  }));
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
