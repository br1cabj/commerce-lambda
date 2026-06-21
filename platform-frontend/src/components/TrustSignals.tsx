"use client";

import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { TrustSignal as TrustSignalType } from "@/stores/tenantStore";

interface TrustSignalsProps {
  accentColor: string;
  customSignals?: TrustSignalType[];
}

const defaultIcons: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Truck,
  Shield,
  RotateCcw,
  Headphones,
};

const defaultSignals = [
  {
    icon: "Truck",
    titleKey: "freeShipping",
    descKey: "freeShippingDesc",
  },
  {
    icon: "Shield",
    titleKey: "securePayment",
    descKey: "securePaymentDesc",
  },
  {
    icon: "RotateCcw",
    titleKey: "easyReturns",
    descKey: "easyReturnsDesc",
  },
  {
    icon: "Headphones",
    titleKey: "support",
    descKey: "supportDesc",
  },
];

export function TrustSignals({
  accentColor,
  customSignals,
}: TrustSignalsProps) {
  const { t, translations } = useTranslations();

  const signals = customSignals
    ? customSignals
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          icon: s.icon,
          title: t(s.title),
          description: t(s.description),
        }))
    : defaultSignals.map((s) => ({
        icon: s.icon,
        title: t(
          translations?.trustSignals?.[
            s.titleKey as keyof typeof translations.trustSignals
          ],
        ),
        description: t(
          translations?.trustSignals?.[
            s.descKey as keyof typeof translations.trustSignals
          ],
        ),
      }));

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {signals.map((signal, index) => {
            const Icon = defaultIcons[signal.icon] || Truck;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <Icon
                    className="h-7 w-7 transition-colors duration-300"
                    style={{ color: accentColor }}
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1">
                  {signal.title}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm">
                  {signal.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
