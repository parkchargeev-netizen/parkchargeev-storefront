"use client";

import {
  type ReactNode,
  useEffect,
  useMemo,
  useSyncExternalStore
} from "react";

import {
  CART_STORAGE_KEY,
  type CartItem,
  getCartTotalQuantity,
  normalizeStoredCartItems
} from "@/lib/cart-core";

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  totalQuantity: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, cableOption: string, quantity: number) => void;
  removeItem: (productId: string, cableOption: string) => void;
  clearCart: () => void;
};

type CartSnapshot = {
  items: CartItem[];
  isHydrated: boolean;
};

const serverSnapshot: CartSnapshot = {
  items: [],
  isHydrated: false
};

let cartSnapshot: CartSnapshot = serverSnapshot;
let hasInitializedBrowserStore = false;
const cartListeners = new Set<() => void>();

function notifyCartListeners() {
  cartListeners.forEach((listener) => {
    listener();
  });
}

function setCartSnapshot(nextSnapshot: CartSnapshot) {
  cartSnapshot = nextSnapshot;
  notifyCartListeners();
}

function readStoredCartItems() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    return rawCart ? normalizeStoredCartItems(JSON.parse(rawCart)) : [];
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

function persistCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeStoredCartItems(items)));
}

function syncCartFromStorageEvent(event: StorageEvent) {
  if (event.key !== CART_STORAGE_KEY) {
    return;
  }

  try {
    setCartSnapshot({
      items: normalizeStoredCartItems(event.newValue ? JSON.parse(event.newValue) : []),
      isHydrated: true
    });
  } catch {
    setCartSnapshot({
      items: [],
      isHydrated: true
    });
  }
}

function hydrateCartStore() {
  if (typeof window === "undefined" || hasInitializedBrowserStore) {
    return;
  }

  hasInitializedBrowserStore = true;
  setCartSnapshot({
    items: readStoredCartItems(),
    isHydrated: true
  });
  window.addEventListener("storage", syncCartFromStorageEvent);
}

function subscribeCartStore(listener: () => void) {
  cartListeners.add(listener);
  hydrateCartStore();

  return () => {
    cartListeners.delete(listener);
  };
}

function getCartSnapshot() {
  return cartSnapshot;
}

function getServerCartSnapshot() {
  return serverSnapshot;
}

function updateCartItems(updater: (items: CartItem[]) => CartItem[]) {
  hydrateCartStore();

  const nextItems = normalizeStoredCartItems(updater(cartSnapshot.items));
  persistCartItems(nextItems);
  setCartSnapshot({
    items: nextItems,
    isHydrated: true
  });
}

function addItem(nextItem: CartItem) {
  updateCartItems((currentItems) => {
    const normalizedNextItem = normalizeStoredCartItems([nextItem])[0];

    if (!normalizedNextItem) {
      return currentItems;
    }

    const existingIndex = currentItems.findIndex(
      (item) =>
        item.productId === normalizedNextItem.productId &&
        item.cableOption === normalizedNextItem.cableOption
    );

    if (existingIndex === -1) {
      return [...currentItems, normalizedNextItem];
    }

    return currentItems.map((item, index) =>
      index === existingIndex
        ? {
            ...item,
            quantity: item.quantity + normalizedNextItem.quantity
          }
        : item
    );
  });
}

function updateQuantity(productId: string, cableOption: string, quantity: number) {
  updateCartItems((currentItems) =>
    currentItems.reduce<CartItem[]>((nextItems, item) => {
      if (item.productId !== productId || item.cableOption !== cableOption) {
        nextItems.push(item);
        return nextItems;
      }

      if (quantity > 0) {
        nextItems.push({
          ...item,
          quantity
        });
      }

      return nextItems;
    }, [])
  );
}

function removeItem(productId: string, cableOption: string) {
  updateCartItems((currentItems) =>
    currentItems.filter(
      (item) => item.productId !== productId || item.cableOption !== cableOption
    )
  );
}

function clearCart() {
  persistCartItems([]);
  setCartSnapshot({
    items: [],
    isHydrated: true
  });
}

const cartActions = {
  addItem,
  updateQuantity,
  removeItem,
  clearCart
} satisfies Pick<
  CartContextValue,
  "addItem" | "updateQuantity" | "removeItem" | "clearCart"
>;

export function CartProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useCart() {
  const snapshot = useSyncExternalStore(
    subscribeCartStore,
    getCartSnapshot,
    getServerCartSnapshot
  );
  const totalQuantity = getCartTotalQuantity(snapshot.items);

  useEffect(() => {
    hydrateCartStore();
  }, []);

  return useMemo<CartContextValue>(
    () => ({
      items: snapshot.items,
      isHydrated: snapshot.isHydrated,
      totalQuantity,
      ...cartActions
    }),
    [snapshot.isHydrated, snapshot.items, totalQuantity]
  );
}
