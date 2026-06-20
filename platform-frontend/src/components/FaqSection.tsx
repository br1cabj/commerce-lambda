"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { FaqItem, Translation } from "@/stores/tenantStore";

interface FaqSectionProps {
  title: Translation;
  subtitle: Translation;
  viewAllText: Translation;
  faqItems: FaqItem[];
  accentColor: string;
  primaryColor: string;
}

export function FaqSection({
  title,
  subtitle,
  viewAllText,
  faqItems,
  accentColor,
  primaryColor,
}: FaqSectionProps) {
  const { t } = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const enabledFaqs = faqItems
    .filter((f) => f.enabled)
    .sort((a, b) => a.order - b.order)
    .slice(0, 5);

  if (enabledFaqs.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <HelpCircle className="h-7 w-7" style={{ color: accentColor }} />
          </div>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: primaryColor }}
          >
            {t(title)}
          </h2>
          <p className="text-gray-600 text-lg">{t(subtitle)}</p>
        </div>

        <div className="space-y-3">
          {enabledFaqs.map((faq, index) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-gray-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {t(faq.question)}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  style={openIndex === index ? { color: accentColor } : {}}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {t(faq.answer)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg text-white"
            style={{ backgroundColor: accentColor }}
          >
            {t(viewAllText)}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
