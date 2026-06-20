"use client";

import Link from "next/link";
import Image from "next/image";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, User, LogOut, Settings, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Navbar() {
  const { config } = useTenant();
  const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!config) return null;

  const categories = config.categories || [];

  return (
    <nav
      className="sticky top-0 z-50 bg-white shadow-sm border-b"
      style={{ borderColor: config.theme.accentColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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

          <div className="hidden lg:flex items-center gap-6">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat._id}
                href={`/catalog/${cat.slug}`}
                className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors relative group"
              >
                {cat.name}
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: config.theme.accentColor }}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Link
                href="/super"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
              >
                <Shield className="h-3.5 w-3.5" /> Platform
              </Link>
            )}

            <LanguageSelector />

            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center text-white"
                  style={{ backgroundColor: config.theme.accentColor }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-1 p-2 text-gray-700 hover:text-orange-500 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.name}
                  </span>
                </button>
                <div className="absolute right-0 top-full w-52 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 before:content-[''] before:absolute before:-top-2 before:right-0 before:w-full before:h-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg"
                  >
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-orange-500 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 inline mr-1" /> Admin Panel
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-b-lg"
                  >
                    <LogOut className="h-4 w-4 inline mr-1" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors hidden sm:block"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/catalog/${cat.slug}`}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <hr className="my-2" />
            {!isAuthenticated && (
              <Link
                href="/login"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
