import type { ProductModel } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";

export const evChargingSeoKeywords = [
  "elektrikli araç şarj cihazı",
  "elektrikli araç şarj aleti",
  "elektrikli araç şarj cihazı fiyatları",
  "ev tipi elektrikli araç şarj cihazı",
  "EV şarj cihazı",
  "wallbox",
  "Type 2 şarj cihazı",
  "22 kW şarj cihazı",
  "11 kW şarj cihazı",
  "7.4 kW şarj cihazı",
  "elektrikli araç şarj istasyonu",
  "şarj cihazı kurulumu",
  "Sakarya elektrikli araç şarj cihazı",
  "Kocaeli elektrikli araç şarj cihazı",
  "ParkChargeEV"
];

export function uniqueSeoKeywords(keywords: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      keywords
        .map((keyword) => keyword?.trim())
        .filter((keyword): keyword is string => Boolean(keyword))
    )
  );
}

export function getEvSeoKeywords(extraKeywords: Array<string | undefined | null> = []) {
  return uniqueSeoKeywords([...evChargingSeoKeywords, ...extraKeywords]);
}

export function cleanMetaDescription(
  value?: string | null,
  fallback = siteConfig.description,
  maxLength = 158
) {
  const normalized = (value || fallback).replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const slice = normalized.slice(0, maxLength - 1);
  const lastSafeBreak = Math.max(
    slice.lastIndexOf("."),
    slice.lastIndexOf(","),
    slice.lastIndexOf(";"),
    slice.lastIndexOf(" ")
  );
  const safeSlice = lastSafeBreak > 110 ? slice.slice(0, lastSafeBreak) : slice;

  return `${safeSlice.trim()}…`;
}

export function getProductSeoTitle(product: ProductModel) {
  const titleParts = [product.name];

  if (product.powerLabel && !product.name.toLocaleLowerCase("tr-TR").includes(product.powerLabel.toLocaleLowerCase("tr-TR"))) {
    titleParts.push(product.powerLabel);
  }

  return `${titleParts.join(" ")} | ${siteConfig.name}`;
}

export function getProductSeoDescription(product: ProductModel) {
  return cleanMetaDescription(
    `${product.name}: ${product.powerLabel}, ${product.category}. ${product.summary} Fiyat, stok, teknik özellik ve kurulum desteğini inceleyin.`
  );
}

export function getProductSeoKeywords(product: ProductModel) {
  return getEvSeoKeywords([
    product.name,
    product.category,
    product.powerLabel,
    product.badge,
    ...(product.tags ?? []),
    ...product.seoIntent,
    ...product.specs.flatMap((spec) => [spec.label, spec.value]),
    ...product.useCases
  ]);
}
