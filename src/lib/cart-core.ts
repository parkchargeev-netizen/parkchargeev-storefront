import type { ProductModel } from "@/lib/mock-data";

export const CART_STORAGE_KEY = "parkchargeev-cart-v1";
export const CART_TAX_RATE = 0.2;

export type CartItem = {
  productId: string;
  quantity: number;
  cableOption: string;
  productSnapshot?: ProductModel;
};

export function normalizeCartQuantity(quantity: unknown) {
  const numericQuantity = Number(quantity);

  return Number.isFinite(numericQuantity)
    ? Math.min(Math.max(Math.trunc(numericQuantity), 1), 99)
    : 1;
}

export function normalizeStoredCartItems(items: unknown) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Partial<CartItem>;
      const productId = typeof candidate.productId === "string" ? candidate.productId : "";
      const cableOption =
        typeof candidate.cableOption === "string" ? candidate.cableOption : "";

      if (!productId || !cableOption) {
        return null;
      }

      const productSnapshot =
        candidate.productSnapshot && typeof candidate.productSnapshot === "object"
          ? candidate.productSnapshot
          : undefined;

      return {
        productId,
        cableOption,
        quantity: normalizeCartQuantity(candidate.quantity),
        ...(productSnapshot ? { productSnapshot } : {})
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => item !== null);
}

export function getCartTotalQuantity(items: CartItem[]) {
  return normalizeStoredCartItems(items).reduce((total, item) => total + item.quantity, 0);
}
