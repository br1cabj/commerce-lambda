"use client";

import { useCartStore } from "@/stores/cartStore";

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount } = useCartStore();

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems: totalItems(),
    totalAmount: totalAmount(),
  };
}
