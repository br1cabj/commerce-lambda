import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Tag,
  Star,
  Settings,
  Home,
  Palette,
  Mail,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export function AdminNav() {
  const pathname = usePathname();
  const { adminT } = useTranslations();

  const adminLinks = [
    { href: "/admin", label: adminT("products"), icon: <Package className="h-4 w-4" /> },
    {
      href: "/admin/orders",
      label: adminT("orders"),
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      href: "/admin/coupons",
      label: adminT("coupons"),
      icon: <Tag className="h-4 w-4" />,
    },
    {
      href: "/admin/categories",
      label: adminT("categories"),
      icon: <Package className="h-4 w-4" />,
    },
    {
      href: "/admin/reviews",
      label: adminT("reviews"),
      icon: <Star className="h-4 w-4" />,
    },
    {
      href: "/admin/home-builder",
      label: adminT("homeBuilder"),
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: "/admin/templates",
      label: adminT("templates"),
      icon: <Palette className="h-4 w-4" />,
    },
    {
      href: "/admin/settings",
      label: adminT("settings"),
      icon: <Settings className="h-4 w-4" />,
    },
    {
      href: "/admin/emails",
      label: adminT("emails"),
      icon: <Mail className="h-4 w-4" />,
    },
  ];

  return (
    <div className="sticky top-16 z-40 bg-white pb-4 mb-6 -mx-4 px-4 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{adminT("adminPanel")}</h1>
        <nav className="flex flex-wrap gap-2">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
