"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/providers/ToastProvider";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  availableStock?: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getStockLimit(stock: number | undefined): number | null {
  return typeof stock === "number" && Number.isFinite(stock)
    ? Math.max(0, Math.floor(stock))
    : null;
}

function clampQuantity(quantity: number, stock: number | undefined): number {
  const normalized = Math.max(0, Math.floor(Number(quantity) || 0));
  const limit = getStockLimit(stock);
  return limit === null ? normalized : Math.min(normalized, limit);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("deroma_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(
            parsedCart
              .map((item) => ({
                ...item,
                quantity: clampQuantity(item.quantity, item.availableStock),
              }))
              .filter((item) => item.quantity > 0),
          );
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("deroma_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart, isInitialized]);

  const addItem = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const requestedQuantity = Math.max(1, Math.floor(Number(newItem.quantity) || 1));
    const existingItem = cart.find((item) => item.variantId === newItem.variantId);
    const stockLimit = newItem.availableStock ?? existingItem?.availableStock;
    const currentQuantity = existingItem?.quantity ?? 0;
    const nextQuantity = clampQuantity(currentQuantity + requestedQuantity, stockLimit);
    const addedQuantity = nextQuantity - currentQuantity;

    if (addedQuantity <= 0) {
      toast.info("This size has no more units available.", "SHOPPING BAG");
      return;
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.variantId === newItem.variantId,
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const item = updatedCart[existingItemIndex];
        const limit = newItem.availableStock ?? item.availableStock;
        updatedCart[existingItemIndex] = {
          ...item,
          ...newItem,
          quantity: clampQuantity(item.quantity + requestedQuantity, limit),
          availableStock: limit,
        };
        return updatedCart;
      }

      return [...prevCart, { ...newItem, quantity: nextQuantity }];
    });
    trackAddToCart({ ...newItem, quantity: addedQuantity });
    toast.success(`${newItem.name} (${newItem.size}) added to your bag!`, "SHOPPING BAG");
    setCartOpen(true); // Open cart automatically when item is added
  };

  const removeItem = (variantId: string) => {
    const targetItem = cart.find((i) => i.variantId === variantId);
    setCart((prevCart) => prevCart.filter((item) => item.variantId !== variantId));
    if (targetItem) {
      trackRemoveFromCart(targetItem);
      toast.info(`${targetItem.name} removed from your bag.`, "SHOPPING BAG");
    }
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    const targetItem = cart.find((i) => i.variantId === variantId);
    const boundedQuantity = clampQuantity(quantity, targetItem?.availableStock);

    if (boundedQuantity <= 0) {
      removeItem(variantId);
      return;
    }

    if (targetItem) {
      const delta = boundedQuantity - targetItem.quantity;
      if (delta > 0) {
        trackAddToCart({ ...targetItem, quantity: delta });
      } else if (delta < 0) {
        trackRemoveFromCart({ ...targetItem, quantity: Math.abs(delta) });
      }
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: clampQuantity(boundedQuantity, item.availableStock) }
          : item,
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
