import type { ProductModel } from "@/lib/mock-data";
import { repairMojibakeDeep } from "@/lib/text-encoding";

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


export type ProductDetailFaq = {
  question: string;
  answer: string;
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
  badges: ProductDetailBadge[];
  galleryItems: string[];
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
  technicalGroups: ProductTechnicalSpecGroup[];
  support: ProductSupportContent;
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
    "support" | "actionLabels" | "reviews"
  >
> & {
  support?: Partial<ProductSupportContent>;
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


function getConnectorLabel(product?: ProductModel) {
  const variantConnector =
    product?.variants?.find((variant) => variant.isDefault)?.connectorType ??
    product?.variants?.find((variant) => variant.connectorType)?.connectorType;
  const specConnector = product?.specs.find((spec) =>
    /konnektör|konnektor|soket|connector/i.test(spec.label)
  )?.value;

  return variantConnector || specConnector || "Type 2 uyumlu";
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
    badges: getBadgeDefaults(product),
    galleryItems: product?.galleryItems?.length
      ? product.galleryItems
      : ["Ön görünüm", "Yan profil", "Montaj görünümü", "Video"],
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
    technicalGroups: [],
    support: {
      title: "Uygunluğu birlikte kontrol edelim",
      body:
        "Aracınız, otoparkınız ve elektrik altyapınız için bu ürünün doğru seçim olup olmadığını teknik ekiple netleştirebilirsiniz.",
      ctaLabel: "Uygunluğu Kontrol Et",
      href: "/iletisim"
    },
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

  const normalizedInput = repairMojibakeDeep(input);

  return {
    ...base,
    ...input,
    adminSortOrder: Number.isFinite(Number(normalizedInput.adminSortOrder))
      ? Number(normalizedInput.adminSortOrder)
      : base.adminSortOrder,
    galleryItems: hasItems(normalizedInput.galleryItems) ? compactList(normalizedInput.galleryItems) : base.galleryItems,
    badges: hasItems(normalizedInput.badges)
      ? normalizeBadges(normalizedInput.badges)
      : base.badges,
    seoIntents: hasItems(normalizedInput.seoIntents)
      ? compactList(normalizedInput.seoIntents)
      : base.seoIntents,
    useCases: hasItems(normalizedInput.useCases)
      ? compactList(normalizedInput.useCases)
      : base.useCases,
    highlights: hasItems(normalizedInput.highlights)
      ? compactList(normalizedInput.highlights)
      : base.highlights,
    technicalGroups: hasItems(normalizedInput.technicalGroups)
      ? normalizeTechnicalGroups(normalizedInput.technicalGroups)
      : base.technicalGroups,
    support: {
      ...base.support,
      ...normalizedInput.support
    },
    faqs: hasItems(normalizedInput.faqs) ? normalizedInput.faqs : base.faqs,
    relatedLimit: Number.isFinite(Number(normalizedInput.relatedLimit))
      ? Number(normalizedInput.relatedLimit)
      : base.relatedLimit,
    actionLabels: {
      ...base.actionLabels,
      ...normalizedInput.actionLabels
    },
    reviews: {
      ...base.reviews,
      ...normalizedInput.reviews
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

  return repairMojibakeDeep(value) as ProductDetailContentInput;
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



