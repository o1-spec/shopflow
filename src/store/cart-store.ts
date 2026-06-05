"use client";

import { create } from "zustand";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((x) => x.productId === item.productId);

      if (existing) {
        return {
          items: state.items.map((x) =>
            x.productId === item.productId
              ? { ...x, quantity: x.quantity + 1 }
              : x,
          ),
        };
      }

      return {
        items: [...state.items, { ...item, quantity: 1 }],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((x) => x.productId !== productId),
    })),

  clearCart: () => set({ items: [] }),
}));
