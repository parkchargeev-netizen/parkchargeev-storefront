import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { products as marketingProducts } from "@/lib/mock-data";
import { slugify } from "@/lib/slug";
import {
  fallbackAssignableAdminSeeds,
  bootstrapAdminId
} from "@/server/admin/fallback-constants";
import {
  orderStatusOptions,
  quoteStatusOptions,
  type OrderStatus,
  type ProductStatus,
  type QuoteStatus
} from "@/server/admin/constants";
import type {
  adminListQuerySchema,
  adminOrderUpdateSchema,
  adminProductSchema,
  adminQuoteUpdateSchema
} from "@/server/admin/validators";
import type { AdminRole } from "@/server/auth/authorization";
import type { AdminSessionPayload } from "@/server/auth/session";
import { z } from "zod";

type ProductInput = z.infer<typeof adminProductSchema>;
type OrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;
type QuoteUpdateInput = z.infer<typeof adminQuoteUpdateSchema>;
type ListQueryInput = z.infer<typeof adminListQuerySchema>;

type CursorPayload = {
  updatedAt: string;
  id: string;
};

type FallbackAdminSummary = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  status: "active";
};

type FallbackProductMedia = {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
};

type FallbackProductSpec = {
  id: string;
  groupName: string;
  label: string;
  value: string;
};

type FallbackProductVariant = {
  id: string;
  sku: string;
  title: string;
  powerLabel: string | null;
  cableLength: string | null;
  connectorType: string | null;
  stockQuantity: number;
  priceKurus: number;
  compareAtKurus: number | null;
  isDefault: boolean;
  createdAt: string;
};

type FallbackProductRecord = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  categoryId: string | null;
  brandId: string | null;
  shortDescription: string;
  description: string;
  useCase: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  aiSummary: string | null;
  schemaJsonLd: Record<string, unknown> | null;
  defaultPriceKurus: number;
  discountedPriceKurus: number | null;
  discountEndsAt: string | null;
  isVatIncluded: boolean;
  minimumStockThreshold: number;
  inventoryTrackingEnabled: boolean;
  powerKw: string | null;
  chargeType: "ac" | "dc" | null;
  connectorType: string | null;
  phaseType: "single_phase" | "three_phase" | null;
  ipClass: string | null;
  hasWifi: boolean;
  hasRfid: boolean;
  has4g: boolean;
  installRequired: boolean;
  adminNotes: string | null;
  searchKeywords: string[];
  createdAt: string;
  updatedAt: string;
  defaultVariant: FallbackProductVariant;
  media: FallbackProductMedia[];
  specs: FallbackProductSpec[];
  tags: string[];
  categories: string[];
  vehicles: string[];
  relatedProductIds: string[];
  accessoryProductIds: string[];
};

type FallbackOrderItem = {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPriceKurus: number;
  lineTotalKurus: number;
};

type FallbackOrderHistoryItem = {
  id: string;
  adminUserId: string | null;
  adminName: string | null;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  createdAt: string;
};

type FallbackPaytrTransaction = {
  id: string;
  merchantOid: string;
  paymentAmountKurus: number;
  totalAmountKurus: number | null;
  status: "created" | "token_received" | "callback_success" | "callback_failed";
  createdAt: string;
  updatedAt: string;
};

type FallbackOrderRecord = {
  id: string;
  customerId: string | null;
  orderNumber: string;
  merchantOid: string;
  status: OrderStatus;
  currency: string;
  subtotalKurus: number;
  shippingKurus: number;
  taxKurus: number;
  totalKurus: number;
  paymentProvider: string;
  paymentStatus: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  statusNote: string | null;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  paytrLastSyncedAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: FallbackOrderItem[];
  history: FallbackOrderHistoryItem[];
  transaction: FallbackPaytrTransaction | null;
};

type FallbackQuoteActivity = {
  id: string;
  adminUserId: string | null;
  adminName: string | null;
  activityType: string;
  note: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

type FallbackQuoteRecord = {
  id: string;
  fullName: string;
  companyName: string | null;
  segment: "site_apartment" | "business" | "fleet" | "individual";
  email: string | null;
  phone: string;
  city: string | null;
  district: string | null;
  estimatedLocation: string | null;
  requestNotes: string | null;
  status: QuoteStatus;
  assignedAdminId: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
  activities: FallbackQuoteActivity[];
};

type FallbackCustomerRecord = {
  id: string;
  createdAt: string;
};

type FallbackServiceLeadRecord = {
  id: string;
  leadType: string;
  status: "new" | "contacted" | "qualified" | "won" | "lost";
  fullName: string;
  createdAt: string;
};

type FallbackStore = {
  version: number;
  products: FallbackProductRecord[];
  orders: FallbackOrderRecord[];
  quotes: FallbackQuoteRecord[];
  customers: FallbackCustomerRecord[];
  serviceLeads: FallbackServiceLeadRecord[];
};

const STORE_VERSION = 1;
const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "admin-fallback.json");
const revenueStatuses: OrderStatus[] = [
  "paid",
  "confirmed",
  "shipped",
  "delivered",
  "fulfilled"
];
const pendingOrderStatuses: OrderStatus[] = [
  "pending_payment",
  "payment_processing",
  "pending_confirmation"
];
const closedQuoteStatuses: QuoteStatus[] = ["won", "lost"];

function encodeCursor(payload: CursorPayload) {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

function decodeCursor(cursor?: string) {
  if (!cursor) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf-8")
    ) as CursorPayload;
  } catch {
    return null;
  }
}

function getBootstrapAdminSummary() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const fullName =
    process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "ParkChargeEV Superadmin";

  if (!email) {
    return null;
  }

  return {
    id: bootstrapAdminId,
    email,
    fullName,
    role: "superadmin" as const,
    status: "active" as const
  };
}

export function listFallbackAssignableAdmins(): FallbackAdminSummary[] {
  const bootstrapAdmin = getBootstrapAdminSummary();
  const admins = [
    ...(bootstrapAdmin ? [bootstrapAdmin] : []),
    ...fallbackAssignableAdminSeeds
  ];

  return admins.filter(
    (admin, index, allAdmins) =>
      allAdmins.findIndex((candidate) => candidate.id === admin.id) === index
  );
}

function getAdminName(adminId?: string | null, fallbackName?: string | null) {
  if (fallbackName) {
    return fallbackName;
  }

  if (!adminId) {
    return null;
  }

  return (
    listFallbackAssignableAdmins().find((admin) => admin.id === adminId)?.fullName ?? null
  );
}

function nowIso() {
  return new Date().toISOString();
}

function isoDaysAgo(days: number, hours = 10) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  value.setHours(hours, 0, 0, 0);
  return value.toISOString();
}

function isoMonthsAgo(months: number, day = 12, hours = 11) {
  const value = new Date();
  value.setMonth(value.getMonth() - months, day);
  value.setHours(hours, 0, 0, 0);
  return value.toISOString();
}

function findMarketingProduct(slug: string) {
  const product = marketingProducts.find((item) => item.slug === slug);

  if (!product) {
    throw new Error(`Fallback urunu bulunamadi: ${slug}`);
  }

  return product;
}

function specValue(
  product: ReturnType<typeof findMarketingProduct>,
  labelPart: string
) {
  return (
    product.specs.find((item) =>
      item.label.toLowerCase().includes(labelPart.toLowerCase())
    )?.value ?? null
  );
}

function toHtmlParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<p>${item}</p>`)
    .join("");
}

function deriveCategorySlug(productSlug: string) {
  switch (productSlug) {
    case "homecharge-pro-11kw":
    case "ecocharge-lite-74kw":
      return "ev-tipi";
    case "business-charge-dual-22kw":
      return "is-yeri-tipi";
    case "dc-fast-60kw":
      return "dc-hizli-sarj";
    default:
      return "aksesuar";
  }
}

function deriveTag(productSlug: string) {
  switch (productSlug) {
    case "homecharge-pro-11kw":
      return ["best_seller"];
    case "business-charge-dual-22kw":
      return ["corporate"];
    case "ecocharge-lite-74kw":
    case "dc-fast-60kw":
      return ["new"];
    default:
      return [];
  }
}

function derivePowerKw(powerLabel: string) {
  return powerLabel.replace(/[^0-9.]/g, "") || null;
}

function deriveChargeType(powerLabel: string): "ac" | "dc" {
  return powerLabel.toLowerCase().includes("dc") ? "dc" : "ac";
}

function derivePhaseType(powerLabel: string): "single_phase" | "three_phase" {
  return powerLabel.includes("7.4") ? "single_phase" : "three_phase";
}

function createSeedProducts(): FallbackProductRecord[] {
  const seedConfig = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      variantId: "11111111-1111-4111-8111-111111111112",
      slug: "homecharge-pro-11kw",
      status: "active" as const,
      stockQuantity: 18,
      minimumStockThreshold: 4,
      vehicles: ["TOGG", "Tesla", "BYD"],
      hasWifi: true,
      hasRfid: true,
      has4g: false,
      installRequired: true,
      createdAt: isoMonthsAgo(1),
      updatedAt: isoDaysAgo(1, 13)
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      variantId: "22222222-2222-4222-8222-222222222223",
      slug: "business-charge-dual-22kw",
      status: "active" as const,
      stockQuantity: 7,
      minimumStockThreshold: 2,
      vehicles: ["TOGG", "Tesla", "BMW"],
      hasWifi: true,
      hasRfid: true,
      has4g: true,
      installRequired: true,
      createdAt: isoMonthsAgo(2),
      updatedAt: isoDaysAgo(4, 12)
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      variantId: "33333333-3333-4333-8333-333333333334",
      slug: "ecocharge-lite-74kw",
      status: "active" as const,
      stockQuantity: 11,
      minimumStockThreshold: 3,
      vehicles: ["Renault", "Hyundai", "Diger"],
      hasWifi: false,
      hasRfid: false,
      has4g: false,
      installRequired: true,
      createdAt: isoMonthsAgo(1, 18),
      updatedAt: isoDaysAgo(2, 10)
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      variantId: "44444444-4444-4444-8444-444444444445",
      slug: "dc-fast-60kw",
      status: "draft" as const,
      stockQuantity: 3,
      minimumStockThreshold: 1,
      vehicles: ["TOGG", "Tesla", "BYD"],
      hasWifi: true,
      hasRfid: true,
      has4g: true,
      installRequired: true,
      createdAt: isoMonthsAgo(3),
      updatedAt: isoDaysAgo(6, 11)
    },
    {
      id: "55555555-5555-4555-8555-555555555555",
      variantId: "55555555-5555-4555-8555-555555555556",
      slug: "type-2-sarj-kablosu-5m",
      status: "active" as const,
      stockQuantity: 34,
      minimumStockThreshold: 6,
      vehicles: ["TOGG", "Tesla", "Renault", "Hyundai"],
      hasWifi: false,
      hasRfid: false,
      has4g: false,
      installRequired: false,
      createdAt: isoMonthsAgo(4),
      updatedAt: isoDaysAgo(3, 15)
    }
  ];

  const records: FallbackProductRecord[] = seedConfig.map((config): FallbackProductRecord => {
    const source = findMarketingProduct(config.slug);
    const categorySlug = deriveCategorySlug(config.slug);
    const connectorType =
      specValue(source, "Type 2") ??
      specValue(source, "CCS") ??
      (config.slug === "dc-fast-60kw" ? "CCS2" : "Type 2");
    const ipClass = specValue(source, "IP");

    return {
      id: config.id,
      name: source.name,
      slug: source.slug,
      status: config.status,
      categoryId: null,
      brandId: null,
      shortDescription: source.summary,
      description: toHtmlParagraphs(source.description),
      useCase: source.useCases[0] ?? null,
      seoTitle: `${source.name} | ParkChargeEV`,
      seoDescription: source.summary,
      canonicalUrl: `https://parkchargeev.local/urun/${source.slug}`,
      ogImageUrl: `https://placehold.co/1200x900/png?text=${encodeURIComponent(source.name)}`,
      aiSummary: source.summary.slice(0, 180),
      schemaJsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: source.name,
        sku: `SKU-${source.slug.toUpperCase().replace(/[^A-Z0-9]/g, "-")}`
      },
      defaultPriceKurus: source.priceKurus,
      discountedPriceKurus: null,
      discountEndsAt: null,
      isVatIncluded: true,
      minimumStockThreshold: config.minimumStockThreshold,
      inventoryTrackingEnabled: true,
      powerKw: derivePowerKw(source.powerLabel),
      chargeType: deriveChargeType(source.powerLabel),
      connectorType,
      phaseType: derivePhaseType(source.powerLabel),
      ipClass,
      hasWifi: config.hasWifi,
      hasRfid: config.hasRfid,
      has4g: config.has4g,
      installRequired: config.installRequired,
      adminNotes: "Yerel fallback panel verisi.",
      searchKeywords: source.seoIntent,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      defaultVariant: {
        id: config.variantId,
        sku: `SKU-${source.slug.toUpperCase().replace(/[^A-Z0-9]/g, "-")}`,
        title: source.name,
        powerLabel: source.powerLabel,
        cableLength: source.cableOptions[0] ?? null,
        connectorType,
        stockQuantity: config.stockQuantity,
        priceKurus: source.priceKurus,
        compareAtKurus: source.compareAtKurus ?? null,
        isDefault: true,
        createdAt: config.createdAt
      },
      media: [
        {
          id: randomUUID(),
          url: `https://placehold.co/1200x900/png?text=${encodeURIComponent(source.name)}`,
          altText: source.name,
          isPrimary: true
        }
      ],
      specs: source.specs.map((item) => ({
        id: randomUUID(),
        groupName: "general",
        label: item.label,
        value: item.value
      })),
      tags: deriveTag(config.slug),
      categories: [categorySlug],
      vehicles: config.vehicles,
      relatedProductIds: [],
      accessoryProductIds: []
    };
  });

  const home = records.find((item) => item.slug === "homecharge-pro-11kw");
  const business = records.find((item) => item.slug === "business-charge-dual-22kw");
  const eco = records.find((item) => item.slug === "ecocharge-lite-74kw");
  const dc = records.find((item) => item.slug === "dc-fast-60kw");
  const cable = records.find((item) => item.slug === "type-2-sarj-kablosu-5m");

  if (home && eco && cable) {
    home.relatedProductIds = [eco.id];
    home.accessoryProductIds = [cable.id];
  }

  if (business && dc && cable) {
    business.relatedProductIds = [dc.id];
    business.accessoryProductIds = [cable.id];
  }

  if (eco && home && cable) {
    eco.relatedProductIds = [home.id];
    eco.accessoryProductIds = [cable.id];
  }

  return records;
}

function createSeedOrders(products: FallbackProductRecord[]): FallbackOrderRecord[] {
  const bySlug = Object.fromEntries(products.map((item) => [item.slug, item]));
  const salesAdmin = fallbackAssignableAdminSeeds[0];

  return [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
      customerId: "cccccccc-cccc-4ccc-8ccc-ccccccccccc1",
      orderNumber: "PCEV-2026-1001",
      merchantOid: "merchant-local-1001",
      status: "delivered",
      currency: "TRY",
      subtotalKurus: 1674000,
      shippingKurus: 0,
      taxKurus: 0,
      totalKurus: 1674000,
      paymentProvider: "paytr",
      paymentStatus: "paid",
      customerName: "Ahmet Yilmaz",
      customerEmail: "ahmet@example.com",
      customerPhone: "05551234567",
      statusNote: "Kurulum tamamlandi ve teslim edildi.",
      shippingCarrier: "ParkChargeEV Lojistik",
      trackingNumber: "LCL-1001",
      trackingUrl: "https://example.com/kargo/LCL-1001",
      paytrLastSyncedAt: isoDaysAgo(0, 14),
      note: "Yerel fallback siparis kaydi",
      createdAt: isoDaysAgo(0, 9),
      updatedAt: isoDaysAgo(0, 14),
      items: [
        {
          id: randomUUID(),
          productId: bySlug["homecharge-pro-11kw"]?.id ?? null,
          variantId: bySlug["homecharge-pro-11kw"]?.defaultVariant.id ?? null,
          productName: "HomeCharge Pro 11kW",
          variantName: "HomeCharge Pro 11kW",
          sku: bySlug["homecharge-pro-11kw"]?.defaultVariant.sku ?? null,
          quantity: 1,
          unitPriceKurus: 1249000,
          lineTotalKurus: 1249000
        },
        {
          id: randomUUID(),
          productId: bySlug["type-2-sarj-kablosu-5m"]?.id ?? null,
          variantId: bySlug["type-2-sarj-kablosu-5m"]?.defaultVariant.id ?? null,
          productName: "Type-2 Sarj Kablosu 5m",
          variantName: "Type-2 Sarj Kablosu 5m",
          sku: bySlug["type-2-sarj-kablosu-5m"]?.defaultVariant.sku ?? null,
          quantity: 1,
          unitPriceKurus: 425000,
          lineTotalKurus: 425000
        }
      ],
      history: [
        {
          id: randomUUID(),
          adminUserId: salesAdmin.id,
          adminName: salesAdmin.fullName,
          fromStatus: "pending_confirmation",
          toStatus: "confirmed",
          note: "Odeme dogrulandi.",
          createdAt: isoDaysAgo(0, 11)
        },
        {
          id: randomUUID(),
          adminUserId: salesAdmin.id,
          adminName: salesAdmin.fullName,
          fromStatus: "confirmed",
          toStatus: "delivered",
          note: "Kurulum ekibi teslim tutanagini kapatti.",
          createdAt: isoDaysAgo(0, 14)
        }
      ],
      transaction: {
        id: randomUUID(),
        merchantOid: "merchant-local-1001",
        paymentAmountKurus: 1674000,
        totalAmountKurus: 1674000,
        status: "callback_success",
        createdAt: isoDaysAgo(0, 9),
        updatedAt: isoDaysAgo(0, 14)
      }
    },
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
      customerId: "cccccccc-cccc-4ccc-8ccc-ccccccccccc2",
      orderNumber: "PCEV-2026-1002",
      merchantOid: "merchant-local-1002",
      status: "confirmed",
      currency: "TRY",
      subtotalKurus: 3490000,
      shippingKurus: 0,
      taxKurus: 0,
      totalKurus: 3490000,
      paymentProvider: "paytr",
      paymentStatus: "paid",
      customerName: "Gizem Karan",
      customerEmail: "gizem@example.com",
      customerPhone: "05559876543",
      statusNote: "Montaj planlamasi bekleniyor.",
      shippingCarrier: null,
      trackingNumber: null,
      trackingUrl: null,
      paytrLastSyncedAt: isoDaysAgo(5, 16),
      note: "Kurumsal siparis",
      createdAt: isoDaysAgo(5, 10),
      updatedAt: isoDaysAgo(5, 16),
      items: [
        {
          id: randomUUID(),
          productId: bySlug["business-charge-dual-22kw"]?.id ?? null,
          variantId: bySlug["business-charge-dual-22kw"]?.defaultVariant.id ?? null,
          productName: "Business Charge Dual 22kW",
          variantName: "Business Charge Dual 22kW",
          sku: bySlug["business-charge-dual-22kw"]?.defaultVariant.sku ?? null,
          quantity: 1,
          unitPriceKurus: 3490000,
          lineTotalKurus: 3490000
        }
      ],
      history: [
        {
          id: randomUUID(),
          adminUserId: salesAdmin.id,
          adminName: salesAdmin.fullName,
          fromStatus: "pending_confirmation",
          toStatus: "confirmed",
          note: "Teklif onayi sonrasinda siparis aktive edildi.",
          createdAt: isoDaysAgo(5, 16)
        }
      ],
      transaction: {
        id: randomUUID(),
        merchantOid: "merchant-local-1002",
        paymentAmountKurus: 3490000,
        totalAmountKurus: 3490000,
        status: "callback_success",
        createdAt: isoDaysAgo(5, 10),
        updatedAt: isoDaysAgo(5, 16)
      }
    },
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
      customerId: "cccccccc-cccc-4ccc-8ccc-ccccccccccc3",
      orderNumber: "PCEV-2026-1003",
      merchantOid: "merchant-local-1003",
      status: "pending_confirmation",
      currency: "TRY",
      subtotalKurus: 890000,
      shippingKurus: 0,
      taxKurus: 0,
      totalKurus: 890000,
      paymentProvider: "paytr",
      paymentStatus: "authorized",
      customerName: "Ece Demir",
      customerEmail: "ece@example.com",
      customerPhone: "05550111223",
      statusNote: "Odeme alindi, manuel kontrol bekleniyor.",
      shippingCarrier: null,
      trackingNumber: null,
      trackingUrl: null,
      paytrLastSyncedAt: isoDaysAgo(1, 17),
      note: "Bireysel siparis",
      createdAt: isoDaysAgo(1, 12),
      updatedAt: isoDaysAgo(1, 17),
      items: [
        {
          id: randomUUID(),
          productId: bySlug["ecocharge-lite-74kw"]?.id ?? null,
          variantId: bySlug["ecocharge-lite-74kw"]?.defaultVariant.id ?? null,
          productName: "EcoCharge Lite 7.4kW",
          variantName: "EcoCharge Lite 7.4kW",
          sku: bySlug["ecocharge-lite-74kw"]?.defaultVariant.sku ?? null,
          quantity: 1,
          unitPriceKurus: 890000,
          lineTotalKurus: 890000
        }
      ],
      history: [],
      transaction: {
        id: randomUUID(),
        merchantOid: "merchant-local-1003",
        paymentAmountKurus: 890000,
        totalAmountKurus: 890000,
        status: "token_received",
        createdAt: isoDaysAgo(1, 12),
        updatedAt: isoDaysAgo(1, 17)
      }
    },
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
      customerId: "cccccccc-cccc-4ccc-8ccc-ccccccccccc4",
      orderNumber: "PCEV-2026-0965",
      merchantOid: "merchant-local-0965",
      status: "fulfilled",
      currency: "TRY",
      subtotalKurus: 12990000,
      shippingKurus: 0,
      taxKurus: 0,
      totalKurus: 12990000,
      paymentProvider: "paytr",
      paymentStatus: "paid",
      customerName: "Kuzey Enerji",
      customerEmail: "operasyon@kuzeyenerji.com",
      customerPhone: "02123456789",
      statusNote: "Saha teslimi kapatildi.",
      shippingCarrier: "ParkChargeEV Proje",
      trackingNumber: "PRJ-965",
      trackingUrl: "https://example.com/proje/PRJ-965",
      paytrLastSyncedAt: isoDaysAgo(38, 14),
      note: "DC proje siparisi",
      createdAt: isoDaysAgo(40, 10),
      updatedAt: isoDaysAgo(34, 14),
      items: [
        {
          id: randomUUID(),
          productId: bySlug["dc-fast-60kw"]?.id ?? null,
          variantId: bySlug["dc-fast-60kw"]?.defaultVariant.id ?? null,
          productName: "DC Fast 60kW",
          variantName: "DC Fast 60kW",
          sku: bySlug["dc-fast-60kw"]?.defaultVariant.sku ?? null,
          quantity: 1,
          unitPriceKurus: 12990000,
          lineTotalKurus: 12990000
        }
      ],
      history: [
        {
          id: randomUUID(),
          adminUserId: salesAdmin.id,
          adminName: salesAdmin.fullName,
          fromStatus: "confirmed",
          toStatus: "fulfilled",
          note: "Proje kapanisi sisteme islendi.",
          createdAt: isoDaysAgo(34, 14)
        }
      ],
      transaction: {
        id: randomUUID(),
        merchantOid: "merchant-local-0965",
        paymentAmountKurus: 12990000,
        totalAmountKurus: 12990000,
        status: "callback_success",
        createdAt: isoDaysAgo(40, 10),
        updatedAt: isoDaysAgo(38, 14)
      }
    }
  ];
}

function createSeedQuotes(): FallbackQuoteRecord[] {
  const salesAdmin = fallbackAssignableAdminSeeds[0];

  return [
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
      fullName: "Mert Yilmaz",
      companyName: "Sakarya Residence",
      segment: "site_apartment",
      email: "mert@sakaryaresidence.com",
      phone: "05550010001",
      city: "Sakarya",
      district: "Serdivan",
      estimatedLocation: "Kapali otopark blok A",
      requestNotes: "20 araclik otopark icin ilk faz kurulum talebi.",
      status: "reviewing",
      assignedAdminId: salesAdmin.id,
      source: "website",
      createdAt: isoDaysAgo(2, 9),
      updatedAt: isoDaysAgo(1, 14),
      activities: [
        {
          id: randomUUID(),
          adminUserId: salesAdmin.id,
          adminName: salesAdmin.fullName,
          activityType: "assignment",
          note: "Talep satis ekibine atandi.",
          payload: null,
          createdAt: isoDaysAgo(2, 11)
        },
        {
          id: randomUUID(),
          adminUserId: salesAdmin.id,
          adminName: salesAdmin.fullName,
          activityType: "status_change",
          note: "Kesif planlamasi icin inceleme alindi.",
          payload: {
            fromStatus: "new",
            toStatus: "reviewing"
          },
          createdAt: isoDaysAgo(1, 14)
        }
      ]
    },
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
      fullName: "Irem Kaya",
      companyName: "Teknoloji Kampusu",
      segment: "business",
      email: "irem@kampus.com",
      phone: "05550010002",
      city: "Istanbul",
      district: "Maslak",
      estimatedLocation: "Acik ofis otoparki",
      requestNotes: "Calisan ve misafir kullanimi ayrilabilen sistem araniyor.",
      status: "proposal_sent",
      assignedAdminId: salesAdmin.id,
      source: "website",
      createdAt: isoDaysAgo(6, 10),
      updatedAt: isoDaysAgo(4, 16),
      activities: [
        {
          id: randomUUID(),
          adminUserId: salesAdmin.id,
          adminName: salesAdmin.fullName,
          activityType: "status_change",
          note: "On teklif PDF olarak iletildi.",
          payload: {
            fromStatus: "reviewing",
            toStatus: "proposal_sent"
          },
          createdAt: isoDaysAgo(4, 16)
        }
      ]
    },
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3",
      fullName: "Can Demir",
      companyName: "Sehir Lojistik",
      segment: "fleet",
      email: "can@lojistik.com",
      phone: "05550010003",
      city: "Kocaeli",
      district: "Gebze",
      estimatedLocation: "Filo sahasi",
      requestNotes: "Gece AC, gun ici hizli DC kombinasyonu planlaniyor.",
      status: "negotiation",
      assignedAdminId: null,
      source: "website",
      createdAt: isoDaysAgo(10, 9),
      updatedAt: isoDaysAgo(3, 15),
      activities: [
        {
          id: randomUUID(),
          adminUserId: salesAdmin.id,
          adminName: salesAdmin.fullName,
          activityType: "status_change",
          note: "Teknik sorular sonrasi muzakere asamasina gecti.",
          payload: {
            fromStatus: "proposal_sent",
            toStatus: "negotiation"
          },
          createdAt: isoDaysAgo(3, 15)
        }
      ]
    }
  ];
}

function createSeedCustomers(): FallbackCustomerRecord[] {
  return [
    { id: "cccccccc-cccc-4ccc-8ccc-ccccccccccc1", createdAt: isoDaysAgo(1, 9) },
    { id: "cccccccc-cccc-4ccc-8ccc-ccccccccccc2", createdAt: isoDaysAgo(2, 9) },
    { id: "cccccccc-cccc-4ccc-8ccc-ccccccccccc3", createdAt: isoDaysAgo(5, 9) },
    { id: "cccccccc-cccc-4ccc-8ccc-ccccccccccc4", createdAt: isoDaysAgo(6, 9) },
    { id: "cccccccc-cccc-4ccc-8ccc-ccccccccccc5", createdAt: isoDaysAgo(12, 9) }
  ];
}

function createSeedServiceLeads(): FallbackServiceLeadRecord[] {
  return [
    {
      id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd1",
      leadType: "Servis Talebi",
      status: "new",
      fullName: "Bora Kaplan",
      createdAt: isoDaysAgo(1, 8)
    },
    {
      id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd2",
      leadType: "Teknik Servis",
      status: "contacted",
      fullName: "Zeynep Ozturk",
      createdAt: isoDaysAgo(3, 10)
    },
    {
      id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd3",
      leadType: "Periyodik Bakim",
      status: "qualified",
      fullName: "Ali Cakir",
      createdAt: isoDaysAgo(6, 11)
    }
  ];
}

function createInitialStore(): FallbackStore {
  const products = createSeedProducts();

  return {
    version: STORE_VERSION,
    products,
    orders: createSeedOrders(products),
    quotes: createSeedQuotes(),
    customers: createSeedCustomers(),
    serviceLeads: createSeedServiceLeads()
  };
}

async function persistStore(store: FallbackStore) {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function readStore() {
  try {
    const content = await readFile(STORE_PATH, "utf8");
    const store = JSON.parse(content) as FallbackStore;

    if (store.version !== STORE_VERSION) {
      throw new Error("Fallback store surumu guncellendi.");
    }

    return store;
  } catch {
    const store = createInitialStore();
    await persistStore(store);
    return store;
  }
}

async function updateStore<T>(mutate: (store: FallbackStore) => T | Promise<T>) {
  const store = await readStore();
  const result = await mutate(store);
  await persistStore(store);
  return result;
}

function sortByUpdatedDesc<T extends { id: string; updatedAt: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const updatedAtDiff =
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();

    if (updatedAtDiff !== 0) {
      return updatedAtDiff;
    }

    return right.id.localeCompare(left.id);
  });
}

function applyCursor<T extends { id: string; updatedAt: string }>(
  items: T[],
  cursor?: string
) {
  const decodedCursor = decodeCursor(cursor);

  if (!decodedCursor) {
    return items;
  }

  return items.filter((item) => {
    const itemTime = new Date(item.updatedAt).getTime();
    const cursorTime = new Date(decodedCursor.updatedAt).getTime();

    if (itemTime !== cursorTime) {
      return itemTime < cursorTime;
    }

    return item.id.localeCompare(decodedCursor.id) < 0;
  });
}

function buildPageResult<T extends { id: string; updatedAt: string }>(
  items: T[],
  limit: number
) {
  const hasMore = items.length > limit;
  const pageItems = hasMore ? items.slice(0, limit) : items;

  return {
    items: pageItems,
    nextCursor: hasMore
      ? encodeCursor({
          updatedAt: pageItems.at(-1)?.updatedAt ?? nowIso(),
          id: pageItems.at(-1)?.id ?? ""
        })
      : null
  };
}

function hydrateProduct(record: FallbackProductRecord) {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    discountEndsAt: record.discountEndsAt ? new Date(record.discountEndsAt) : null,
    defaultVariant: {
      ...record.defaultVariant,
      createdAt: new Date(record.defaultVariant.createdAt)
    }
  };
}

function hydrateOrder(record: FallbackOrderRecord) {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    paytrLastSyncedAt: record.paytrLastSyncedAt
      ? new Date(record.paytrLastSyncedAt)
      : null,
    history: record.history.map((item) => ({
      ...item,
      adminName: getAdminName(item.adminUserId, item.adminName),
      createdAt: new Date(item.createdAt)
    })),
    transaction: record.transaction
      ? {
          ...record.transaction,
          createdAt: new Date(record.transaction.createdAt),
          updatedAt: new Date(record.transaction.updatedAt)
        }
      : null
  };
}

function hydrateQuote(record: FallbackQuoteRecord) {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    assignedAdminName: getAdminName(record.assignedAdminId),
    activities: record.activities.map((item) => ({
      ...item,
      adminName: getAdminName(item.adminUserId, item.adminName),
      createdAt: new Date(item.createdAt)
    }))
  };
}

function normalizeProductRecord(
  input: ProductInput,
  existing?: FallbackProductRecord
): FallbackProductRecord {
  const timestamp = nowIso();
  const id = input.id ?? existing?.id ?? randomUUID();
  const slug = slugify(input.slug || input.name);
  const primaryMedia =
    input.media.find((item) => item.isPrimary) ?? input.media.at(0) ?? null;

  const media = input.media.map((item, index) => ({
    id: item.id ?? randomUUID(),
    url: item.url,
    altText: item.altText,
    isPrimary: primaryMedia ? primaryMedia.url === item.url : index === 0
  }));

  return {
    id,
    name: input.name,
    slug,
    status: input.status,
    categoryId: null,
    brandId: null,
    shortDescription: input.shortDescription,
    description: input.description,
    useCase: input.useCase || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    ogImageUrl: input.ogImageUrl || null,
    aiSummary: input.aiSummary || null,
    schemaJsonLd: existing?.schemaJsonLd ?? null,
    defaultPriceKurus: input.priceKurus,
    discountedPriceKurus: input.discountedPriceKurus ?? null,
    discountEndsAt: input.discountEndsAt ? new Date(input.discountEndsAt).toISOString() : null,
    isVatIncluded: input.isVatIncluded,
    minimumStockThreshold: input.minimumStockThreshold,
    inventoryTrackingEnabled: input.inventoryTrackingEnabled,
    powerKw: input.powerKw || null,
    chargeType: input.chargeType ?? null,
    connectorType: input.connectorType || null,
    phaseType: input.phaseType ?? null,
    ipClass: input.ipClass || null,
    hasWifi: input.hasWifi,
    hasRfid: input.hasRfid,
    has4g: input.has4g,
    installRequired: input.installRequired,
    adminNotes: input.adminNotes || null,
    searchKeywords: input.searchKeywords ?? [],
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    defaultVariant: {
      id: existing?.defaultVariant.id ?? randomUUID(),
      sku: input.sku,
      title: input.variantTitle,
      powerLabel: input.powerLabel || null,
      cableLength: input.cableLength || null,
      connectorType: input.connectorType || null,
      stockQuantity: input.stockQuantity,
      priceKurus: input.priceKurus,
      compareAtKurus: input.compareAtKurus ?? null,
      isDefault: true,
      createdAt: existing?.defaultVariant.createdAt ?? timestamp
    },
    media,
    specs: input.specs.map((item) => ({
      id: item.id ?? randomUUID(),
      groupName: item.groupName,
      label: item.label,
      value: item.value
    })),
    tags: input.tags ?? [],
    categories: input.categories,
    vehicles: input.vehicleBrands ?? [],
    relatedProductIds: input.relatedProductIds ?? [],
    accessoryProductIds: input.accessoryProductIds ?? []
  };
}

function matchesText(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query.toLowerCase()) ?? false;
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

function listLast12Months() {
  const months: string[] = [];
  const now = new Date();

  for (let index = 11; index >= 0; index -= 1) {
    const value = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push(value.toISOString().slice(0, 7));
  }

  return months;
}

export async function listFallbackAdminProducts(input: ListQueryInput) {
  const store = await readStore();
  let items = sortByUpdatedDesc(store.products);

  if (input.q) {
    const query = input.q;
    items = items.filter(
      (item) =>
        matchesText(item.name, query) ||
        matchesText(item.slug, query) ||
        matchesText(item.defaultVariant.sku, query)
    );
  }

  if (input.status && ["draft", "active", "archived"].includes(input.status)) {
    items = items.filter((item) => item.status === input.status);
  }

  items = applyCursor(items, input.cursor);
  const result = buildPageResult(items, input.limit);

  return {
    items: result.items.map(hydrateProduct),
    nextCursor: result.nextCursor
  };
}

export async function getFallbackAdminProductById(id: string) {
  const store = await readStore();
  const product = store.products.find((item) => item.id === id);
  return product ? hydrateProduct(product) : null;
}

export async function upsertFallbackAdminProduct(input: ProductInput) {
  return updateStore(async (store) => {
    const existingIndex = store.products.findIndex((item) => item.id === input.id);
    const existing = existingIndex >= 0 ? store.products[existingIndex] : undefined;
    const record = normalizeProductRecord(input, existing);

    if (existingIndex >= 0) {
      store.products[existingIndex] = record;
    } else {
      store.products.push(record);
    }

    return hydrateProduct(record);
  });
}

export async function getFallbackProductLookupOptions() {
  const store = await readStore();

  return [...store.products]
    .sort((left, right) => left.name.localeCompare(right.name, "tr"))
    .map((item) => ({
      id: item.id,
      name: item.name
    }));
}

export async function listFallbackAdminOrders(input: ListQueryInput) {
  const store = await readStore();
  let items = sortByUpdatedDesc(store.orders);

  if (input.q) {
    const query = input.q;
    items = items.filter(
      (item) =>
        matchesText(item.orderNumber, query) ||
        matchesText(item.customerName, query) ||
        matchesText(item.customerEmail, query)
    );
  }

  if (input.status) {
    items = items.filter((item) => item.status === input.status);
  }

  items = applyCursor(items, input.cursor);
  const result = buildPageResult(items, input.limit);

  return {
    items: result.items.map(hydrateOrder),
    nextCursor: result.nextCursor
  };
}

export async function getFallbackAdminOrderById(id: string) {
  const store = await readStore();
  const order = store.orders.find((item) => item.id === id);
  return order ? hydrateOrder(order) : null;
}

export async function updateFallbackAdminOrder(
  id: string,
  input: OrderUpdateInput,
  actor: AdminSessionPayload | null
) {
  return updateStore(async (store) => {
    const index = store.orders.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    const order = store.orders[index];
    const timestamp = nowIso();
    const previousStatus = order.status;

    order.status = input.status;
    order.statusNote = input.note || null;
    order.shippingCarrier = input.shippingCarrier || null;
    order.trackingNumber = input.trackingNumber || null;
    order.trackingUrl = input.trackingUrl || null;
    order.updatedAt = timestamp;

    if (input.status === "cancelled" || input.status === "failed") {
      order.paymentStatus = "failed";
    } else if (revenueStatuses.includes(input.status)) {
      order.paymentStatus = "paid";
    }

    order.history.unshift({
      id: randomUUID(),
      adminUserId: actor?.sub ?? null,
      adminName: actor?.name ?? null,
      fromStatus: previousStatus,
      toStatus: input.status,
      note: input.note || null,
      createdAt: timestamp
    });

    if (order.transaction) {
      order.transaction.updatedAt = timestamp;
      order.transaction.status =
        input.status === "cancelled" || input.status === "failed"
          ? "callback_failed"
          : "callback_success";
    }

    return hydrateOrder(order);
  });
}

export async function listFallbackAdminQuotes(input: ListQueryInput) {
  const store = await readStore();
  let items = sortByUpdatedDesc(store.quotes);

  if (input.q) {
    const query = input.q;
    items = items.filter(
      (item) =>
        matchesText(item.fullName, query) ||
        matchesText(item.companyName, query) ||
        matchesText(item.phone, query)
    );
  }

  if (input.status) {
    items = items.filter((item) => item.status === input.status);
  }

  items = applyCursor(items, input.cursor);
  const result = buildPageResult(items, input.limit);

  return {
    items: result.items.map(hydrateQuote),
    nextCursor: result.nextCursor
  };
}

export async function getFallbackAdminQuoteById(id: string) {
  const store = await readStore();
  const quote = store.quotes.find((item) => item.id === id);
  return quote ? hydrateQuote(quote) : null;
}

export async function updateFallbackAdminQuote(
  id: string,
  input: QuoteUpdateInput,
  actor: AdminSessionPayload | null
) {
  return updateStore(async (store) => {
    const index = store.quotes.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    const quote = store.quotes[index];
    const timestamp = nowIso();
    const previousStatus = quote.status;

    quote.status = input.status;
    quote.assignedAdminId = input.assignedAdminId ?? quote.assignedAdminId;
    quote.updatedAt = timestamp;
    quote.activities.unshift({
      id: randomUUID(),
      adminUserId: actor?.sub ?? null,
      adminName: actor?.name ?? null,
      activityType: "status_change",
      note: input.note || `${input.status} durumuna guncellendi.`,
      payload: {
        fromStatus: previousStatus,
        toStatus: input.status
      },
      createdAt: timestamp
    });

    return hydrateQuote(quote);
  });
}

export async function getFallbackAdminDashboardSnapshot() {
  const store = await readStore();
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthlyTargetKurus = Number(
    process.env.ADMIN_MONTHLY_REVENUE_TARGET_KURUS ?? "2500000"
  );

  const todayRevenue = store.orders
    .filter(
      (order) =>
        revenueStatuses.includes(order.status) &&
        new Date(order.createdAt).getTime() >= todayStart.getTime()
    )
    .reduce((total, order) => total + order.totalKurus, 0);

  const monthRevenue = store.orders
    .filter(
      (order) =>
        revenueStatuses.includes(order.status) &&
        new Date(order.createdAt).getTime() >= monthStart.getTime()
    )
    .reduce((total, order) => total + order.totalKurus, 0);

  const targetProgress =
    monthlyTargetKurus > 0 ? (monthRevenue / monthlyTargetKurus) * 100 : 0;

  const revenueTrendTotals = new Map<string, number>();

  for (const month of listLast12Months()) {
    revenueTrendTotals.set(month, 0);
  }

  for (const order of store.orders) {
    if (!revenueStatuses.includes(order.status)) {
      continue;
    }

    const month = order.createdAt.slice(0, 7);
    revenueTrendTotals.set(month, (revenueTrendTotals.get(month) ?? 0) + order.totalKurus);
  }

  const quoteDistribution = quoteStatusOptions.map((option) => ({
    status: option.value,
    total: store.quotes.filter((quote) => quote.status === option.value).length
  }));

  const orderDistribution = orderStatusOptions
    .map((option) => ({
      status: option.value,
      total: store.orders.filter((order) => order.status === option.value).length
    }))
    .filter((item) => item.total > 0);

  return {
    kpis: {
      todayRevenue,
      monthRevenue,
      targetProgress,
      pendingOrders: store.orders.filter((order) =>
        pendingOrderStatuses.includes(order.status)
      ).length,
      pendingQuotes: store.quotes.filter(
        (quote) => !closedQuoteStatuses.includes(quote.status)
      ).length,
      openServiceRequests: store.serviceLeads.filter(
        (lead) =>
          lead.leadType.toLowerCase().includes("servis") &&
          ["new", "contacted", "qualified"].includes(lead.status)
      ).length,
      completedInstallations: store.orders.filter(
        (order) =>
          ["delivered", "fulfilled"].includes(order.status) &&
          new Date(order.updatedAt).getTime() >= weekStart.getTime()
      ).length,
      newCustomers: store.customers.filter(
        (customer) => new Date(customer.createdAt).getTime() >= sevenDaysAgo.getTime()
      ).length
    },
    charts: {
      revenueTrend: Array.from(revenueTrendTotals.entries()).map(([month, total]) => ({
        month,
        total
      })),
      quoteDistribution,
      orderDistribution
    },
    activity: {
      recentOrders: sortByUpdatedDesc(store.orders)
        .slice(0, 10)
        .map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalKurus: order.totalKurus,
          status: order.status,
          updatedAt: new Date(order.updatedAt)
        })),
      recentQuotes: sortByUpdatedDesc(store.quotes)
        .slice(0, 5)
        .map((quote) => ({
          id: quote.id,
          fullName: quote.fullName,
          companyName: quote.companyName,
          status: quote.status,
          updatedAt: new Date(quote.updatedAt)
        })),
      recentServiceRequests: [...store.serviceLeads]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        )
        .slice(0, 3)
        .map((lead) => ({
          id: lead.id,
          fullName: lead.fullName,
          leadType: lead.leadType,
          status: lead.status,
          createdAt: new Date(lead.createdAt)
        }))
    }
  };
}
