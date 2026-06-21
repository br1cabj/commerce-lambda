"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useCart } from "@/hooks/useCart";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Truck } from "lucide-react";
import Image from "next/image";
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
  category: string;
}

export default function ProductPage() {
  const { config } = useTenant();
  const { addItem } = useCart();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      if (!config) return;
      try {
        const data = (await api.get(
          `/products/${productId}`,
          config.slug,
        )) as Product;
        setProduct(data);
        if (data.images?.length) {
          setMainImage(data.images[0]);
        }
        if (data.sizes?.[0]) setSelectedSize(data.sizes[0].size);
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [config, productId]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;

    const sizeData = product.sizes?.find((s) => s.size === selectedSize);
    if (!sizeData || sizeData.stock < 1) return;

    const finalPrice =
      product.discount > 0
        ? product.price - product.price * (product.discount / 100)
        : product.price;

    addItem({
      id: product._id,
      model: product.model,
      brand: product.brand,
      price: finalPrice,
      image: mainImage,
      quantity: 1,
      size: selectedSize,
      maxStock: sizeData.stock,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-2xl h-96" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-10 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !config) return null;

  const finalPrice =
    product.discount > 0
      ? product.price - product.price * (product.discount / 100)
      : product.price;
  const images = product.images?.length ? product.images : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:underline">
          {product.category || "Catalog"}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-gray-700">{product.brand}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex gap-3">
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className={`border-2 rounded-xl p-1 w-20 h-20 flex-shrink-0 transition-all duration-200 ${mainImage === img ? "scale-105 shadow-md" : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"}`}
                style={
                  mainImage === img
                    ? { borderColor: config.theme.accentColor }
                    : {}
                }
              >
                <Image
                  src={img}
                  alt=""
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-lg"

                />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-gray-50 rounded-3xl flex items-center justify-center p-8 min-h-[500px] relative overflow-hidden group border border-gray-100">
            <Image
              src={mainImage}
              alt={product.model}
              width={500}
              height={400}
              className="max-h-[400px] max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"

            />
          </div>
        </div>

        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {product.brand}
          </p>
          <h1 className="text-4xl font-extrabold mt-2 leading-tight text-gray-900">
            {product.model}
          </h1>

          <div className="mt-6">
            {product.discount > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-400 line-through text-lg font-medium">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-emerald-600 font-extrabold text-4xl">
                    ${finalPrice.toLocaleString()}
                  </span>
                </div>
                <span className="bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-md tracking-wider">
                  -{product.discount}% OFF
                </span>
              </div>
            ) : (
              <span className="font-extrabold text-gray-900 text-4xl">
                ${product.price.toLocaleString()}
              </span>
            )}
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Select Size</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock < 1}
                    className={`py-3 rounded-lg text-sm font-bold border transition-colors ${
                      s.stock < 1
                        ? "opacity-40 cursor-not-allowed line-through"
                        : selectedSize === s.size
                          ? "bg-gray-900 text-white"
                          : "hover:bg-gray-100"
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || product.stock === 0}
            className={`mt-6 w-full py-4 rounded-full font-bold text-lg text-white transition-transform ${product.stock === 0 ? "bg-gray-400 cursor-not-allowed" : "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"}`}
            style={product.stock > 0 ? { backgroundColor: config.theme.primaryColor } : {}}
          >
            <ShoppingCart className="h-5 w-5 inline mr-2" /> 
            {product.stock === 0 ? "Sold Out / Agotado" : "Add to Cart"}
          </button>

          <div className="mt-8 border border-gray-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col gap-4">
            {config.settings.shippingMethods.length > 0 ? (
              config.settings.shippingMethods.map(
                (method: {
                  type: string;
                  enabled: boolean;
                  config: Record<string, unknown>;
                }) => (
                  <div key={method.type} className="flex items-center gap-4">
                    <Truck
                      className="h-7 w-7 flex-shrink-0"
                      style={{ color: config.theme.accentColor }}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                        {method.type === "free"
                          ? "Free Shipping"
                          : method.type === "flat"
                            ? "Flat Rate Shipping"
                            : "Delivery Available"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {method.type === "free"
                          ? "Delivered directly to your door at no extra cost."
                          : "Calculated at checkout based on your location."}
                      </p>
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="flex items-center gap-4">
                <Truck
                  className="h-7 w-7 flex-shrink-0"
                  style={{ color: config.theme.accentColor }}
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                    Shipping Options
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Contact us via WhatsApp for shipping arrangements.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
