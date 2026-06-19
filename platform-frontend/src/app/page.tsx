"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { api } from "@/lib/api";

interface Product {
  _id: string;
  model: string;
  brand: string;
  price: number;
  discount: number;
  images: string[];
  sizes: { size: string; stock: number }[];
  stock: number;
  isFeatured: boolean;
}

export default function Home() {
  const { config } = useTenant();
  const { addItem, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      if (!config) return;
      try {
        const data = await api.get("/products?isFeatured=true&limit=8", config.slug) as { results: Product[] };
        setProducts(data.results || []);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [config]);

  const handleAddToCart = (product: Product) => {
    const finalPrice = product.discount > 0
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

  if (!config) return null;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden bg-gray-900">
        {config.theme.heroImageUrl && (
          <img
            src={config.theme.heroImageUrl}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            {config.theme.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-6">
            {config.theme.heroSubtitle}
          </p>
          <Link
            href="/catalog"
            className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold tracking-wide" style={{ color: config.theme.primaryColor }}>
            Featured Products
          </h2>
          <Link
            href="/catalog"
            className="text-sm font-semibold hover:underline"
            style={{ color: config.theme.accentColor }}
          >
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">No featured products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const finalPrice = product.discount > 0
                ? product.price - product.price * (product.discount / 100)
                : product.price;
              const mainImg = product.images?.[0] || "";

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {product.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -{product.discount}%
                    </span>
                  )}
                  <Link href={`/product/${product._id}`} className="block h-48 bg-white p-4 flex items-center justify-center">
                    <img
                      src={mainImg}
                      alt={product.model}
                      className="max-h-full max-w-full object-contain hover:scale-110 transition-transform"
                    />
                  </Link>
                  <div className="p-4 bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{product.brand}</p>
                    <Link href={`/product/${product._id}`}>
                      <h3 className="font-bold text-sm mt-1 hover:underline line-clamp-2">{product.model}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">${product.price.toLocaleString()}</span>
                          <span className="text-green-600 font-bold">${finalPrice.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="font-bold">${product.price.toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-3 w-full py-2 rounded-lg font-semibold text-sm text-white transition-transform hover:scale-105"
                      style={{ backgroundColor: config.theme.accentColor }}
                    >
                      <ShoppingCart className="h-4 w-4 inline mr-1" /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      {config?.settings.features.reviews && <ReviewsSection />}
    </div>
  );
}

function ReviewsSection() {
  const [reviews, setReviews] = useState<{ _id: string; clientName: string; clientRole: string; message: string; image: string }[]>([]);
  const { config } = useTenant();

  useEffect(() => {
    const loadReviews = async () => {
      if (!config) return;
      try {
        const data = await api.get("/reviews", config.slug) as Array<{ _id: string; clientName: string; clientRole: string; message: string; image: string }>;
        setReviews(data || []);
      } catch (err) {
        console.error("Error loading reviews:", err);
      }
    };
    loadReviews();
  }, [config]);

  if (!config || reviews.length === 0) return null;

  return (
    <section className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold" style={{ color: config.theme.accentColor }}>
            What Our Customers Say
          </h2>
          <p className="text-gray-400 mt-2">Real reviews from our community</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <img src={review.image} alt={review.clientName} className="h-12 w-12 rounded-full object-cover border-2" style={{ borderColor: config.theme.accentColor }} />
                <div>
                  <h4 className="font-bold text-sm">{review.clientName}</h4>
                  <p className="text-xs uppercase tracking-wider" style={{ color: config.theme.accentColor }}>{review.clientRole}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm italic">&ldquo;{review.message}&rdquo;</p>
              <div className="flex gap-1 mt-3 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
