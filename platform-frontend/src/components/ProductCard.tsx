"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Heart, Eye } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import { useTranslations } from "@/hooks/useTranslations";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  accentColor: string;
}

export function ProductCard({ product, accentColor }: ProductCardProps) {
  const { t, translations } = useTranslations();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const finalPrice = useMemo(
    () =>
      product.discount > 0
        ? product.price - product.price * (product.discount / 100)
        : product.price,
    [product.discount, product.price],
  );
  const mainImg = product.images?.[0] || "";
  const totalStock = useMemo(
    () =>
      product.sizes?.reduce((acc, s) => acc + s.stock, 0) || product.stock,
    [product.sizes, product.stock],
  );
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const badges = [];
  if (product.isNew)
    badges.push({
      label: t(translations?.common?.new) || "New",
      color: "#3b82f6",
    });
  if (product.isBestSeller)
    badges.push({
      label: t(translations?.common?.bestSeller) || "Best Seller",
      color: "#f59e0b",
    });
  if (product.discount > 0)
    badges.push({ label: `-${product.discount}%`, color: "#ef4444" });

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-full">
      {/* Badges */}
      {badges.length > 0 && (
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          {badges.map((badge, i) => (
            <span
              key={i}
              className="text-white text-xs font-black px-3 py-1 rounded-full shadow-md tracking-wider"
              style={{ backgroundColor: badge.color }}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsWishlisted(!isWishlisted);
        }}
        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        aria-label="Add to wishlist"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
          }`}
        />
      </button>

      {/* Low Stock Indicator */}
      {isLowStock && (
        <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {(t(translations?.common?.onlyLeft) || "Only {count} left").replace(
            "{count}",
            String(totalStock),
          )}
        </div>
      )}

      {/* Image */}
      <Link
        href={`/product/${product.slug || product._id}`}
        className="block relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden"
      >
        {mainImg ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            <Image
              src={mainImg}
              alt={product.model}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}

              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="text-gray-300 text-sm font-medium">No Image</div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t(translations?.common?.quickView) || "Quick View"}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 bg-white border-t border-gray-50">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
          {product.brand}
        </p>
        <Link href={`/product/${product.slug || product._id}`} className="flex-1">
          <h3 className="font-semibold text-gray-800 text-base leading-snug hover:opacity-80 transition-opacity line-clamp-2">
            {product.model}
          </h3>
        </Link>

        {/* Sizes */}
        <div className="flex flex-wrap gap-1 mt-2">
          {product.sizes?.slice(0, 4).map((s) => (
            <span
              key={s.size}
              className="bg-gray-100 border text-xs px-2 py-0.5 rounded font-medium text-gray-600"
            >
              {s.size}
            </span>
          ))}
          {(product.sizes?.length || 0) > 4 && (
            <span className="text-xs text-gray-400 font-medium self-center ml-1">
              +{product.sizes!.length - 4}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-4 mb-5">
          {product.discount > 0 ? (
            <div className="flex flex-col">
              <span className="text-gray-400 line-through text-xs font-medium">
                ${product.price.toLocaleString()}
              </span>
              <span className="text-emerald-600 font-extrabold text-lg">
                ${finalPrice.toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="font-extrabold text-gray-900 text-lg">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <div className="mt-auto">
          <AddToCartButton product={product} accentColor={accentColor} />
        </div>
      </div>
    </div>
  );
}
