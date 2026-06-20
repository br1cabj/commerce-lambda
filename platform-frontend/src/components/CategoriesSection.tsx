"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useRef, useState, useEffect } from "react";
import type { TenantCategory, CategoriesConfig } from "@/stores/tenantStore";

interface CategoriesSectionProps {
  categories: TenantCategory[];
  accentColor: string;
  primaryColor: string;
  config?: CategoriesConfig;
}

const defaultConfig: CategoriesConfig = {
  layout: "grid",
  columns: 3,
  showDescription: true,
  showProductCount: false,
  cardStyle: "overlay",
  hoverEffect: "zoom",
  borderRadius: "2xl",
  maxHeight: "256px",
};

const borderRadiusMap: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

const iconComponents: Record<string, string> = {
  ShoppingBag: "🛍️",
  Shirt: "👕",
  Watch: "⌚",
  Laptop: "💻",
  Smartphone: "📱",
  Headphones: "🎧",
  Camera: "📷",
  Gamepad: "🎮",
  Book: "📚",
  Gift: "🎁",
  Home: "🏠",
  Utensils: "🍴",
  Coffee: "☕",
  Heart: "❤️",
  Star: "⭐",
  Zap: "⚡",
  Music: "🎵",
  Palette: "🎨",
  Gem: "💎",
  Crown: "👑",
};

function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const emoji = iconComponents[icon];
  if (emoji) {
    return <span className={className}>{emoji}</span>;
  }
  return <span className={className}>📦</span>;
}

export function CategoriesSection({
  categories,
  accentColor,
  primaryColor,
  config,
}: CategoriesSectionProps) {
  const { t, translations } = useTranslations();
  const cfg = { ...defaultConfig, ...config };
  const homeCategories = categories
    .filter((c) => c.showOnHome !== false && c.isActive !== false)
    .sort((a, b) => a.order - b.order);

  if (!homeCategories || homeCategories.length === 0) return null;

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  }[cfg.columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const radiusClass = borderRadiusMap[cfg.borderRadius] || "rounded-2xl";

  const renderCategory = (category: TenantCategory, index: number) => {
    const displayStyle = category.displayStyle || "image";
    const hasImage = !!category.imageUrl;
    const hasIcon = !!category.icon;
    const bgColor = category.backgroundColor || "";

    const commonClasses = `group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${radiusClass}`;

    const hoverClasses = {
      zoom: "group-hover:scale-110",
      slide: "group-hover:translate-y-[-4px]",
      fade: "group-hover:opacity-80",
      none: "",
    }[cfg.hoverEffect] || "";

    if (cfg.layout === "horizontal-scroll") {
      return (
        <Link
          key={category._id}
          href={`/catalog/${category.slug}`}
          className={`${commonClasses} flex-shrink-0 w-64 h-80 bg-white shadow-md`}
        >
          <CategoryCardContent
            category={category}
            cfg={cfg}
            accentColor={accentColor}
            hoverClasses={hoverClasses}
            displayStyle={displayStyle}
            hasImage={hasImage}
            hasIcon={hasIcon}
            bgColor={bgColor}
            vertical={true}
          />
        </Link>
      );
    }

    if (cfg.layout === "list") {
      return (
        <Link
          key={category._id}
          href={`/catalog/${category.slug}`}
          className={`${commonClasses} flex items-center gap-4 p-4 bg-white shadow-md hover:shadow-lg`}
        >
          <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden rounded-xl">
            <CategoryImage
              category={category}
              displayStyle={displayStyle}
              hasImage={hasImage}
              hasIcon={hasIcon}
              bgColor={bgColor}
              hoverClasses={hoverClasses}
              size="small"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
            {cfg.showDescription && category.description && (
              <p className="text-gray-500 text-sm mt-1 line-clamp-1">{category.description}</p>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900 transition-colors" style={accentColor ? { color: accentColor } : {}} />
        </Link>
      );
    }

    return (
      <Link
        key={category._id}
        href={`/catalog/${category.slug}`}
        className={`${commonClasses} bg-white shadow-lg`}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <CategoryCardContent
          category={category}
          cfg={cfg}
          accentColor={accentColor}
          hoverClasses={hoverClasses}
          displayStyle={displayStyle}
          hasImage={hasImage}
          hasIcon={hasIcon}
          bgColor={bgColor}
          vertical={false}
        />
      </Link>
    );
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3"
            style={{ color: primaryColor }}
          >
            {t(translations?.categories?.title)}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t(translations?.categories?.subtitle)}
          </p>
        </div>

        {cfg.layout === "horizontal-scroll" ? (
          <HorizontalScrollCarousel>
            {homeCategories.map((cat, i) => renderCategory(cat, i))}
          </HorizontalScrollCarousel>
        ) : cfg.layout === "list" ? (
          <div className="space-y-3 max-w-3xl mx-auto">
            {homeCategories.map((cat, i) => renderCategory(cat, i))}
          </div>
        ) : cfg.layout === "masonry" ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {homeCategories.map((cat) => (
              <div key={cat._id} className="break-inside-avoid">
                {renderCategory(cat, 0)}
              </div>
            ))}
          </div>
        ) : cfg.layout === "cards-icon" ? (
          <div className={`grid ${gridCols} gap-6`}>
            {homeCategories.map((cat) => (
              <Link
                key={cat._id}
                href={`/catalog/${cat.slug}`}
                className={`${borderRadiusMap[cfg.borderRadius] || "rounded-2xl"} group bg-white shadow-md hover:shadow-xl p-8 text-center transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: cat.backgroundColor ? `${cat.backgroundColor}20` : `${accentColor}15` }}
                >
                  <CategoryIcon icon={cat.icon || "ShoppingBag"} className="text-4xl" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-gray-700">
                  {cat.name}
                </h3>
                {cfg.showDescription && cat.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{cat.description}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-6`}>
            {homeCategories.map((cat, i) => renderCategory(cat, i))}
          </div>
        )}

        {homeCategories.length > 3 && (
          <div className="text-center mt-10">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {t(translations?.categories?.viewAll) || "View All Categories"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCardContent({
  category,
  cfg,
  accentColor,
  hoverClasses,
  displayStyle,
  hasImage,
  hasIcon,
  bgColor,
  vertical,
}: {
  category: TenantCategory;
  cfg: CategoriesConfig;
  accentColor: string;
  hoverClasses: string;
  displayStyle: string;
  hasImage: boolean;
  hasIcon: boolean;
  bgColor: string;
  vertical: boolean;
}) {
  const { t, translations } = useTranslations();

  if (vertical) {
    return (
      <div className="flex flex-col h-full">
        <div className="relative h-56 overflow-hidden">
          <CategoryImage
            category={category}
            displayStyle={displayStyle}
            hasImage={hasImage}
            hasIcon={hasIcon}
            bgColor={bgColor}
            hoverClasses={hoverClasses}
            size="large"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{category.name}</h3>
          {cfg.showDescription && category.description && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{category.description}</p>
          )}
          <div className="mt-auto flex items-center gap-2 font-semibold text-sm" style={{ color: accentColor }}>
            <span>{t(translations?.hero?.shopNow) || "Shop Now"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden" style={{ height: cfg.maxHeight }}>
        <CategoryImage
          category={category}
          displayStyle={displayStyle}
          hasImage={hasImage}
          hasIcon={hasIcon}
          bgColor={bgColor}
          hoverClasses={hoverClasses}
          size="large"
        />
        {(cfg.cardStyle === "overlay" || cfg.cardStyle === "bottom") && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        )}
      </div>

      {cfg.cardStyle === "overlay" && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-1 transform transition-transform duration-300 group-hover:translate-x-2">
            {category.name}
          </h3>
          {cfg.showDescription && category.description && (
            <p className="text-gray-200 text-sm mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {category.description}
            </p>
          )}
          <div
            className="flex items-center gap-2 font-semibold text-sm transform transition-all duration-300 group-hover:translate-x-2"
            style={{ color: accentColor }}
          >
            <span>{t(translations?.hero?.shopNow) || "Shop Now"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      )}

      {cfg.cardStyle === "overlay" && (
        <div
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"
          style={{ backgroundColor: accentColor }}
        >
          <ArrowRight className="h-6 w-6 text-white" />
        </div>
      )}

      {cfg.cardStyle === "bottom" && (
        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{category.name}</h3>
          {cfg.showDescription && category.description && (
            <p className="text-gray-500 text-sm line-clamp-2">{category.description}</p>
          )}
          <div className="flex items-center gap-2 font-semibold text-sm mt-3" style={{ color: accentColor }}>
            <span>{t(translations?.hero?.shopNow) || "Shop Now"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      )}

      {cfg.cardStyle === "side" && (
        <div className="absolute inset-0 flex items-end p-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 w-full">
            <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
            {cfg.showDescription && category.description && (
              <p className="text-gray-500 text-sm line-clamp-1 mt-1">{category.description}</p>
            )}
            <div className="flex items-center gap-2 font-semibold text-sm mt-2" style={{ color: accentColor }}>
              <span>{t(translations?.hero?.shopNow) || "Shop Now"}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}

      {cfg.cardStyle === "minimal" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          <div className="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
            <div
              className="inline-flex items-center gap-2 font-semibold text-sm"
              style={{ color: accentColor }}
            >
              <span>{t(translations?.hero?.shopNow) || "Shop Now"}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CategoryImage({
  category,
  displayStyle,
  hasImage,
  hasIcon,
  bgColor,
  hoverClasses,
  size,
}: {
  category: TenantCategory;
  displayStyle: string;
  hasImage: boolean;
  hasIcon: boolean;
  bgColor: string;
  hoverClasses: string;
  size: "small" | "large";
}) {
  if (displayStyle === "icon" || (!hasImage && hasIcon)) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${hoverClasses} transition-transform duration-500`}
        style={{ backgroundColor: bgColor || "#f3f4f6" }}
      >
        <CategoryIcon
          icon={category.icon || "ShoppingBag"}
          className={size === "large" ? "text-6xl" : "text-3xl"}
        />
      </div>
    );
  }

  if (displayStyle === "gradient" || (!hasImage && !hasIcon)) {
    const gradientColors = bgColor
      ? `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${hoverClasses} transition-transform duration-500`}
        style={{ background: gradientColors }}
      >
        {hasIcon ? (
          <CategoryIcon
            icon={category.icon}
            className={`${size === "large" ? "text-6xl" : "text-3xl"} opacity-80`}
          />
        ) : (
          <span className={`${size === "large" ? "text-6xl" : "text-3xl"} text-white/80 font-bold`}>
            {category.name.charAt(0)}
          </span>
        )}
      </div>
    );
  }

  if (hasImage) {
    return (
      <Image
        src={category.imageUrl}
        alt={category.name}
        fill
        className={`object-cover ${hoverClasses} transition-transform duration-700`}
        unoptimized
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
      <span className="text-gray-400 text-6xl font-bold">{category.name.charAt(0)}</span>
    </div>
  );
}

function HorizontalScrollCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 280;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
