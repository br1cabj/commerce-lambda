import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  model: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, change: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.id === item.id &&
              i.size.toLowerCase() === item.size.toLowerCase(),
          );

          if (existingIndex !== -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            if (existing.quantity >= item.maxStock) return state;
            updatedItems[existingIndex] = {
              ...existing,
              quantity: existing.quantity + 1,
            };
            return { items: updatedItems };
          }

          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (index) =>
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        })),

      updateQuantity: (index, change) =>
        set((state) => {
          const updatedItems = [...state.items];
          const item = updatedItems[index];
          if (!item) return state;

          const newQuantity = item.quantity + change;
          if (newQuantity < 1) {
            return { items: state.items.filter((_, i) => i !== index) };
          }
          if (newQuantity > item.maxStock) return state;

          updatedItems[index] = { ...item, quantity: newQuantity };
          return { items: updatedItems };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),

      totalAmount: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    { name: "cart-storage" },
  ),
);
