"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantOptionId?: string;
  name: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  slug: string;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantOptionId?: string) => void;
  updateQuantity: (productId: string, variantOptionId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  itemCount: () => number;
  subtotal: () => number;
  total: (shippingCost: number) => number;
}

function isSameItem(
  a: CartItem,
  productId: string,
  variantOptionId?: string,
): boolean {
  return a.productId === productId && a.variantOptionId === variantOptionId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) =>
            isSameItem(i, item.productId, item.variantOptionId),
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                isSameItem(i, item.productId, item.variantOptionId)
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + (item.quantity ?? 1),
                        i.maxStock,
                      ),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(item.quantity ?? 1, item.maxStock) },
            ],
          };
        });
      },

      removeItem: (productId, variantOptionId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !isSameItem(i, productId, variantOptionId),
          ),
        }));
      },

      updateQuantity: (productId, variantOptionId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, variantOptionId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            isSameItem(i, productId, variantOptionId)
              ? { ...i, quantity: Math.min(quantity, i.maxStock) }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      total: (shippingCost) =>
        Math.max(0, get().subtotal() - get().couponDiscount + shippingCost),
    }),
    {
      name: "cart-storage",
      version: 1,
    },
  ),
);
