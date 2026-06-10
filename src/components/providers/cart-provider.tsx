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

const CartContext = createContext<CartContextValue | null>(null);

function persistCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeStoredCartItems(items)));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (rawCart) {
        setItems(normalizeStoredCartItems(JSON.parse(rawCart)));
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

    persistCartItems(items);
  }, [isHydrated, items]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CART_STORAGE_KEY) {
        return;
      }

      try {
        setItems(normalizeStoredCartItems(event.newValue ? JSON.parse(event.newValue) : []));
      } catch {
        setItems([]);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const totalQuantity = getCartTotalQuantity(items);

  function addItem(nextItem: CartItem) {
    setItems((currentItems) => {
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
        const nextItems = normalizeStoredCartItems([...currentItems, normalizedNextItem]);
        persistCartItems(nextItems);
        return nextItems;
      }

      const nextItems = normalizeStoredCartItems(
        currentItems.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + normalizedNextItem.quantity
              }
            : item
        )
      );
      persistCartItems(nextItems);
      return nextItems;
    });
  }

  function updateQuantity(productId: string, cableOption: string, quantity: number) {
    setItems((currentItems) => {
      const nextItems = normalizeStoredCartItems(
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
      persistCartItems(nextItems);
      return nextItems;
    });
  }

  function removeItem(productId: string, cableOption: string) {
    setItems((currentItems) => {
      const nextItems = currentItems.filter(
        (item) => item.productId !== productId || item.cableOption !== cableOption
      );
      persistCartItems(nextItems);
      return nextItems;
    });
  }

  function clearCart() {
    persistCartItems([]);
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        totalQuantity,
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
    throw new Error("useCart sadece CartProvider içinde kullanılabilir.");
  }

  return context;
}
