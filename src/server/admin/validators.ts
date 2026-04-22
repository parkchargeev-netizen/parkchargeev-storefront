import { z } from "zod";

import {
  orderStatusEnum,
  productChargeTypeEnum,
  productPhaseEnum,
  productStatusEnum,
  quoteRequestStatusEnum
} from "@/server/db/schema";

const positiveCurrencySchema = z.coerce.number().int().min(0);

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export const productSpecSchema = z.object({
  id: z.string().optional(),
  groupName: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(255)
});

export const productMediaSchema = z.object({
  id: z.string().optional(),
  url: z.string().trim().url(),
  altText: z.string().trim().min(2).max(255),
  isPrimary: z.boolean().default(false)
});

export const adminProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(220),
  status: z.enum(productStatusEnum.enumValues),
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
  hasRfid: z.boolean().default(false),
  has4g: z.boolean().default(false),
  installRequired: z.boolean().default(false),
  categories: z.array(z.string().trim().min(1)).min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
  vehicleBrands: z.array(z.string().trim().min(1)).default([]),
  relatedProductIds: z.array(z.string().uuid()).default([]),
  accessoryProductIds: z.array(z.string().uuid()).default([]),
  media: z.array(productMediaSchema).default([]),
  specs: z.array(productSpecSchema).default([]),
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
  limit: z.coerce.number().int().min(1).max(50).default(12)
});
