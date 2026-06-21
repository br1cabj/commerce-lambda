"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { ProductCard } from "@/components/ProductCard";
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

export default function CatalogPage() {
  const { config } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    const loadProducts = async () => {
      if (!config) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (selectedBrand) params.set("brand", selectedBrand);
        if (selectedSize) params.set("size", selectedSize);
        if (sortBy) params.set("sort", sortBy);
        if (priceRange.max < 1000) params.set("maxPrice", priceRange.max.toString());

        const data = (await api.get(
          `/products?${params.toString()}`,
          config.slug,
        )) as { results: Product[] };
        
        let filtered = data.results || [];
        
        // Frontend fallback for sorting if backend doesn't support it yet
        if (sortBy === 'price_asc') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
          filtered.sort((a, b) => b.price - a.price);
        }
        
        // Frontend fallback for price filtering
        filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
        
        setProducts(filtered);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [config, selectedBrand, selectedSize, sortBy, priceRange]);

  if (!config) return null;

  const brands = [...new Set(products.map((p) => p.brand))];
  const sizes = [
    ...new Set(products.flatMap((p) => p.sizes.map((s) => s.size))),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold uppercase tracking-tight">
          All Products
        </h1>
        <span className="text-gray-500 text-sm">
          {products.length} Products
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm uppercase">Filters</h3>
            <button
              onClick={() => {
                setSelectedBrand("");
                setSelectedSize("");
                setSortBy("newest");
                setPriceRange({ min: 0, max: 1000 });
              }}
              className="text-xs text-gray-500 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-xs mb-3">SORT BY</h4>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-sm border-gray-200 rounded-lg focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <hr className="border-gray-200 mb-6" />

          <div className="mb-6">
            <h4 className="font-bold text-xs mb-3 flex justify-between">
              <span>MAX PRICE</span>
              <span>${priceRange.max}</span>
            </h4>
            <input 
              type="range" 
              min="0" 
              max="1000" 
              step="10"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
              className="w-full accent-gray-900"
            />
          </div>

          <hr className="border-gray-200 mb-6" />

          <div className="mb-6">
            <h4 className="font-bold text-xs mb-3">BRAND</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === ""}
                  onChange={() => setSelectedBrand("")}
                  className="accent-gray-900"
                />
                <span className="text-sm">All</span>
              </label>
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === brand}
                    onChange={() => setSelectedBrand(brand)}
                    className="accent-gray-900"
                  />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          <div>
            <h4 className="font-bold text-xs mb-3">SIZE</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedSize("")}
                className={`py-2 rounded-lg text-xs font-bold border ${selectedSize === "" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
              >
                All
              </button>
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 rounded-lg text-xs font-bold border ${selectedSize === size ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
                >
                  {size}
                </button>
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
              <p className="text-gray-500 text-sm mt-1">
                Try removing some filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  accentColor={config.theme.accentColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
