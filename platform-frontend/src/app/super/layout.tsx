"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Store, ArrowLeft } from "lucide-react";

const superLinks = [
  {
    href: "/super",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: "/super/tenants",
    label: "Tenants",
    icon: <Store className="h-4 w-4" />,
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user , isHydrated} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "super_admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router, isHydrated]);

  if (!isAuthenticated || user?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>
            <span className="text-gray-600">|</span>
            <h1 className="font-bold text-lg">Platform Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user.name}</span>
            <span className="bg-purple-600 text-xs px-2 py-1 rounded-full font-bold">
              SUPER ADMIN
            </span>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {superLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                pathname === link.href
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
