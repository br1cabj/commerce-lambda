"use client";

import Link from "next/link";
import { useTenant } from "@/hooks/useTenant";
import { Mail, Phone, MapPin, Truck } from "lucide-react";

export default function Footer() {
  const { config } = useTenant();

  if (!config) return null;

  return (
    <footer
      className="bg-gray-900 text-white pt-12 pb-6 mt-auto"
      style={{ borderTop: `4px solid ${config.theme.accentColor}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5
              className="font-bold text-lg mb-3 tracking-wider"
              style={{ color: config.theme.accentColor }}
            >
              {config.name}
            </h5>
            <p className="text-gray-400 text-sm">
              Your specialized online store. The best brands, the latest
              launches, and passion for quality in one place.
            </p>
          </div>

          <div>
            <h6 className="font-bold text-uppercase mb-3 text-sm">
              Customer Service
            </h6>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-orange-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/tracking"
                  className="hover:text-orange-400 transition-colors"
                >
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-orange-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="font-bold text-uppercase mb-3 text-sm">Contact</h6>
            <div className="space-y-2 text-sm text-gray-400">
              {config.settings.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {config.settings.email}
                </p>
              )}
              {config.settings.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {config.settings.phone}
                </p>
              )}
              {config.settings.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {config.settings.address}
                </p>
              )}
              {config.settings.shippingMethods.length > 0 && (
                <p className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />{" "}
                  {config.settings.shippingMethods
                    .map((m) => m.type)
                    .join(" / ")}
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-700 my-6" />

        <div className="text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {config.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
