import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";

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

interface ProductCardProps {
  product: Product;
  accentColor: string;
}

export function ProductCard({ product, accentColor }: ProductCardProps) {
  const finalPrice =
    product.discount > 0
      ? product.price - product.price * (product.discount / 100)
      : product.price;
  const mainImg = product.images?.[0] || "";

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full">
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md tracking-wider">
          -{product.discount}%
        </span>
      )}
      <Link
        href={`/product/${product._id}`}
        className="block relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden"
      >
        {mainImg ? (
          <Image
            src={mainImg}
            alt={product.model}
            fill
            className="object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
            unoptimized
          />
        ) : (
          <div className="text-gray-300 text-sm font-medium">No Image</div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1 bg-white border-t border-gray-50">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
          {product.brand}
        </p>
        <Link href={`/product/${product._id}`} className="flex-1">
          <h3 className="font-semibold text-gray-800 text-base leading-snug hover:opacity-80 transition-opacity line-clamp-2">
            {product.model}
          </h3>
        </Link>
        <div className="flex flex-wrap gap-1 mt-2">
          {product.sizes?.slice(0, 5).map((s) => (
            <span
              key={s.size}
              className="bg-gray-100 border text-xs px-2 py-0.5 rounded font-medium text-gray-600"
            >
              {s.size}
            </span>
          ))}
          {(product.sizes?.length || 0) > 5 && (
            <span className="text-xs text-gray-400 font-medium self-center ml-1">
              +{product.sizes!.length - 5}
            </span>
          )}
        </div>
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
        <div className="mt-auto">
          <AddToCartButton product={product} accentColor={accentColor} />
        </div>
      </div>
    </div>
  );
}
