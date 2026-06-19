"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useCart } from "@/hooks/useCart";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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

export default function CategoryPage() {
  const { config } = useTenant();
  const { addItem } = useCart();
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.category as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      if (!config) return;
      setLoading(true);
      try {
        const categories = await api.get("/categories", config.slug) as Array<{ _id: string; name: string; slug: string }>;
        const cat = categories.find(c => c.slug === categorySlug);
        if (cat) {
          setCategoryName(cat.name);
        } else {
          router.push("/catalog");
          return;
        }

        const params = new URLSearchParams({ limit: "100", category: cat.name });
        if (selectedBrand) params.set("brand", selectedBrand);
        if (selectedSize) params.set("size", selectedSize);

        const data = await api.get(`/products?${params.toString()}`, config.slug) as { results: Product[] };
        setProducts(data.results || []);
      } catch (err) {
        console.error("Error loading category:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [config, categorySlug, selectedBrand, selectedSize, router]);

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

  const brands = [...new Set(products.map(p => p.brand))];
  const sizes = [...new Set(products.flatMap(p => p.sizes.map(s => s.size)))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:underline">Catalog</Link>
        <span>/</span>
        <span className="font-bold text-gray-700">{categoryName}</span>
      </div>

      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold uppercase tracking-tight">{categoryName}</h1>
        <span className="text-gray-500 text-sm">{products.length} Products</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm uppercase">Filters</h3>
            <button
              onClick={() => { setSelectedBrand(""); setSelectedSize(""); }}
              className="text-xs text-gray-500 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-xs mb-3">BRAND</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="brand" checked={selectedBrand === ""} onChange={() => setSelectedBrand("")} className="accent-gray-900" />
                <span className="text-sm">All</span>
              </label>
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="brand" checked={selectedBrand === brand} onChange={() => setSelectedBrand(brand)} className="accent-gray-900" />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          <div>
            <h4 className="font-bold text-xs mb-3">SIZE</h4>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setSelectedSize("")} className={`py-2 rounded-lg text-xs font-bold border ${selectedSize === "" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>All</button>
              {sizes.map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`py-2 rounded-lg text-xs font-bold border ${selectedSize === size ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>{size}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="font-bold text-gray-700">No results found</p>
              <p className="text-gray-500 text-sm mt-1">Try removing some filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const finalPrice = product.discount > 0
                  ? product.price - product.price * (product.discount / 100)
                  : product.price;
                const mainImg = product.images?.[0] || "";

                return (
                  <div key={product._id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
                    {product.discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{product.discount}% OFF</span>
                    )}
                    <Link href={`/product/${product._id}`} className="block h-48 bg-white p-4 flex items-center justify-center">
                      <img src={mainImg} alt={product.model} className="max-h-full max-w-full object-contain hover:scale-110 transition-transform" />
                    </Link>
                    <div className="p-4 bg-gray-50 border-t">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{product.brand}</p>
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-bold text-sm mt-1 hover:underline line-clamp-2">{product.model}</h3>
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.sizes?.slice(0, 5).map((s) => (
                          <span key={s.size} className="bg-white border text-xs px-2 py-0.5 rounded">{s.size}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-gray-400 line-through text-sm">${product.price.toLocaleString()}</span>
                            <span className="text-green-600 font-bold ml-1">${finalPrice.toLocaleString()}</span>
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
                        <ShoppingCart className="h-4 w-4 inline mr-1" /> Add +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
