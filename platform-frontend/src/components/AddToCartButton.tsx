"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface Product {
  _id: string;
  model: string;
  brand: string;
  price: number;
  discount: number;
  images: string[];
  sizes: { size: string; stock: number }[];
  stock: number;
}

export function AddToCartButton({
  product,
  accentColor,
}: {
  product: Product;
  accentColor?: string;
}) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    const finalPrice =
      product.discount > 0
        ? product.price - product.price * (product.discount / 100)
        : product.price;
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
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        handleAddToCart();
      }}
      className="mt-3 w-full py-2 rounded-lg font-semibold text-sm text-white transition-transform hover:scale-105 flex items-center justify-center"
      style={{ backgroundColor: accentColor || "#f97316" }}
    >
      <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
    </button>
  );
}
