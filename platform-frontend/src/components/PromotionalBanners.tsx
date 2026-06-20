"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { Banner } from "@/stores/tenantStore";

interface PromotionalBannersProps {
  banners: Banner[];
  accentColor: string;
}

export function PromotionalBanners({ banners, accentColor }: PromotionalBannersProps) {
  const { t, translations } = useTranslations();

  const enabledBanners = banners
    .filter((b) => b.enabled)
    .sort((a, b) => a.order - b.order);

  if (enabledBanners.length === 0) return null;

  const gridClass =
    enabledBanners.length === 1
      ? "grid-cols-1"
      : enabledBanners.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={`grid ${gridClass} gap-6`}>
        {enabledBanners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.link}
            className="group relative overflow-hidden rounded-2xl h-48 md:h-56"
          >
            {banner.imageUrl && (
              <Image
                src={banner.imageUrl}
                alt={t(banner.title)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            <div className="relative z-10 h-full flex flex-col justify-center p-6 text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                {t(banner.title)}
              </h3>
              {t(banner.description) && (
                <p className="text-sm md:text-base text-gray-200 mb-4 line-clamp-2">
                  {t(banner.description)}
                </p>
              )}
              <div
                className="inline-flex items-center gap-2 font-semibold text-sm transition-all group-hover:gap-3"
                style={{ color: accentColor }}
              >
                <span>{t(translations?.hero?.shopNow) || "Shop Now"}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
