"use client";

import {
  Award,
  Clock,
  Headphones,
  Shield,
  Truck,
  CreditCard,
  RotateCcw,
  Heart,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { Benefit, Translation } from "@/stores/tenantStore";

interface WhyChooseUsProps {
  title: Translation;
  subtitle: Translation;
  benefits: Benefit[];
  accentColor: string;
  primaryColor: string;
}

const defaultIcons: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Award,
  Clock,
  Headphones,
  Shield,
  Truck,
  CreditCard,
  RotateCcw,
  Heart,
  Zap,
  CheckCircle,
};

const defaultBenefits = [
  {
    icon: "Truck",
    titleKey: "Free Shipping",
    descKey: "On all orders over $50",
  },
  {
    icon: "Shield",
    titleKey: "Secure Payment",
    descKey: "100% protected transactions",
  },
  {
    icon: "RotateCcw",
    titleKey: "Easy Returns",
    descKey: "30-day return policy",
  },
  {
    icon: "Headphones",
    titleKey: "24/7 Support",
    descKey: "Always here to help",
  },
];

export function WhyChooseUs({
  title,
  subtitle,
  benefits,
  accentColor,
  primaryColor,
}: WhyChooseUsProps) {
  const { t } = useTranslations();

  const enabledBenefits =
    benefits.length > 0
      ? benefits.filter((b) => b.enabled).sort((a, b) => a.order - b.order)
      : defaultBenefits.map((b, i) => ({
          id: `default-${i}`,
          icon: b.icon,
          title: { en: b.titleKey, es: b.titleKey },
          description: { en: b.descKey, es: b.descKey },
          enabled: true,
          order: i,
        }));

  const gridCols =
    enabledBenefits.length === 2
      ? "md:grid-cols-2"
      : enabledBenefits.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: primaryColor }}
          >
            {t(title)}
          </h2>
          <p className="text-gray-600 text-lg">{t(subtitle)}</p>
        </div>

        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {enabledBenefits.map((benefit) => {
            const Icon = defaultIcons[benefit.icon] || CheckCircle;
            return (
              <div
                key={benefit.id}
                className="group text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <Icon
                    className="h-8 w-8 transition-colors duration-300"
                    style={{ color: accentColor }}
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {t(benefit.title)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t(benefit.description)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
