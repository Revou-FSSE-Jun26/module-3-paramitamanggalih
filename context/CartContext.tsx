"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartProductInput {
  id: number;
  name: string;
  price: number;
  image?: string;
  stock?: number;
}

export interface CartItem extends CartProductInput {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isLoaded: boolean;
  cartCount: number;
  cartTotal: number;
  addItem: (product: CartProductInput) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "revoshop_cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function isValidCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "number" &&
    Number.isFinite(item.id) &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);

      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setItems(parsed.filter(isValidCartItem));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      console.error("Could not save the RevoShop cart.");
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: CartProductInput) => {
    if (
      !Number.isFinite(product.id) ||
      !product.name.trim() ||
      !Number.isFinite(product.price) ||
      product.price < 0
    ) {
      return;
    }

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id);

      if (existing) {
        if (
          typeof existing.stock === "number" &&
          existing.quantity >= existing.stock
        ) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (typeof product.stock === "number" && product.stock < 1) {
        return currentItems;
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) return item;

        const limitedQuantity =
          typeof item.stock === "number"
            ? Math.min(quantity, item.stock)
            : quantity;

        return { ...item, quantity: limitedQuantity };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const cartTotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isLoaded,
      cartCount,
      cartTotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      isLoaded,
      cartCount,
      cartTotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
