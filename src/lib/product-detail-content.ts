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
    label: "ÃœrÃ¼n Detay SayfasÄ±",
    options: [
      {
        value: "detail_title_top",
        label: "ÃœrÃ¼n adÄ± Ã¼stÃ¼",
        description: "ÃœrÃ¼n detay sayfasÄ±nda Ã¼rÃ¼n adÄ±nÄ±n Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_title_bottom",
        label: "ÃœrÃ¼n adÄ± altÄ±",
        description: "ÃœrÃ¼n detay sayfasÄ±nda Ã¼rÃ¼n adÄ±nÄ±n hemen altÄ±nda gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_short_description_top",
        label: "KÄ±sa aÃ§Ä±klama Ã¼stÃ¼",
        description: "KÄ±sa aÃ§Ä±klamanÄ±n Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_short_description_bottom",
        label: "KÄ±sa aÃ§Ä±klama altÄ±",
        description: "KÄ±sa aÃ§Ä±klamanÄ±n altÄ±nda gÃ¶rÃ¼nÃ¼r."
      }
    ]
  },
  {
    label: "ÃœrÃ¼n GÃ¶rseli Ãœzeri",
    options: [
      {
        value: "detail_image_top_left",
        label: "ÃœrÃ¼n gÃ¶rseli sol Ã¼st",
        description: "ÃœrÃ¼n detay sayfasÄ±ndaki ana gÃ¶rselin sol Ã¼st kÃ¶ÅŸesinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_image_top_right",
        label: "ÃœrÃ¼n gÃ¶rseli saÄŸ Ã¼st",
        description: "ÃœrÃ¼n detay sayfasÄ±ndaki ana gÃ¶rselin saÄŸ Ã¼st kÃ¶ÅŸesinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_image_bottom_left",
        label: "ÃœrÃ¼n gÃ¶rseli sol alt",
        description: "ÃœrÃ¼n detay sayfasÄ±ndaki ana gÃ¶rselin sol alt kÃ¶ÅŸesinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_image_bottom_right",
        label: "ÃœrÃ¼n gÃ¶rseli saÄŸ alt",
        description: "ÃœrÃ¼n detay sayfasÄ±ndaki ana gÃ¶rselin saÄŸ alt kÃ¶ÅŸesinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_image_top_center",
        label: "ÃœrÃ¼n gÃ¶rseli merkez Ã¼st",
        description: "ÃœrÃ¼n detay sayfasÄ±ndaki ana gÃ¶rselin Ã¼st orta alanÄ±nda gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_image_bottom_center",
        label: "ÃœrÃ¼n gÃ¶rseli merkez alt",
        description: "ÃœrÃ¼n detay sayfasÄ±ndaki ana gÃ¶rselin alt orta alanÄ±nda gÃ¶rÃ¼nÃ¼r."
      }
    ]
  },
  {
    label: "SatÄ±n Alma AlanÄ±",
    options: [
      {
        value: "detail_price_top",
        label: "Fiyat Ã¼stÃ¼",
        description: "SatÄ±n alma kartÄ±ndaki fiyat alanÄ±nÄ±n Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_price_bottom",
        label: "Fiyat altÄ±",
        description: "SatÄ±n alma kartÄ±ndaki fiyat alanÄ±nÄ±n altÄ±nda gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_add_to_cart_top",
        label: "Sepete ekle butonu Ã¼stÃ¼",
        description: "Sepete ekle butonunun hemen Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_add_to_cart_bottom",
        label: "Sepete ekle butonu altÄ±",
        description: "Sepete ekle ve teknik Ã¶zellikler butonlarÄ±nÄ±n altÄ±nda gÃ¶rÃ¼nÃ¼r."
      }
    ]
  },
  {
    label: "ÃœrÃ¼n AÃ§Ä±klamasÄ± / Teknik Alan",
    options: [
      {
        value: "detail_specs_top",
        label: "Teknik Ã¶zellikler Ã¼stÃ¼",
        description: "Teknik Ã¶zellikler bÃ¶lÃ¼m baÅŸlÄ±ÄŸÄ±nÄ±n Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_description_top",
        label: "ÃœrÃ¼n aÃ§Ä±klamasÄ± Ã¼stÃ¼",
        description: "ÃœrÃ¼n aÃ§Ä±klamasÄ± bÃ¶lÃ¼mÃ¼nÃ¼n Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_description_bottom",
        label: "ÃœrÃ¼n aÃ§Ä±klamasÄ± altÄ±",
        description: "ÃœrÃ¼n aÃ§Ä±klamasÄ± bÃ¶lÃ¼mÃ¼nÃ¼n altÄ±nda gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "detail_trust_section_top",
        label: "GÃ¼ven / satÄ±n alma bÃ¶lÃ¼mÃ¼ Ã¼stÃ¼",
        description: "GÃ¼ven ve satÄ±n alma bÃ¶lÃ¼mÃ¼nÃ¼n Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      }
    ]
  },
  {
    label: "ÃœrÃ¼n Listeleme KartÄ±",
    options: [
      {
        value: "card_image_top_left",
        label: "ÃœrÃ¼n kartÄ± gÃ¶rsel sol Ã¼st",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ± gÃ¶rselinin sol Ã¼st kÃ¶ÅŸesinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_image_top_right",
        label: "ÃœrÃ¼n kartÄ± gÃ¶rsel saÄŸ Ã¼st",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ± gÃ¶rselinin saÄŸ Ã¼st kÃ¶ÅŸesinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_image_bottom_left",
        label: "ÃœrÃ¼n kartÄ± gÃ¶rsel sol alt",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ± gÃ¶rselinin sol alt kÃ¶ÅŸesinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_image_bottom_right",
        label: "ÃœrÃ¼n kartÄ± gÃ¶rsel saÄŸ alt",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ± gÃ¶rselinin saÄŸ alt kÃ¶ÅŸesinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_title_top",
        label: "ÃœrÃ¼n kartÄ± baÅŸlÄ±k Ã¼stÃ¼",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ±nda baÅŸlÄ±ÄŸÄ±n Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_title_bottom",
        label: "ÃœrÃ¼n kartÄ± baÅŸlÄ±k altÄ±",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ±nda baÅŸlÄ±ÄŸÄ±n altÄ±nda gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_price_top",
        label: "ÃœrÃ¼n kartÄ± fiyat Ã¼stÃ¼",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ±nda fiyatÄ±n Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_price_bottom",
        label: "ÃœrÃ¼n kartÄ± fiyat altÄ±",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ±nda fiyatÄ±n altÄ±nda gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_features",
        label: "ÃœrÃ¼n kartÄ± Ã¶zellikleri",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ± teknik Ã¶zellik alanÄ±nda gÃ¶rÃ¼nÃ¼r."
      },
      {
        value: "card_button_top",
        label: "ÃœrÃ¼n kartÄ± buton Ã¼stÃ¼",
        description: "Listeleme sayfasÄ±ndaki Ã¼rÃ¼n kartÄ±nda inceleme butonunun Ã¼zerinde gÃ¶rÃ¼nÃ¼r."
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
    /konnektÃ¶r|konnektor|soket|connector/i.test(spec.label)
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
      label: "YarÄ±n Kargoda",
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
  const powerLabel = product?.powerLabel || "EV ÅŸarj cihazÄ±";
  const connector = getConnectorLabel(product);
  const isAccessory = category === "Aksesuar";

  return isAccessory
    ? [
        "elektrikli araÃ§ ÅŸarj aksesuarÄ± arayanlar",
        "Type 2 kablo veya baÄŸlantÄ± ekipmanÄ± ihtiyacÄ± olanlar",
        "mevcut ÅŸarj kurulumunu tamamlamak isteyen kullanÄ±cÄ±lar"
      ]
    : [
        `${powerLabel} elektrikli araÃ§ ÅŸarj cihazÄ± arayanlar`,
        `${connector} araÃ§lar iÃ§in gÃ¼venli ÅŸarj Ã§Ã¶zÃ¼mÃ¼ isteyenler`,
        "ev, site, iÅŸ yeri veya otopark iÃ§in planlÄ± ÅŸarj kurulumu dÃ¼ÅŸÃ¼nenler"
      ];
}

function getUseCaseDefaults(product?: ProductModel) {
  const category = product?.category ?? "";

  if (category === "Aksesuar") {
    return [
      "Ev tipi ÅŸarj kullanÄ±mÄ±nÄ± tamamlayan aksesuar ihtiyacÄ±",
      "Site ve otoparklarda yedek kablo/baÄŸlantÄ± Ã§Ã¶zÃ¼mÃ¼",
      "Type 2 destekli araÃ§larda gÃ¼nlÃ¼k kullanÄ±m"
    ];
  }

  if (category.toLocaleLowerCase("tr-TR").includes("dc")) {
    return [
      "Ticari hÄ±zlÄ± ÅŸarj lokasyonlarÄ±",
      "Filo ve otopark iÅŸletmeleri",
      "YÃ¼ksek devirli mÃ¼ÅŸteri kullanÄ±m senaryolarÄ±"
    ];
  }

  return [
    "Ev, villa ve bireysel otopark kullanÄ±mÄ±",
    "Site ve apartman otoparklarÄ±nda kontrollÃ¼ ÅŸarj",
    "Ä°ÅŸ yeri, ofis ve kÃ¼Ã§Ã¼k filo ÅŸarj ihtiyaÃ§larÄ±"
  ];
}

function getHighlightDefaults(product?: ProductModel) {
  const powerLabel = product?.powerLabel || "Net gÃ¼Ã§ sÄ±nÄ±fÄ±";
  const connector = getConnectorLabel(product);

  return [
    `${powerLabel} bilgisiyle hÄ±zlÄ± teknik karar`,
    `${connector} ve altyapÄ± uyumu iÃ§in sade Ã¼rÃ¼n bilgisi`,
    "Sepete ekleme, teslimat ve kurulum kapsamÄ± tek akÄ±ÅŸta ilerler",
    "Garanti, iade ve teknik destek bilgileri Ã¼rÃ¼n sayfasÄ±nda aÃ§Ä±kÃ§a gÃ¶rÃ¼nÃ¼r"
  ];
}

const defaultActionLabels: ProductActionLabels = {
  priceEyebrow: "ParkChargeEV fiyatÄ±",
  addToCartLabel: "Sepete Ekle",
  outOfStockLabel: "Stokta Yok",
  specsButtonLabel: "Teknik Ã–zellikleri Ä°ncele",
  cartLinkLabel: "Sepete git",
  mobileTotalLabel: "Sepet toplamÄ±",
  quantityLabel: "Adet",
  subtotalLabel: "Tahmini ara toplam",
  feedbackTemplate: "{quantity} adet Ã¼rÃ¼n sepete eklendi."
};

const defaultReviewContent: ProductReviewContent = {
  isEnabled: true,
  eyebrow: "ÃœrÃ¼n yorumlarÄ±",
  heading: "{productName} iÃ§in kullanÄ±cÄ± deneyimleri",
  emptyText:
    "Bu Ã¼rÃ¼n iÃ§in henÃ¼z onaylÄ± yorum yok. Deneyiminizi paylaÅŸtÄ±ÄŸÄ±nÄ±zda admin onayÄ±ndan sonra yayÄ±nlanÄ±r.",
  countLabel: "onaylÄ± yorum",
  firstReviewLabel: "Ä°lk yorumu siz yazÄ±n",
  submitLabel: "Yorum ekle",
  submittingLabel: "GÃ¶nderiliyor...",
  successMessage: "Yorumunuz onaydan sonra yayÄ±nlanacak."
};

export function getDefaultProductDetailContent(product?: ProductModel): ProductDetailContent {
  return {
    adminSortOrder: 0,
    heroEyebrow: "ParkChargeEV seÃ§kisi",
    badges: getBadgeDefaults(product),
    galleryItems: product?.galleryItems?.length
      ? product.galleryItems
      : ["Ã–n gÃ¶rÃ¼nÃ¼m", "Yan profil", "Montaj gÃ¶rÃ¼nÃ¼mÃ¼", "Video"],
    galleryFeatureLabels: ["IP koruma", "Type 2", "Kurulum"],
    galleryDeviceCaption: "Ã–lÃ§ekli cihaz temsili",
    descriptionEyebrow: "ÃœrÃ¼n aÃ§Ä±klamasÄ±",
    descriptionHeading: product?.name ? `${product.name} kimler iÃ§in uygun?` : "ÃœrÃ¼n kimler iÃ§in uygun?",
    useCasesCtaLabel: "AkÄ±llÄ± seÃ§iciye git",
    useCasesCtaHref: "/urun-secici",
    specsHeading: "Teknik Ã–zellikler",
    intentHeading: "Bu Ã¼rÃ¼n kimin iÃ§in?",
    intentBody:
      "ÃœrÃ¼n, aÅŸaÄŸÄ±daki satÄ±n alma senaryolarÄ±nda hÄ±zlÄ± ve gÃ¼venli karar vermenize yardÄ±mcÄ± olur.",
    seoIntents: product?.seoIntent?.length ? product.seoIntent : getIntentDefaults(product),
    useCasesHeading: "Uygun kullanÄ±m alanÄ±",
    useCases: product?.useCases?.length ? product.useCases : getUseCaseDefaults(product),
    highlightsHeading: "SatÄ±ÅŸ ve kurulum avantajlarÄ±",
    highlights: product?.highlights?.length ? product.highlights : getHighlightDefaults(product),
    technicalGroups: [],
    support: {
      title: "UygunluÄŸu birlikte kontrol edelim",
      body:
        "AracÄ±nÄ±z, otoparkÄ±nÄ±z ve elektrik altyapÄ±nÄ±z iÃ§in bu Ã¼rÃ¼nÃ¼n doÄŸru seÃ§im olup olmadÄ±ÄŸÄ±nÄ± teknik ekiple netleÅŸtirebilirsiniz.",
      ctaLabel: "UygunluÄŸu Kontrol Et",
      href: "/iletisim"
    },
    faqHeading: "Karar Ã¶ncesi sÄ±k sorulanlar",
    faqs: product?.faqs?.length ? product.faqs : [],
    relatedEnabled: true,
    relatedEyebrow: "Ä°lgili Ã¼rÃ¼nler",
    relatedHeading: "AynÄ± ihtiyaca uygun alternatifler",
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
    badges: hasItems(input.badges)
      ? normalizeBadges(input.badges)
      : base.badges,
    seoIntents: hasItems(input.seoIntents)
      ? compactList(input.seoIntents)
      : base.seoIntents,
    useCases: hasItems(input.useCases)
      ? compactList(input.useCases)
      : base.useCases,
    highlights: hasItems(input.highlights)
      ? compactList(input.highlights)
      : base.highlights,
    technicalGroups: hasItems(input.technicalGroups)
      ? normalizeTechnicalGroups(input.technicalGroups)
      : base.technicalGroups,
    support: {
      ...base.support,
      ...input.support
    },
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


