import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useTranslations } from "@/hooks/useTranslations";
import type { Translation } from "@/stores/tenantStore";
import type { Product } from "@/types";

interface ProductSectionProps {
  title: Translation;
  subtitle: Translation;
  viewAllText: Translation;
  viewAllLink?: string;
  products: Product[];
  accentColor: string;
  primaryColor: string;
  badge?: "new" | "bestseller" | "sale";
}

export function ProductSection({
  title,
  subtitle,
  viewAllText,
  viewAllLink = "/catalog",
  products,
  accentColor,
  primaryColor,
  badge,
}: ProductSectionProps) {
  const { t } = useTranslations();

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: primaryColor }}
          >
            {t(title)}
          </h2>
          <p className="text-gray-600 text-lg">{t(subtitle)}</p>
        </div>
        <Link
          href={viewAllLink}
          className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg text-white"
          style={{ backgroundColor: accentColor }}
        >
          {t(viewAllText)}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={{
              ...product,
              isNew: badge === "new" ? true : product.isNew,
              isBestSeller:
                badge === "bestseller" ? true : product.isBestSeller,
            }}
            accentColor={accentColor}
          />
        ))}
      </div>

      <div className="text-center mt-10 sm:hidden">
        <Link
          href={viewAllLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 text-white"
          style={{ backgroundColor: accentColor }}
        >
          {t(viewAllText)}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
