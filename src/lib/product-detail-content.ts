import type { ProductModel } from "@/lib/mock-data";

export type ProductDetailTextPair = {
  label: string;
  value: string;
  description?: string;
  iconName?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export const productBadgePlacementGroups = [
  {
    label: "Ürün Detay Sayfası",
    options: [
      {
        value: "detail_title_top",
        label: "Ürün adı üstü",
        description: "Ürün detay sayfasında ürün adının üzerinde görünür."
      },
      {
        value: "detail_title_bottom",
        label: "Ürün adı altı",
        description: "Ürün detay sayfasında ürün adının hemen altında görünür."
      },
      {
        value: "detail_short_description_top",
        label: "Kısa açıklama üstü",
        description: "Kısa açıklamanın üzerinde görünür."
      },
      {
        value: "detail_short_description_bottom",
        label: "Kısa açıklama altı",
        description: "Kısa açıklamanın altında görünür."
      }
    ]
  },
  {
    label: "Ürün Görseli Üzeri",
    options: [
      {
        value: "detail_image_top_left",
        label: "Ürün görseli sol üst",
        description: "Ürün detay sayfasındaki ana görselin sol üst köşesinde görünür."
      },
      {
        value: "detail_image_top_right",
        label: "Ürün görseli sağ üst",
        description: "Ürün detay sayfasındaki ana görselin sağ üst köşesinde görünür."
      },
      {
        value: "detail_image_bottom_left",
        label: "Ürün görseli sol alt",
        description: "Ürün detay sayfasındaki ana görselin sol alt köşesinde görünür."
      },
      {
        value: "detail_image_bottom_right",
        label: "Ürün görseli sağ alt",
        description: "Ürün detay sayfasındaki ana görselin sağ alt köşesinde görünür."
      },
      {
        value: "detail_image_top_center",
        label: "Ürün görseli merkez üst",
        description: "Ürün detay sayfasındaki ana görselin üst orta alanında görünür."
      },
      {
        value: "detail_image_bottom_center",
        label: "Ürün görseli merkez alt",
        description: "Ürün detay sayfasındaki ana görselin alt orta alanında görünür."
      }
    ]
  },
  {
    label: "Satın Alma Alanı",
    options: [
      {
        value: "detail_price_top",
        label: "Fiyat üstü",
        description: "Satın alma kartındaki fiyat alanının üzerinde görünür."
      },
      {
        value: "detail_price_bottom",
        label: "Fiyat altı",
        description: "Satın alma kartındaki fiyat alanının altında görünür."
      },
      {
        value: "detail_add_to_cart_top",
        label: "Sepete ekle butonu üstü",
        description: "Sepete ekle butonunun hemen üzerinde görünür."
      },
      {
        value: "detail_add_to_cart_bottom",
        label: "Sepete ekle butonu altı",
        description: "Sepete ekle ve teknik özellikler butonlarının altında görünür."
      }
    ]
  },
  {
    label: "Ürün Açıklaması / Teknik Alan",
    options: [
      {
        value: "detail_specs_top",
        label: "Teknik özellikler üstü",
        description: "Teknik özellikler bölüm başlığının üzerinde görünür."
      },
      {
        value: "detail_description_top",
        label: "Ürün açıklaması üstü",
        description: "Ürün açıklaması bölümünün üzerinde görünür."
      },
      {
        value: "detail_description_bottom",
        label: "Ürün açıklaması altı",
        description: "Ürün açıklaması bölümünün altında görünür."
      },
      {
        value: "detail_trust_section_top",
        label: "Güven / satın alma bölümü üstü",
        description: "Güven ve satın alma bölümünün üzerinde görünür."
      }
    ]
  },
  {
    label: "Ürün Listeleme Kartı",
    options: [
      {
        value: "card_image_top_left",
        label: "Ürün kartı görsel sol üst",
        description: "Listeleme sayfasındaki ürün kartı görselinin sol üst köşesinde görünür."
      },
      {
        value: "card_image_top_right",
        label: "Ürün kartı görsel sağ üst",
        description: "Listeleme sayfasındaki ürün kartı görselinin sağ üst köşesinde görünür."
      },
      {
        value: "card_image_bottom_left",
        label: "Ürün kartı görsel sol alt",
        description: "Listeleme sayfasındaki ürün kartı görselinin sol alt köşesinde görünür."
      },
      {
        value: "card_image_bottom_right",
        label: "Ürün kartı görsel sağ alt",
        description: "Listeleme sayfasındaki ürün kartı görselinin sağ alt köşesinde görünür."
      },
      {
        value: "card_title_top",
        label: "Ürün kartı başlık üstü",
        description: "Listeleme sayfasındaki ürün kartında başlığın üzerinde görünür."
      },
      {
        value: "card_title_bottom",
        label: "Ürün kartı başlık altı",
        description: "Listeleme sayfasındaki ürün kartında başlığın altında görünür."
      },
      {
        value: "card_price_top",
        label: "Ürün kartı fiyat üstü",
        description: "Listeleme sayfasındaki ürün kartında fiyatın üzerinde görünür."
      },
      {
        value: "card_price_bottom",
        label: "Ürün kartı fiyat altı",
        description: "Listeleme sayfasındaki ürün kartında fiyatın altında görünür."
      },
      {
        value: "card_features",
        label: "Ürün kartı özellikleri",
        description: "Listeleme sayfasındaki ürün kartı teknik özellik alanında görünür."
      },
      {
        value: "card_button_top",
        label: "Ürün kartı buton üstü",
        description: "Listeleme sayfasındaki ürün kartında inceleme butonunun üzerinde görünür."
      }
    ]
  }
] as const;

export const productBadgePlacementValues = productBadgePlacementGroups.flatMap((group) =>
  group.options.map((option) => option.value)
);

export type ProductBadgePlacement = (typeof productBadgePlacementValues)[number];

type LegacyProductBadgePlacement = "hero" | "image-left" | "image-right" | "card";

export type ProductDetailBadge = {
  label: string;
  tone?: "success" | "primary" | "warning" | "neutral" | "danger";
  position?: ProductBadgePlacement | LegacyProductBadgePlacement | string;
  isActive?: boolean;
  sortOrder?: number;
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

export type ProductTrustBlock = {
  title: string;
  body: string;
  iconName?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type ProductActionLabels = {
  priceEyebrow: string;
  addToCartLabel: string;
  outOfStockLabel: string;
  specsButtonLabel: string;
  cartLinkLabel: string;
  mobileTotalLabel: string;
  quantityLabel: string;
  subtotalLabel: string;
  feedbackTemplate: string;
};

export type ProductReviewContent = {
  isEnabled: boolean;
  eyebrow: string;
  heading: string;
  emptyText: string;
  countLabel: string;
  firstReviewLabel: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
};

export type ProductDetailContent = {
  adminSortOrder: number;
  heroEyebrow: string;
  infoCards: ProductDetailTextPair[];
  badges: ProductDetailBadge[];
  galleryItems: string[];
  galleryFeatureLabels: string[];
  galleryDeviceCaption: string;
  descriptionEyebrow: string;
  descriptionHeading: string;
  useCasesCtaLabel: string;
  useCasesCtaHref: string;
  specsHeading: string;
  intentHeading: string;
  intentBody: string;
  seoIntents: string[];
  useCasesHeading: string;
  useCases: string[];
  highlightsHeading: string;
  highlights: string[];
  smartFeatures: ProductSmartFeature[];
  smartFeaturesEnabled: boolean;
  smartFeaturesEyebrow: string;
  smartFeaturesHeading: string;
  technicalGroups: ProductTechnicalSpecGroup[];
  purchaseBenefits: string[];
  purchaseReadiness: ProductDetailTextPair[];
  decisionChecks: string[];
  support: ProductSupportContent;
  trustEnabled: boolean;
  trustEyebrow: string;
  trustHeading: string;
  trustBlocks: ProductTrustBlock[];
  policiesEnabled: boolean;
  policyDetails: ProductPolicyDetail[];
  faqHeading: string;
  faqs: ProductDetailFaq[];
  relatedEnabled: boolean;
  relatedEyebrow: string;
  relatedHeading: string;
  relatedLimit: number;
  actionLabels: ProductActionLabels;
  reviews: ProductReviewContent;
};

export type ProductDetailContentInput = Partial<
  Omit<
    ProductDetailContent,
    "support" | "purchaseReadiness" | "policyDetails" | "actionLabels" | "reviews"
  >
> & {
  support?: Partial<ProductSupportContent>;
  purchaseReadiness?: ProductDetailTextPair[];
  policyDetails?: ProductPolicyDetail[];
  actionLabels?: Partial<ProductActionLabels>;
  reviews?: Partial<ProductReviewContent>;
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

function normalizeTextPairs(values?: ProductDetailTextPair[]) {
  return sortByOrder(values ?? [])
    .map((item) => ({
      label: item.label?.trim() ?? "",
      value: item.value?.trim() ?? "",
      description: item.description?.trim() ?? "",
      iconName: item.iconName?.trim() ?? "",
      isActive: item.isActive !== false,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 0
    }))
    .filter((item) => item.isActive && item.label && item.value)
    .map((item, index) => ({
      ...item,
      sortOrder: item.sortOrder || index + 1
    }));
}

export function normalizeProductBadgePlacement(
  value?: string | null
): ProductBadgePlacement {
  if (value && (productBadgePlacementValues as readonly string[]).includes(value)) {
    return value as ProductBadgePlacement;
  }

  if (value === "image-left") {
    return "detail_image_top_left";
  }

  if (value === "image-right") {
    return "detail_image_top_right";
  }

  if (value === "card") {
    return "card_title_top";
  }

  return "detail_title_top";
}

function normalizeBadges(values?: ProductDetailBadge[]) {
  return sortByOrder(values ?? [])
    .map((item, index) => ({
      label: item.label?.trim() ?? "",
      tone: item.tone ?? "neutral",
      position: normalizeProductBadgePlacement(item.position),
      isActive: item.isActive !== false,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1
    }))
    .filter((item) => item.isActive && item.label);
}

function normalizeTrustBlocks(values?: ProductTrustBlock[]) {
  return sortByOrder(values ?? [])
    .map((item, index) => ({
      title: item.title?.trim() ?? "",
      body: item.body?.trim() ?? "",
      iconName: item.iconName?.trim() ?? "shield",
      isActive: item.isActive !== false,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1
    }))
    .filter((item) => item.isActive && item.title && item.body);
}

function getConnectorLabel(product?: ProductModel) {
  const variantConnector =
    product?.variants?.find((variant) => variant.isDefault)?.connectorType ??
    product?.variants?.find((variant) => variant.connectorType)?.connectorType;
  const specConnector = product?.specs.find((spec) =>
    /konnektör|konnektor|soket|connector/i.test(spec.label)
  )?.value;

  return variantConnector || specConnector || "Type 2 uyumlu";
}

function getSummaryCardDefaults(product?: ProductModel): ProductDetailTextPair[] {
  const category = product?.category ?? "";
  const powerLabel = product?.powerLabel || "Net güç sınıfı";
  const connector = getConnectorLabel(product);
  const primaryUseCase = product?.useCases?.find(Boolean);
  const isAccessory = category === "Aksesuar";
  const isHighPower =
    powerLabel.toLocaleLowerCase("tr-TR").includes("dc") || powerLabel.includes("22");

  return [
    {
      label: "Güç",
      value: powerLabel
    },
    {
      label: "Bağlantı",
      value: connector
    },
    {
      label: "Kurulum",
      value: isAccessory
        ? "Kurulum gerektirmez"
        : isHighPower
          ? "Keşif önerilir"
          : "Pano/faz bilgisiyle netleşir"
    },
    {
      label: "Kullanım",
      value: primaryUseCase || (isAccessory ? "Type 2 uyumlu araçlar" : "Ev, site ve iş yeri")
    }
  ];
}

function getInfoCardDefaults(product?: ProductModel): ProductDetailTextPair[] {
  const defaultVariant =
    product?.variants?.find((variant) => variant.isDefault) ?? product?.variants?.[0];
  const connector = defaultVariant?.connectorType || getConnectorLabel(product);
  const category = product?.category || "";
  const powerLabel = product?.powerLabel || "";
  const useCase = product?.useCases?.[0] || "";
  const specsCorpus = product?.specs.map((spec) => `${spec.label} ${spec.value}`).join(" ") ?? "";
  const likelyAc =
    /\bac\b/i.test(`${powerLabel} ${specsCorpus}`) || /type\s*2|tip\s*2/i.test(`${connector} ${specsCorpus}`);
  const infrastructure =
    powerLabel.toLocaleLowerCase("tr-TR").includes("dc") && !likelyAc
      ? "DC hızlı şarj"
      : powerLabel.includes("22")
        ? "Trifaze AC"
        : likelyAc
          ? "AC altyapı"
          : "";

  return normalizeTextPairs([
    { label: "Kategori", value: category, sortOrder: 1 },
    { label: "Kullanım", value: useCase, sortOrder: 2 },
    { label: "Altyapı", value: infrastructure, sortOrder: 3 },
    { label: "Güç", value: powerLabel, sortOrder: 4 },
    { label: "Soket", value: connector, sortOrder: 5 },
    {
      label: "Kurulum",
      value: powerLabel.toLocaleLowerCase("tr-TR").includes("dc") || powerLabel.includes("22")
        ? "Keşif gerekli"
        : "Kurulum/keşif opsiyonel",
      sortOrder: 6
    }
  ]);
}

function getBadgeDefaults(product?: ProductModel): ProductDetailBadge[] {
  const tags = new Set(product?.tags ?? []);
  const badges: ProductDetailBadge[] = [];

  if (product?.category) {
    badges.push({
      label: product.category,
      tone: "primary",
      position: "detail_title_top",
      isActive: true,
      sortOrder: 1
    });
  }

  if (product?.badge) {
    badges.push({
      label: product.badge,
      tone: "success",
      position: "detail_title_top",
      isActive: true,
      sortOrder: 2
    });
  }

  if (tags.has("free_shipping")) {
    badges.push({
      label: "Kargo Bedava",
      tone: "success",
      position: "detail_image_top_left",
      isActive: true,
      sortOrder: 10
    });
  }

  if (tags.has("ships_tomorrow")) {
    badges.push({
      label: "Yarın Kargoda",
      tone: "warning",
      position: "detail_image_top_right",
      isActive: true,
      sortOrder: 11
    });
  }

  return normalizeBadges(badges);
}

function getIntentDefaults(product?: ProductModel) {
  const category = product?.category ?? "";
  const powerLabel = product?.powerLabel || "EV şarj cihazı";
  const connector = getConnectorLabel(product);
  const isAccessory = category === "Aksesuar";

  return isAccessory
    ? [
        "elektrikli araç şarj aksesuarı arayanlar",
        "Type 2 kablo veya bağlantı ekipmanı ihtiyacı olanlar",
        "mevcut şarj kurulumunu tamamlamak isteyen kullanıcılar"
      ]
    : [
        `${powerLabel} elektrikli araç şarj cihazı arayanlar`,
        `${connector} araçlar için güvenli şarj çözümü isteyenler`,
        "ev, site, iş yeri veya otopark için planlı şarj kurulumu düşünenler"
      ];
}

function getUseCaseDefaults(product?: ProductModel) {
  const category = product?.category ?? "";

  if (category === "Aksesuar") {
    return [
      "Ev tipi şarj kullanımını tamamlayan aksesuar ihtiyacı",
      "Site ve otoparklarda yedek kablo/bağlantı çözümü",
      "Type 2 destekli araçlarda günlük kullanım"
    ];
  }

  if (category.toLocaleLowerCase("tr-TR").includes("dc")) {
    return [
      "Ticari hızlı şarj lokasyonları",
      "Filo ve otopark işletmeleri",
      "Yüksek devirli müşteri kullanım senaryoları"
    ];
  }

  return [
    "Ev, villa ve bireysel otopark kullanımı",
    "Site ve apartman otoparklarında kontrollü şarj",
    "İş yeri, ofis ve küçük filo şarj ihtiyaçları"
  ];
}

function getHighlightDefaults(product?: ProductModel) {
  const powerLabel = product?.powerLabel || "Net güç sınıfı";
  const connector = getConnectorLabel(product);

  return [
    `${powerLabel} bilgisiyle hızlı teknik karar`,
    `${connector} ve altyapı uyumu için sade ürün bilgisi`,
    "Sepete ekleme, teslimat ve kurulum kapsamı tek akışta ilerler",
    "Garanti, iade ve teknik destek bilgileri ürün sayfasında açıkça görünür"
  ];
}

function getTrustBlockDefaults(detailContent?: Pick<ProductDetailContent, "support">): ProductTrustBlock[] {
  return [
    {
      title: "Sipariş takibi",
      body: "Sepete ekleme ve ödeme adımları kısa, açık ve izlenebilir şekilde ilerler.",
      iconName: "shield",
      isActive: true,
      sortOrder: 1
    },
    {
      title: "Kargo ve teslimat",
      body: "Kargo kapsamı ürün etiketleri ve sepet adımıyla netleşir.",
      iconName: "truck",
      isActive: true,
      sortOrder: 2
    },
    {
      title: "Garanti ve iade",
      body: "Garanti, iade ve destek detayları ürün politikasında açıkça gösterilir.",
      iconName: "return",
      isActive: true,
      sortOrder: 3
    },
    {
      title: "Teknik destek",
      body:
        detailContent?.support.body ||
        "Satış öncesi uygunluk ve kurulum soruları için destek alınabilir.",
      iconName: "support",
      isActive: true,
      sortOrder: 4
    }
  ];
}

const defaultActionLabels: ProductActionLabels = {
  priceEyebrow: "ParkChargeEV fiyatı",
  addToCartLabel: "Sepete Ekle",
  outOfStockLabel: "Stokta Yok",
  specsButtonLabel: "Teknik Özellikleri İncele",
  cartLinkLabel: "Sepete git",
  mobileTotalLabel: "Sepet toplamı",
  quantityLabel: "Adet",
  subtotalLabel: "Tahmini ara toplam",
  feedbackTemplate: "{quantity} adet ürün sepete eklendi."
};

const defaultReviewContent: ProductReviewContent = {
  isEnabled: true,
  eyebrow: "Ürün yorumları",
  heading: "{productName} için kullanıcı deneyimleri",
  emptyText:
    "Bu ürün için henüz onaylı yorum yok. Deneyiminizi paylaştığınızda admin onayından sonra yayınlanır.",
  countLabel: "onaylı yorum",
  firstReviewLabel: "İlk yorumu siz yazın",
  submitLabel: "Yorum ekle",
  submittingLabel: "Gönderiliyor...",
  successMessage: "Yorumunuz onaydan sonra yayınlanacak."
};

export function getDefaultProductDetailContent(product?: ProductModel): ProductDetailContent {
  return {
    adminSortOrder: 0,
    heroEyebrow: "ParkChargeEV seçkisi",
    infoCards: getInfoCardDefaults(product),
    badges: getBadgeDefaults(product),
    galleryItems: product?.galleryItems?.length
      ? product.galleryItems
      : ["Ön görünüm", "Yan profil", "Montaj görünümü", "Video"],
    galleryFeatureLabels: ["IP koruma", "Type 2", "Kurulum"],
    galleryDeviceCaption: "Ölçekli cihaz temsili",
    descriptionEyebrow: "Ürün açıklaması",
    descriptionHeading: product?.name ? `${product.name} kimler için uygun?` : "Ürün kimler için uygun?",
    useCasesCtaLabel: "Akıllı seçiciye git",
    useCasesCtaHref: "/urun-secici",
    specsHeading: "Teknik Özellikler",
    intentHeading: "Bu ürün kimin için?",
    intentBody:
      "Ürün, aşağıdaki satın alma senaryolarında hızlı ve güvenli karar vermenize yardımcı olur.",
    seoIntents: product?.seoIntent?.length ? product.seoIntent : getIntentDefaults(product),
    useCasesHeading: "Uygun kullanım alanı",
    useCases: product?.useCases?.length ? product.useCases : getUseCaseDefaults(product),
    highlightsHeading: "Satış ve kurulum avantajları",
    highlights: product?.highlights?.length ? product.highlights : getHighlightDefaults(product),
    smartFeatures: [],
    smartFeaturesEnabled: true,
    smartFeaturesEyebrow: "Bağlantı ve kontrol",
    smartFeaturesHeading: "Üründe aktif olan erişim ve kontrol yetenekleri.",
    technicalGroups: [],
    purchaseBenefits: [
      "Tek sayfa güvenli ödeme ve net sipariş takibi",
      "Garanti, servis ve kurulum desteği",
      "Keşif talebiyle yanlış ürün riskini azaltma"
    ],
    purchaseReadiness: getSummaryCardDefaults(product),
    decisionChecks: getHighlightDefaults(product),
    support: {
      title: "Uygunluğu birlikte kontrol edelim",
      body:
        "Aracınız, otoparkınız ve elektrik altyapınız için bu ürünün doğru seçim olup olmadığını teknik ekiple netleştirebilirsiniz.",
      ctaLabel: "Uygunluğu Kontrol Et",
      href: "/iletisim"
    },
    trustEnabled: true,
    trustEyebrow: "Güven ve satın alma",
    trustHeading: "Teknik üründe karar riskini azaltan net bilgiler.",
    trustBlocks: getTrustBlockDefaults(),
    policiesEnabled: true,
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
    relatedEnabled: true,
    relatedEyebrow: "İlgili ürünler",
    relatedHeading: "Aynı ihtiyaca uygun alternatifler",
    relatedLimit: 4,
    actionLabels: defaultActionLabels,
    reviews: defaultReviewContent
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
    adminSortOrder: Number.isFinite(Number(input.adminSortOrder))
      ? Number(input.adminSortOrder)
      : base.adminSortOrder,
    galleryItems: hasItems(input.galleryItems) ? compactList(input.galleryItems) : base.galleryItems,
    galleryFeatureLabels: hasItems(input.galleryFeatureLabels)
      ? compactList(input.galleryFeatureLabels)
      : base.galleryFeatureLabels,
    infoCards: hasItems(input.infoCards)
      ? normalizeTextPairs(input.infoCards)
      : base.infoCards,
    badges: hasItems(input.badges)
      ? normalizeBadges(input.badges)
      : base.badges,
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
      ? normalizeTextPairs(input.purchaseReadiness)
      : base.purchaseReadiness,
    decisionChecks: hasItems(input.decisionChecks)
      ? compactList(input.decisionChecks)
      : base.decisionChecks,
    support: {
      ...base.support,
      ...input.support
    },
    trustBlocks: hasItems(input.trustBlocks)
      ? normalizeTrustBlocks(input.trustBlocks)
      : base.trustBlocks,
    policyDetails: hasItems(input.policyDetails)
      ? input.policyDetails
      : base.policyDetails,
    faqs: hasItems(input.faqs) ? input.faqs : base.faqs,
    relatedLimit: Number.isFinite(Number(input.relatedLimit))
      ? Number(input.relatedLimit)
      : base.relatedLimit,
    actionLabels: {
      ...base.actionLabels,
      ...input.actionLabels
    },
    reviews: {
      ...base.reviews,
      ...input.reviews
    }
  };
}

export function getProductDetailContent(product: ProductModel): ProductDetailContent {
  return mergeProductDetailContent(
    getDefaultProductDetailContent(product),
    product.detailContent
  );
}

export function getActiveProductDetailBadges(product: ProductModel) {
  return normalizeBadges(getProductDetailContent(product).badges);
}

export function getActiveProductSmartFeatures(product: ProductModel) {
  const detailContent = getProductDetailContent(product);

  if (detailContent.smartFeaturesEnabled === false) {
    return [];
  }

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
