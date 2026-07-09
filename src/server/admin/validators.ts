import { z } from "zod";

import { productBadgePlacementValues } from "@/lib/product-detail-content";
import {
  adminRoleEnum,
  adminUserStatusEnum,
  leadStatusEnum,
  navigationAreaEnum,
  orderStatusEnum,
  productChargeTypeEnum,
  productPhaseEnum,
  productStatusEnum,
  quoteRequestStatusEnum,
  sitePageStatusEnum
} from "@/server/db/schema";

const positiveCurrencySchema = z.coerce.number().int().min(0);
const publicOrRemoteUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) => value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"),
    "URL /, http:// veya https:// ile başlamalıdır."
  );

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8)
});

export const productSpecSchema = z.object({
  id: z.string().optional(),
  groupName: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(255)
});

export const productMediaSchema = z.object({
  id: z.string().optional(),
  mediaType: z.enum(["image", "video"]).default("image"),
  url: publicOrRemoteUrlSchema,
  altText: z.string().trim().max(255).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isPrimary: z.boolean().default(false)
});

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().trim().min(3).max(120),
  title: z.string().trim().min(3).max(180),
  powerLabel: z.string().trim().max(80).optional().or(z.literal("")),
  cableLength: z.string().trim().max(80).optional().or(z.literal("")),
  connectorType: z.string().trim().max(80).optional().or(z.literal("")),
  stockQuantity: z.coerce.number().int().min(0),
  priceKurus: positiveCurrencySchema,
  compareAtKurus: z.coerce.number().int().min(0).optional(),
  isDefault: z.boolean().default(false)
});

const productDetailStringListSchema = z.array(z.string().trim().min(1).max(240)).default([]);

const productDetailTextPairSchema = z.object({
  label: z.string().trim().min(2).max(120),
  value: z.string().trim().min(2).max(320),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  iconName: z.string().trim().max(80).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0)
});

const productDetailBadgeSchema = z.object({
  label: z.string().trim().min(1).max(80),
  tone: z.enum(["success", "primary", "warning", "neutral", "danger"]).default("neutral"),
  position: z
    .string()
    .refine(
      (value) =>
        ([...productBadgePlacementValues, "hero", "image-left", "image-right", "card"] as string[])
          .includes(value),
      "Etiket konumu geçersiz."
    )
    .default("detail_title_top"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0)
});

const productPolicyDetailSchema = z.object({
  title: z.string().trim().min(2).max(140),
  body: z.string().trim().min(10).max(1200)
});

const productDetailFaqSchema = z.object({
  question: z.string().trim().min(3).max(180),
  answer: z.string().trim().min(10).max(1200)
});

const productSmartFeatureSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(3).max(500),
  iconName: z.string().trim().max(80).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0)
});

const productTrustBlockSchema = z.object({
  title: z.string().trim().min(2).max(140),
  body: z.string().trim().min(3).max(1000),
  iconName: z.string().trim().max(80).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0)
});

const productActionLabelsSchema = z.object({
  priceEyebrow: z.string().trim().max(80).optional().or(z.literal("")),
  addToCartLabel: z.string().trim().max(80).optional().or(z.literal("")),
  outOfStockLabel: z.string().trim().max(80).optional().or(z.literal("")),
  specsButtonLabel: z.string().trim().max(100).optional().or(z.literal("")),
  cartLinkLabel: z.string().trim().max(80).optional().or(z.literal("")),
  mobileTotalLabel: z.string().trim().max(80).optional().or(z.literal("")),
  quantityLabel: z.string().trim().max(80).optional().or(z.literal("")),
  subtotalLabel: z.string().trim().max(80).optional().or(z.literal("")),
  feedbackTemplate: z.string().trim().max(160).optional().or(z.literal(""))
}).default({});

const productReviewContentSchema = z.object({
  isEnabled: z.boolean().default(true),
  eyebrow: z.string().trim().max(80).optional().or(z.literal("")),
  heading: z.string().trim().max(160).optional().or(z.literal("")),
  emptyText: z.string().trim().max(500).optional().or(z.literal("")),
  countLabel: z.string().trim().max(80).optional().or(z.literal("")),
  firstReviewLabel: z.string().trim().max(100).optional().or(z.literal("")),
  submitLabel: z.string().trim().max(80).optional().or(z.literal("")),
  submittingLabel: z.string().trim().max(80).optional().or(z.literal("")),
  successMessage: z.string().trim().max(200).optional().or(z.literal(""))
}).default({});

const productTechnicalSpecItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(255),
  unit: z.string().trim().max(40).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0)
});

const productTechnicalSpecGroupSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  items: z.array(productTechnicalSpecItemSchema).default([])
});

export const productDetailContentSchema = z
  .object({
    adminSortOrder: z.coerce.number().int().min(0).max(9999).default(0),
    heroEyebrow: z.string().trim().max(80).optional().or(z.literal("")),
    infoCards: z.array(productDetailTextPairSchema).default([]),
    badges: z.array(productDetailBadgeSchema).default([]),
    galleryItems: productDetailStringListSchema,
    galleryFeatureLabels: productDetailStringListSchema,
    galleryDeviceCaption: z.string().trim().max(120).optional().or(z.literal("")),
    descriptionEyebrow: z.string().trim().max(100).optional().or(z.literal("")),
    descriptionHeading: z.string().trim().max(180).optional().or(z.literal("")),
    useCasesCtaLabel: z.string().trim().max(80).optional().or(z.literal("")),
    useCasesCtaHref: z
      .string()
      .trim()
      .max(500)
      .refine(
        (value) => value === "" || value.startsWith("/") || value.startsWith("https://"),
        "Link / ile veya https:// ile başlamalıdır."
      )
      .optional()
      .or(z.literal("")),
    specsHeading: z.string().trim().max(120).optional().or(z.literal("")),
    intentHeading: z.string().trim().max(120).optional().or(z.literal("")),
    intentBody: z.string().trim().max(500).optional().or(z.literal("")),
    seoIntents: productDetailStringListSchema,
    useCasesHeading: z.string().trim().max(120).optional().or(z.literal("")),
    useCases: productDetailStringListSchema,
    highlightsHeading: z.string().trim().max(120).optional().or(z.literal("")),
    highlights: productDetailStringListSchema,
    smartFeatures: z.array(productSmartFeatureSchema).default([]),
    smartFeaturesEnabled: z.boolean().default(true),
    smartFeaturesEyebrow: z.string().trim().max(100).optional().or(z.literal("")),
    smartFeaturesHeading: z.string().trim().max(180).optional().or(z.literal("")),
    technicalGroups: z.array(productTechnicalSpecGroupSchema).default([]),
    purchaseBenefits: productDetailStringListSchema,
    purchaseReadiness: z.array(productDetailTextPairSchema).default([]),
    decisionChecks: productDetailStringListSchema,
    support: z
      .object({
        title: z.string().trim().max(120).optional().or(z.literal("")),
        body: z.string().trim().max(700).optional().or(z.literal("")),
        ctaLabel: z.string().trim().max(80).optional().or(z.literal("")),
        href: z
          .string()
          .trim()
          .max(500)
          .refine(
            (value) => value === "" || value.startsWith("/") || value.startsWith("https://"),
            "Link / ile veya https:// ile başlamalıdır."
          )
          .optional()
          .or(z.literal(""))
      })
      .default({}),
    trustEnabled: z.boolean().default(true),
    trustEyebrow: z.string().trim().max(100).optional().or(z.literal("")),
    trustHeading: z.string().trim().max(180).optional().or(z.literal("")),
    trustBlocks: z.array(productTrustBlockSchema).default([]),
    policiesEnabled: z.boolean().default(true),
    policyDetails: z.array(productPolicyDetailSchema).default([]),
    faqHeading: z.string().trim().max(120).optional().or(z.literal("")),
    faqs: z.array(productDetailFaqSchema).default([]),
    relatedEnabled: z.boolean().default(true),
    relatedEyebrow: z.string().trim().max(120).optional().or(z.literal("")),
    relatedHeading: z.string().trim().max(160).optional().or(z.literal("")),
    relatedLimit: z.coerce.number().int().min(0).max(12).default(4),
    actionLabels: productActionLabelsSchema,
    reviews: productReviewContentSchema
  })
  .default({});

export const adminProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3).max(180),
  slug: z.string().trim().max(220).optional().or(z.literal("")),
  status: z.enum(productStatusEnum.enumValues),
  brandId: z.string().uuid().nullable().optional().or(z.literal("")),
  shortDescription: z.string().trim().min(10),
  description: z.string().trim().min(20),
  useCase: z.string().trim().max(80).optional().or(z.literal("")),
  sku: z.string().trim().min(3).max(120),
  variantTitle: z.string().trim().min(3).max(180),
  powerLabel: z.string().trim().max(80).optional().or(z.literal("")),
  cableLength: z.string().trim().max(80).optional().or(z.literal("")),
  priceKurus: positiveCurrencySchema,
  compareAtKurus: z.coerce.number().int().min(0).optional(),
  stockQuantity: z.coerce.number().int().min(0),
  minimumStockThreshold: z.coerce.number().int().min(0),
  inventoryTrackingEnabled: z.boolean().default(true),
  isVatIncluded: z.boolean().default(true),
  discountedPriceKurus: z.coerce.number().int().min(0).nullable().optional(),
  discountEndsAt: z.string().nullable().optional(),
  powerKw: z.string().trim().max(40).optional().or(z.literal("")),
  chargeType: z.enum(productChargeTypeEnum.enumValues).nullable().optional(),
  connectorType: z.string().trim().max(80).optional().or(z.literal("")),
  phaseType: z.enum(productPhaseEnum.enumValues).nullable().optional(),
  ipClass: z.string().trim().max(24).optional().or(z.literal("")),
  hasWifi: z.boolean().default(false),
  hasBluetooth: z.boolean().default(false),
  hasRfid: z.boolean().default(false),
  has4g: z.boolean().default(false),
  installRequired: z.boolean().default(false),
  categories: z.array(z.string().trim().min(1)).min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
  vehicleBrands: z.array(z.string().trim().min(1).max(60)).default([]),
  relatedProductIds: z.array(z.string().uuid()).default([]),
  accessoryProductIds: z.array(z.string().uuid()).default([]),
  variants: z.array(productVariantSchema).default([]),
  media: z.array(productMediaSchema).default([]),
  specs: z.array(productSpecSchema).default([]),
  detailContent: productDetailContentSchema,
  seoTitle: z.string().trim().max(255).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  canonicalUrl: z.string().trim().url().optional().or(z.literal("")),
  ogImageUrl: z.string().trim().url().optional().or(z.literal("")),
  aiSummary: z.string().trim().max(180).optional().or(z.literal("")),
  searchKeywords: z.array(z.string().trim().min(1)).default([]),
  adminNotes: z.string().trim().optional().or(z.literal(""))
});

export const adminOrderUpdateSchema = z.object({
  status: z.enum(orderStatusEnum.enumValues),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  shippingCarrier: z.string().trim().max(80).optional().or(z.literal("")),
  trackingNumber: z.string().trim().max(120).optional().or(z.literal("")),
  trackingUrl: z.string().trim().url().optional().or(z.literal(""))
});

export const adminQuoteUpdateSchema = z.object({
  status: z.enum(quoteRequestStatusEnum.enumValues),
  assignedAdminId: z.string().uuid().nullable().optional(),
  note: z.string().trim().max(2000).optional().or(z.literal(""))
});

export const adminListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.string().trim().optional(),
  cursor: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  sort: z.string().trim().optional(),
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  stock: z.string().trim().optional(),
  paymentStatus: z.string().trim().optional(),
  customer: z.string().trim().optional(),
  format: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

export const adminProductBulkActionSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(["archive", "activate", "draft"])
});

export const adminInventoryAdjustmentSchema = z.object({
  variantId: z.string().uuid(),
  quantityAfter: z.coerce.number().int().min(0),
  note: z.string().trim().max(1000).optional().or(z.literal(""))
});

export const adminUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().trim().email(),
  fullName: z.string().trim().min(3).max(160),
  role: z.enum(adminRoleEnum.enumValues),
  status: z.enum(adminUserStatusEnum.enumValues).default("active"),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  password: z.string().trim().min(8).optional().or(z.literal(""))
});

export const adminPasswordResetSchema = z.object({
  password: z.string().trim().min(8)
});

export const adminBlogPostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().max(220).optional().or(z.literal("")),
  excerpt: z.string().trim().min(10),
  body: z.string().trim().min(20),
  seoTitle: z.string().trim().max(255).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  publishedAt: z.string().nullable().optional()
});

export const adminServiceLeadUpdateSchema = z.object({
  status: z.enum(leadStatusEnum.enumValues),
  assignedAdminId: z.string().uuid().nullable().optional(),
  note: z.string().trim().max(2000).optional().or(z.literal(""))
});

export const adminBrandSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  websiteUrl: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true)
});

export const adminCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional().default(true)
});

export const adminPaytrOperationSchema = z.object({
  action: z.enum(["reconcile", "mark_refunded"]),
  note: z.string().trim().max(2000).optional().or(z.literal(""))
});

export const adminNavigationItemSchema = z.object({
  id: z.string().uuid().optional(),
  area: z.enum(navigationAreaEnum.enumValues),
  label: z.string().trim().min(2).max(120),
  href: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine(
      (value) => value.startsWith("/") || value.startsWith("https://"),
      "Link / ile veya https:// ile başlamalıdır."
    ),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
  opensInNewTab: z.boolean().default(false),
  rel: z.string().trim().max(120).optional().or(z.literal(""))
});

const optionalAdminUrlSchema = z.string().trim().url().optional().or(z.literal(""));

export const adminSiteSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  brandName: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(800),
  logoUrl: publicOrRemoteUrlSchema.optional().or(z.literal("")),
  logoAlt: z.string().trim().max(180).optional().or(z.literal("")),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email(),
  whatsappPhone: z.string().trim().min(5).max(40),
  supportHours: z.string().trim().min(3).max(80),
  streetAddress: z.string().trim().min(5).max(255),
  addressLocality: z.string().trim().min(2).max(120),
  addressRegion: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  addressCountry: z.string().trim().min(2).max(8).default("TR"),
  mapEmbedUrl: optionalAdminUrlSchema,
  maintenanceMode: z.boolean().optional().default(false),
  maintenanceMessage: z.string().trim().max(1000).optional().or(z.literal("")),
  shippingSettings: z
    .object({
      freeShippingThresholdKurus: z.coerce.number().int().min(0).optional(),
      defaultShippingKurus: z.coerce.number().int().min(0).optional(),
      carrierName: z.string().trim().max(120).optional().or(z.literal("")),
      announcement: z
        .object({
          isActive: z.boolean().optional().default(false),
          messages: z
            .array(z.string().trim().min(1).max(180))
            .max(8)
            .optional()
            .default([]),
          href: z
            .string()
            .trim()
            .max(500)
            .refine(
              (value) => value === "" || value.startsWith("/") || value.startsWith("https://"),
              "Duyuru linki / veya https:// ile başlamalıdır."
            )
            .optional()
            .or(z.literal("")),
          tone: z.enum(["emerald", "amber", "slate"]).optional().default("emerald")
        })
        .optional()
        .default({})
    })
    .optional()
    .default({}),
  taxSettings: z
    .object({
      vatRate: z.coerce.number().min(0).max(1).optional(),
      pricesIncludeVat: z.boolean().optional()
    })
    .optional()
    .default({}),
  paymentSettings: z
    .object({
      provider: z.string().trim().max(40).optional().or(z.literal("")),
      testMode: z.boolean().optional(),
      installmentEnabled: z.boolean().optional()
    })
    .optional()
    .default({}),
  serviceAreas: z.array(z.string().trim().min(2).max(80)).min(1),
  socials: z
    .object({
      instagram: optionalAdminUrlSchema,
      facebook: optionalAdminUrlSchema,
      linkedin: optionalAdminUrlSchema,
      youtube: optionalAdminUrlSchema
    })
    .default({})
});

export const adminNotificationPatchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  isRead: z.boolean()
});

export const adminMerchandisingSlotsSchema = z.object({
  slots: z
    .array(
      z.object({
        slotKey: z.enum(["home_product_portfolio", "store_featured_products"]),
        productId: z.string().uuid(),
        sortOrder: z.coerce.number().int().min(0).max(999).default(0),
        isActive: z.boolean().default(true)
      })
    )
    .max(24)
});

export const adminSitePageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(220)
    .transform((value) => value.replace(/^\/+|\/+$/g, ""))
    .refine((value) => value.length > 0, "Slug boş olamaz."),
  title: z.string().trim().min(3).max(180),
  eyebrow: z.string().trim().max(120).optional().or(z.literal("")),
  excerpt: z.string().trim().min(10).max(2000),
  body: z.string().trim().min(20),
  seoTitle: z.string().trim().max(255).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  canonicalUrl: z.string().trim().url().optional().or(z.literal("")),
  ogImageUrl: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(sitePageStatusEnum.enumValues).default("draft"),
  showInSitemap: z.boolean().default(true),
  noIndex: z.boolean().default(false),
  sitemapPriority: z.coerce.number().int().min(0).max(100).default(70),
  changeFrequency: z
    .enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"])
    .default("monthly")
});
