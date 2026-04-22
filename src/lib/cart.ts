import { products, type ProductModel } from "@/lib/mock-data";

export const CART_STORAGE_KEY = "parkchargeev-cart-v1";
export const CART_TAX_RATE = 0.2;

export type CartItem = {
  productId: string;
  quantity: number;
  cableOption: string;
};

export type EnrichedCartItem = CartItem & {
  product: ProductModel;
  lineTotalKurus: number;
};

function findProduct(productId: string) {
  return products.find((product) => product.id === productId);
}

export function normalizeCartItems(items: CartItem[]) {
  return items
    .map((item) => {
      const product = findProduct(item.productId);

      if (!product) {
        return null;
      }

      const quantity = Number.isFinite(item.quantity)
        ? Math.min(Math.max(Math.trunc(item.quantity), 1), 99)
        : 1;
      const cableOption = product.cableOptions.includes(item.cableOption)
        ? item.cableOption
        : product.cableOptions[0];

      return {
        productId: product.id,
        quantity,
        cableOption
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => item !== null);
}

export function enrichCartItems(items: CartItem[]) {
  return normalizeCartItems(items)
    .map((item) => {
      const product = findProduct(item.productId);

      if (!product) {
        return null;
      }

      return {
        ...item,
        product,
        lineTotalKurus: product.priceKurus * item.quantity
      } satisfies EnrichedCartItem;
    })
    .filter((item): item is EnrichedCartItem => item !== null);
}

export function getCartSubtotalKurus(items: CartItem[]) {
  return enrichCartItems(items).reduce((total, item) => total + item.lineTotalKurus, 0);
}

export function getCartTaxKurus(items: CartItem[]) {
  return Math.round(getCartSubtotalKurus(items) * CART_TAX_RATE);
}

export function getCartTotalKurus(items: CartItem[]) {
  return getCartSubtotalKurus(items) + getCartTaxKurus(items);
}

export function getCartTotalQuantity(items: CartItem[]) {
  return normalizeCartItems(items).reduce((total, item) => total + item.quantity, 0);
}

export function getCheckoutItems(items: CartItem[]) {
  return enrichCartItems(items).map((item) => ({
    title: `${item.product.name} - ${item.cableOption}`,
    unitPrice: (item.product.priceKurus / 100).toFixed(2),
    quantity: item.quantity
  }));
}
