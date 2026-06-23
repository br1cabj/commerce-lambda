"use client";

import { useEffect, useState, Suspense } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useTranslations } from "@/hooks/useTranslations";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { SlidersHorizontal, Search, Folder } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/types";

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const { config } = useTenant();
  const { currentLanguage } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const category = searchParams.get("category") || "";

  const buildCategoryUrl = (catName: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (catName) {
      nextParams.set("category", catName);
    } else {
      nextParams.delete("category");
    }
    return `/catalog?${nextParams.toString()}`;
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      if (!config) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (selectedBrand) params.set("brand", selectedBrand);
        if (selectedSize) params.set("size", selectedSize);
        if (q) params.set("q", q);
        if (tag) params.set("tag", tag);
        if (category) params.set("category", category);
        
        // Map frontend sorting options to backend contract
        if (sortBy === "price_asc") {
          params.set("sort", "price");
          params.set("order", "asc");
        } else if (sortBy === "price_desc") {
          params.set("sort", "price");
          params.set("order", "desc");
        } else if (sortBy === "newest") {
          params.set("sort", "createdAt");
          params.set("order", "desc");
        } else {
          params.set("sort", sortBy);
        }

        // Apply price range filter in API query
        if (priceRange.min > 0) {
          params.set("minPrice", priceRange.min.toString());
        }
        if (priceRange.max < 1000) {
          params.set("maxPrice", priceRange.max.toString());
        }

        const data = (await api.get(
          `/products?${params.toString()}`,
          config.slug,
        )) as { results: Product[] };
        
        const filtered = data.results || [];
        setProducts(filtered);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [config, selectedBrand, selectedSize, sortBy, priceRange, q, tag, category]);

  if (!config) return null;

  const brands = [...new Set(products.map((p) => p.brand))];
  const sizes = [
    ...new Set(products.flatMap((p) => p.sizes.map((s) => s.size))),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Catalog Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tight">
            {q ? (
              currentLanguage === "es" ? (
                <>Resultados para: <span className="text-gray-500 font-semibold italic">&quot;{q}&quot;</span></>
              ) : (
                <>Results for: <span className="text-gray-500 font-semibold italic">&quot;{q}&quot;</span></>
              )
            ) : tag ? (
              currentLanguage === "es" ? (
                <>Colección: <span className="text-gray-900 font-extrabold uppercase tracking-tight">{tag}</span></>
              ) : (
                <>Collection: <span className="text-gray-900 font-extrabold uppercase tracking-tight">{tag}</span></>
              )
            ) : category ? (
              currentLanguage === "es" ? (
                <>Categoría: <span className="text-gray-900 font-extrabold uppercase tracking-tight">{category}</span></>
              ) : (
                <>Category: <span className="text-gray-900 font-extrabold uppercase tracking-tight">{category}</span></>
              )
            ) : (
              currentLanguage === "es" ? "Todos los Productos" : "All Products"
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {mobileFiltersOpen ? "✕" : ""}
          </button>
          <span className="text-gray-500 text-sm font-bold">
            {products.length} {currentLanguage === "es" ? "Productos" : "Products"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24 space-y-6 ${mobileFiltersOpen ? "block" : "hidden lg:block"}`}>
          {/* Active Search Param Clear Tag */}
          {q && (
            <div className="flex items-center justify-between bg-gray-50/50 border border-gray-150 rounded-xl p-3 gap-2">
              <div className="flex items-center gap-2 truncate flex-1">
                <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 font-bold truncate">
                  &quot;{q}&quot;
                </span>
              </div>
              <Link
                href="/catalog"
                className="text-[10px] font-extrabold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-800 px-2 py-1 rounded-lg transition-colors flex-shrink-0"
              >
                {currentLanguage === "es" ? "Quitar" : "Clear"}
              </Link>
            </div>
          )}

          {tag && (
            <div className="flex items-center justify-between bg-gray-50/50 border border-gray-150 rounded-xl p-3 gap-2">
              <div className="flex items-center gap-2 truncate flex-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 font-bold truncate">
                  Tag: #{tag}
                </span>
              </div>
              <Link
                href="/catalog"
                className="text-[10px] font-extrabold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-800 px-2 py-1 rounded-lg transition-colors flex-shrink-0"
              >
                {currentLanguage === "es" ? "Quitar" : "Clear"}
              </Link>
            </div>
          )}

          {category && (
            <div className="flex items-center justify-between bg-gray-50/50 border border-gray-150 rounded-xl p-3 gap-2">
              <div className="flex items-center gap-2 truncate flex-1">
                <Folder className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 font-bold truncate">
                  {currentLanguage === "es" ? "Categoría" : "Category"}: {category}
                </span>
              </div>
              <Link
                href={buildCategoryUrl("")}
                className="text-[10px] font-extrabold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-800 px-2 py-1 rounded-lg transition-colors flex-shrink-0"
              >
                {currentLanguage === "es" ? "Quitar" : "Clear"}
              </Link>
            </div>
          )}

          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="font-extrabold text-sm uppercase text-gray-800">
              {currentLanguage === "es" ? "Filtros" : "Filters"}
            </h3>
            <button
              onClick={() => {
                setSelectedBrand("");
                setSelectedSize("");
                setSortBy("newest");
                setPriceRange({ min: 0, max: 1000 });
                router.push("/catalog");
              }}
              className="text-xs text-gray-500 hover:underline font-bold"
            >
              {currentLanguage === "es" ? "Limpiar Todo" : "Clear All"}
            </button>
          </div>

          <div>
            <h4 className="font-bold text-xs mb-3 text-gray-400 uppercase tracking-wider">
              {currentLanguage === "es" ? "Ordenar por" : "Sort By"}
            </h4>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-sm border-gray-200 rounded-xl focus:ring-gray-900 focus:border-gray-900 font-semibold text-gray-700 bg-white"
            >
              <option value="newest">
                {currentLanguage === "es" ? "Novedades" : "Newest Arrivals"}
              </option>
              <option value="price_asc">
                {currentLanguage === "es" ? "Precio: Menor a Mayor" : "Price: Low to High"}
              </option>
              <option value="price_desc">
                {currentLanguage === "es" ? "Precio: Mayor a Menor" : "Price: High to Low"}
              </option>
            </select>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h4 className="font-bold text-xs mb-3 text-gray-400 uppercase tracking-wider">
              {currentLanguage === "es" ? "Categorías" : "Categories"}
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              <Link
                href={buildCategoryUrl("")}
                className={`flex items-center gap-2 text-sm font-semibold hover:text-gray-900 transition-colors ${
                  !category ? "text-gray-950 font-bold" : "text-gray-600 font-medium"
                }`}
              >
                <span>{currentLanguage === "es" ? "Todas" : "All"}</span>
              </Link>
              {config.categories?.map((cat) => (
                <Link
                  key={cat._id}
                  href={buildCategoryUrl(cat.name)}
                  className={`flex items-center gap-2 text-sm font-semibold hover:text-gray-900 transition-colors ${
                    category === cat.name ? "text-gray-950 font-bold" : "text-gray-600 font-medium"
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h4 className="font-bold text-xs mb-3 flex justify-between text-gray-400 uppercase tracking-wider">
              <span>{currentLanguage === "es" ? "Precio Máximo" : "Max Price"}</span>
              <span className="text-gray-950 font-bold">${priceRange.max}</span>
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

          <hr className="border-gray-100" />

          <div>
            <h4 className="font-bold text-xs mb-3 text-gray-400 uppercase tracking-wider">
              {currentLanguage === "es" ? "Marcas" : "Brands"}
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-900">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === ""}
                  onChange={() => setSelectedBrand("")}
                  className="accent-gray-900 h-4 w-4"
                />
                <span>{currentLanguage === "es" ? "Todas" : "All"}</span>
              </label>
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === brand}
                    onChange={() => setSelectedBrand(brand)}
                    className="accent-gray-900 h-4 w-4"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h4 className="font-bold text-xs mb-3 text-gray-400 uppercase tracking-wider">
              {currentLanguage === "es" ? "Tallas" : "Sizes"}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedSize("")}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedSize === ""
                    ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {currentLanguage === "es" ? "Todas" : "All"}
              </button>
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedSize === size
                      ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="font-bold text-gray-800">
                {currentLanguage === "es" ? "No se encontraron productos" : "No products found"}
              </p>
              <p className="text-gray-400 text-xs mt-1 font-medium">
                {currentLanguage === "es"
                  ? "Prueba eliminando algunos filtros o buscando otra palabra clave."
                  : "Try removing some filters or searching for another keyword."}
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
