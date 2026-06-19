"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useCart } from "@/hooks/useCart";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Truck } from "lucide-react";
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
        const data = await api.get(`/products/${productId}`, config.slug) as Product;
        setProduct(data);
        const images = data.images?.[0] ? data.images : [data.images?.[0]];
        setMainImage(images[0]);
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

    const sizeData = product.sizes?.find(s => s.size === selectedSize);
    if (!sizeData || sizeData.stock < 1) return;

    const finalPrice = product.discount > 0
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

  const finalPrice = product.discount > 0
    ? product.price - product.price * (product.discount / 100)
    : product.price;
  const images = product.images?.length ? product.images : [product.images?.[0]];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:underline">{product.category || "Catalog"}</Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-gray-700">{product.brand}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className={`border-2 rounded-lg p-1 w-16 h-16 flex-shrink-0 ${mainImage === img ? "border-orange-500" : "border-gray-200"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover rounded" />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl flex items-center justify-center p-8 min-h-[400px]">
            <img src={mainImage} alt={product.model} className="max-h-80 max-w-full object-contain" />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{product.brand}</p>
          <h1 className="text-3xl font-extrabold mt-1">{product.model}</h1>

          <div className="mt-4">
            {product.discount > 0 ? (
              <div>
                <span className="text-gray-400 line-through text-lg">${product.price.toLocaleString()}</span>
                <span className="text-green-600 font-bold text-2xl ml-2">${finalPrice.toLocaleString()}</span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded ml-2">-{product.discount}% OFF</span>
              </div>
            ) : (
              <span className="font-bold text-2xl">${product.price.toLocaleString()}</span>
            )}
          </div>

          {/* Size Selector */}
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
            disabled={!selectedSize}
            className="mt-6 w-full py-4 rounded-full font-bold text-lg text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            <ShoppingCart className="h-5 w-5 inline mr-2" /> Add to Cart
          </button>

          {/* Shipping Info */}
          <div className="mt-6 border rounded-xl p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8" style={{ color: config.theme.accentColor }} />
              <div>
                <h4 className="font-bold text-sm">Shipping Nationwide</h4>
                <p className="text-xs text-gray-500">Shipping cost will be arranged via WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
