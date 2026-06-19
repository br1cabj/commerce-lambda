"use client";

import Link from "next/link";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, User, LogOut, Settings, Shield } from "lucide-react";

export default function Navbar() {
  const { config } = useTenant();
  const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const { totalItems } = useCart();

  if (!config) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b" style={{ borderColor: config.theme.accentColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            {config.theme.logoUrl && (
              <img src={config.theme.logoUrl} alt={config.name} className="h-10 w-10 rounded-full object-cover" />
            )}
            <span className="font-bold text-lg tracking-wider" style={{ color: config.theme.primaryColor }}>
              {config.name}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {config.categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/catalog/${cat.slug}`}
                className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors hidden sm:block"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Link href="/super" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                <Shield className="h-3.5 w-3.5" /> Platform
              </Link>
            )}

            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-1 p-2 text-gray-700 hover:text-orange-500 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-orange-500 hover:bg-gray-100">
                      <Settings className="h-4 w-4 inline mr-1" /> Admin Panel
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 inline mr-1" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
