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

const adminLinks = [
  { href: "/admin", label: "Products", icon: <Package className="h-4 w-4" /> },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: <Package className="h-4 w-4" />,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: <Star className="h-4 w-4" />,
  },
  {
    href: "/admin/home-builder",
    label: "Home Builder",
    icon: <Home className="h-4 w-4" />,
  },
  {
    href: "/admin/templates",
    label: "Templates",
    icon: <Palette className="h-4 w-4" />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    href: "/admin/emails",
    label: "Emails",
    icon: <Mail className="h-4 w-4" />,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-40 bg-white pb-4 mb-6 -mx-4 px-4 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
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
