"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useTranslations } from "@/hooks/useTranslations";
import type { Product } from "@/types";

export function AddToCartButton({
  product,
  accentColor,
}: {
  product: Product;
  accentColor?: string;
}) {
  const { addItem } = useCart();
  const { t, translations } = useTranslations();
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAddToCart = () => {
    const finalPrice = Math.round((
      product.discount > 0
        ? product.price - product.price * (product.discount / 100)
        : product.price
    ) * 100) / 100;
    const mainImg = product.images?.[0] || "";
    const size = product.sizes?.[0]?.size || "One Size";

    addItem({
      id: product._id,
      model: product.model,
      brand: product.brand,
      price: finalPrice,
      image: mainImg,
      quantity: 1,
      size,
      maxStock: product.stock,
    });

    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        handleAddToCart();
      }}
      className={`w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 ${
        added ? "scale-95" : "hover:scale-105 hover:shadow-lg"
      }`}
      style={{ backgroundColor: added ? "#10b981" : accentColor || "#f97316" }}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          {t(translations?.common?.added) || "Added!"}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {t(translations?.common?.addToCart) || "Add to Cart"}
        </>
      )}
    </button>
  );
}
