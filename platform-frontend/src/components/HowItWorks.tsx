"use client";

import { ShoppingBag, CreditCard, Truck, PartyPopper } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { Translation } from "@/stores/tenantStore";

interface HowItWorksProps {
  title: Translation;
  subtitle: Translation;
  step1Title: Translation;
  step1Desc: Translation;
  step2Title: Translation;
  step2Desc: Translation;
  step3Title: Translation;
  step3Desc: Translation;
  accentColor: string;
  primaryColor: string;
}

export function HowItWorks({
  title,
  subtitle,
  step1Title,
  step1Desc,
  step2Title,
  step2Desc,
  step3Title,
  step3Desc,
  accentColor,
  primaryColor,
}: HowItWorksProps) {
  const { t } = useTranslations();

  const steps = [
    {
      icon: ShoppingBag,
      title: step1Title,
      description: step1Desc,
      number: "01",
    },
    {
      icon: CreditCard,
      title: step2Title,
      description: step2Desc,
      number: "02",
    },
    {
      icon: Truck,
      title: step3Title,
      description: step3Desc,
      number: "03",
    },
    {
      icon: PartyPopper,
      title: { en: "Enjoy!", es: "¡Disfruta!" },
      description: { en: "Love your new products", es: "Disfruta tus nuevos productos" },
      number: "04",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center group">
                <div className="relative z-10 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {t(step.title)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t(step.description)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
