"use client";

import { useCartStore } from "@/stores/cartStore";
import { useMemo, useState, useEffect } from "react";

export function useCart() {
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const computed = useMemo(
    () => ({
      totalItems: isHydrated ? store.totalItems() : 0,
      totalAmount: isHydrated ? store.totalAmount() : 0,
    }),
    [store, isHydrated],
  );

  return {
    items: isHydrated ? store.items : [],
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    ...computed,
    isHydrated,
  };
}
