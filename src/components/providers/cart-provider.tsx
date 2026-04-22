"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

import {
  CART_STORAGE_KEY,
  type CartItem,
  enrichCartItems,
  getCartSubtotalKurus,
  getCartTaxKurus,
  getCartTotalKurus,
  getCartTotalQuantity,
  normalizeCartItems
} from "@/lib/cart";

type CartContextValue = {
  items: ReturnType<typeof enrichCartItems>;
  isHydrated: boolean;
  totalQuantity: number;
  subtotalKurus: number;
  taxKurus: number;
  totalKurus: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, cableOption: string, quantity: number) => void;
  removeItem: (productId: string, cableOption: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (rawCart) {
        const parsed = JSON.parse(rawCart) as CartItem[];
        setItems(normalizeCartItems(parsed));
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isHydrated, items]);

  const enrichedItems = enrichCartItems(items);
  const totalQuantity = getCartTotalQuantity(items);
  const subtotalKurus = getCartSubtotalKurus(items);
  const taxKurus = getCartTaxKurus(items);
  const totalKurus = getCartTotalKurus(items);

  function addItem(nextItem: CartItem) {
    setItems((currentItems) => {
      const normalizedNextItem = normalizeCartItems([nextItem])[0];

      if (!normalizedNextItem) {
        return currentItems;
      }

      const existingIndex = currentItems.findIndex(
        (item) =>
          item.productId === normalizedNextItem.productId &&
          item.cableOption === normalizedNextItem.cableOption
      );

      if (existingIndex === -1) {
        return normalizeCartItems([...currentItems, normalizedNextItem]);
      }

      return normalizeCartItems(
        currentItems.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + normalizedNextItem.quantity
              }
            : item
        )
      );
    });
  }

  function updateQuantity(productId: string, cableOption: string, quantity: number) {
    setItems((currentItems) =>
      normalizeCartItems(
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
      )
    );
  }

  function removeItem(productId: string, cableOption: string) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.productId !== productId || item.cableOption !== cableOption
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items: enrichedItems,
        isHydrated,
        totalQuantity,
        subtotalKurus,
        taxKurus,
        totalKurus,
        addItem,
        updateQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart sadece CartProvider icinde kullanilabilir.");
  }

  return context;
}
