import type { ProductModel } from "@/lib/mock-data";

export type ProductCommerceBadge = {
  label: string;
  tone: "success" | "primary";
};

const productCommerceBadgeMap = {
  free_shipping: {
    label: "Kargo bedava",
    tone: "success"
  },
  ships_tomorrow: {
    label: "Yarın kargoda",
    tone: "primary"
  }
} satisfies Record<string, ProductCommerceBadge>;

export function getProductCommerceBadges(product: Pick<ProductModel, "tags">) {
  const tags = new Set(product.tags ?? []);

  return Object.entries(productCommerceBadgeMap)
    .filter(([tag]) => tags.has(tag))
    .map(([, badge]) => badge);
}
