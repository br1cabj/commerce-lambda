"use client";

import { useCartStore } from "@/stores/cartStore";
import type { CartItem } from "@/stores/cartStore";
import { useCallback, useSyncExternalStore } from "react";
import toast from "react-hot-toast";

const emptySubscribe = () => () => {};

function useIsHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function useCart() {
  const isHydrated = useIsHydrated();
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const totalItems = isHydrated
    ? items.reduce((acc, item) => acc + item.quantity, 0)
    : 0;
  const totalAmount = isHydrated
    ? items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : 0;

  const addItemWithToast = useCallback(
    (item: CartItem) => {
      addItem(item);
      toast.success(`${item.model} agregado al carrito!`, { icon: "🛒" });
    },
    [addItem],
  );

  const removeItemWithToast = useCallback(
    (index: number) => {
      removeItem(index);
      toast.error("Producto eliminado del carrito", { icon: "🗑️" });
    },
    [removeItem],
  );

  const clearCartWithToast = useCallback(() => {
    clearCart();
  }, [clearCart]);

  return {
    items: isHydrated ? items : [],
    addItem: addItemWithToast,
    removeItem: removeItemWithToast,
    updateQuantity,
    clearCart: clearCartWithToast,
    totalItems,
    totalAmount,
    isHydrated,
  };
}
