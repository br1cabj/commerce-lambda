"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";
import type { Brand, Translation } from "@/stores/tenantStore";

interface BrandsSectionProps {
  title: Translation;
  subtitle: Translation;
  brands: Brand[];
  accentColor: string;
  primaryColor: string;
}

export function BrandsSection({
  title,
  subtitle,
  brands,
  accentColor,
  primaryColor,
}: BrandsSectionProps) {
  const { t } = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const enabledBrands = useMemo(
    () =>
      brands
        .filter((b) => b.enabled)
        .sort((a, b) => a.order - b.order),
    [brands],
  );

  const duplicatedBrands = useMemo(
    () => [...enabledBrands, ...enabledBrands],
    [enabledBrands],
  );

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || enabledBrands.length === 0) return;

    let animationId: number;
    let scrollPos = 0;

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        scrollPos += 0.5;
        if (scrollPos >= scrollContainer.scrollWidth / 2) {
          scrollPos = 0;
        }
        scrollContainer.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, enabledBrands.length]);

  if (enabledBrands.length === 0) return null;

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: primaryColor }}
          >
            {t(title)}
          </h2>
          <p className="text-gray-600 text-lg">{t(subtitle)}</p>
        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-hidden py-4"
            style={{ scrollbarWidth: "none" }}
          >
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="flex-shrink-0 flex items-center justify-center w-40 h-20 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 group"
              >
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={120}
                    height={50}
                    className="object-contain max-w-[100px] max-h-[40px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"

                  />
                ) : (
                  <span
                    className="text-lg font-bold opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: accentColor }}
                  >
                    {brand.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
