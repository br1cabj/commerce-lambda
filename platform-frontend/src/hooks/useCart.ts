"use client";

import { useCartStore } from "@/stores/cartStore";
import { useMemo } from "react";

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount } = useCartStore();

  const computed = useMemo(() => ({
    totalItems: totalItems(),
    totalAmount: totalAmount(),
  }), [items, totalItems, totalAmount]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    ...computed,
  };
}
