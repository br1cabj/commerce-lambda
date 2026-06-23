"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import Image from "next/image";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import {
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Shield,
  Menu,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Product } from "@/types";

export default function Navbar() {
  const { config } = useTenant();
  const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const { totalItems } = useCart();
  const { currentLanguage } = useTranslations();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [quickResults, setQuickResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Real-time search debouncing
  useEffect(() => {
    if (!config?.slug) return;
    if (searchQuery.trim().length < 2) {
      setQuickResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = (await api.get(
          `/products?q=${encodeURIComponent(searchQuery.trim())}&limit=5`,
          config.slug
        )) as { results: Product[] };
        setQuickResults(res.results || []);
      } catch (err) {
        console.error("Search autocomplete error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, config?.slug]);

  if (!config) return null;

  const categories = config.categories || [];

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <nav
      id="global-navbar"
      aria-label="Main navigation"
      className="sticky top-0 z-50 bg-white shadow-sm border-b"
      style={{ borderColor: config.theme.accentColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo / Brand Name */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {config.theme.logoUrl && (
              <Image
                src={config.theme.logoUrl}
                alt={config.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
                unoptimized
              />
            )}
            <span
              className="font-bold text-lg tracking-wider hidden sm:block"
              style={{ color: config.theme.primaryColor }}
            >
              {config.name}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat._id}
                href={`/catalog/${cat.slug}`}
                className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors relative group py-1"
              >
                {cat.name}
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: config.theme.accentColor }}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Search Bar (Centered, Auto-completing) */}
          <div className="hidden md:flex items-center flex-grow max-w-sm relative" ref={searchRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={currentLanguage === "es" ? "Buscar productos..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50/50 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:bg-white transition-all placeholder-gray-400 text-gray-700"
              />
            </div>

            {/* Quick Search Autocomplete Panel */}
            {showResults && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
                {isSearching ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  </div>
                ) : quickResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 font-bold">
                    {currentLanguage === "es"
                      ? `No se encontraron resultados para "${searchQuery}"`
                      : `No results found for "${searchQuery}"`}
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-gray-450 uppercase tracking-wider">
                      {currentLanguage === "es" ? "Sugerencias" : "Suggestions"}
                    </div>
                    {quickResults.map((product) => (
                      <Link
                        key={product._id}
                        href={`/product/${product._id}`}
                        onClick={() => {
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all"
                      >
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={`${product.brand} ${product.model}`}
                            className="h-10 w-10 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0">
                            {product.brand?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-800 truncate">
                            {product.brand} {product.model}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {product.category}
                          </div>
                        </div>
                        <div className="text-xs font-extrabold text-gray-900 flex-shrink-0">
                          ${product.price}
                        </div>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        handleSearchSubmit();
                        setShowResults(false);
                      }}
                      className="w-full text-center py-2.5 border-t border-gray-50 text-[11px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50/50 transition-colors"
                    >
                      {currentLanguage === "es" ? "Ver todos los resultados" : "See all results"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Icons and Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSuperAdmin && (
              <Link
                href="/super"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
              >
                <Shield className="h-3.5 w-3.5" /> Platform
              </Link>
            )}

            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
              aria-label={`Cart, ${totalItems} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: config.theme.accentColor }}
                  aria-hidden="true"
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-2 text-gray-700 hover:bg-gray-50 rounded-full sm:rounded-xl transition-colors"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs font-bold hidden sm:block max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown
                    className="h-3.5 w-3.5 text-gray-400 hidden sm:block transition-transform duration-200"
                    style={userMenuOpen ? { transform: "rotate(180deg)" } : {}}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {currentLanguage === "es" ? "Mi Perfil" : "My Profile"}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 rounded-xl font-bold"
                        style={{ color: config.theme.accentColor }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="border-gray-50 my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl font-bold flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" /> {currentLanguage === "es" ? "Cerrar Sesión" : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl transition-colors hidden sm:block"
              >
                {currentLanguage === "es" ? "Ingresar" : "Login"}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Responsive Drawer) */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-white border-t border-gray-100 shadow-lg"
        >
          <div className="px-4 py-4 space-y-4">
            {/* Search Input for Mobile View */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={currentLanguage === "es" ? "Buscar productos..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50/50 rounded-full text-sm font-semibold focus:outline-none"
              />
            </div>

            <hr className="border-gray-50" />

            <div className="space-y-1">
              <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {currentLanguage === "es" ? "Categorías" : "Categories"}
              </div>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/catalog/${cat.slug}`}
                  className="block px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {!isAuthenticated && (
              <>
                <hr className="border-gray-50" />
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {currentLanguage === "es" ? "Ingresar" : "Login"}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
