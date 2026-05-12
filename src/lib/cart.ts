import { products, type ProductModel } from "@/lib/mock-data";
import {
  CART_STORAGE_KEY,
  CART_TAX_RATE,
  type CartItem,
  getCartTotalQuantity,
  normalizeCartQuantity,
  normalizeStoredCartItems
} from "@/lib/cart-core";

export { CART_STORAGE_KEY, CART_TAX_RATE, getCartTotalQuantity };
export type { CartItem };

export type EnrichedCartItem = CartItem & {
  product: ProductModel;
  lineTotalKurus: number;
};

function findProduct(productId: string) {
  return products.find((product) => product.id === productId);
}

export function normalizeCartItems(items: CartItem[]) {
  return normalizeStoredCartItems(items)
    .map((item) => {
      const product = findProduct(item.productId);

      if (!product) {
        return null;
      }

      const quantity = normalizeCartQuantity(item.quantity);
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

export function getEnrichedCartSubtotalKurus(items: EnrichedCartItem[]) {
  return items.reduce((total, item) => total + item.lineTotalKurus, 0);
}

export function getEnrichedCartTaxKurus(items: EnrichedCartItem[]) {
  return Math.round(getEnrichedCartSubtotalKurus(items) * CART_TAX_RATE);
}

export function getEnrichedCartTotalKurus(items: EnrichedCartItem[]) {
  return getEnrichedCartSubtotalKurus(items) + getEnrichedCartTaxKurus(items);
}

export function getCartSubtotalKurus(items: CartItem[]) {
  return getEnrichedCartSubtotalKurus(enrichCartItems(items));
}

export function getCartTaxKurus(items: CartItem[]) {
  return getEnrichedCartTaxKurus(enrichCartItems(items));
}

export function getCartTotalKurus(items: CartItem[]) {
  return getEnrichedCartTotalKurus(enrichCartItems(items));
}

export function getCheckoutItems(items: CartItem[]) {
  return enrichCartItems(items).map((item) => ({
    title: `${item.product.name} - ${item.cableOption}`,
    unitPrice: (item.product.priceKurus / 100).toFixed(2),
    quantity: item.quantity
  }));
}
