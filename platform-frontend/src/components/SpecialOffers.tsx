"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useTranslations } from "@/hooks/useTranslations";
import type { Translation } from "@/stores/tenantStore";

interface Product {
  _id: string;
  model: string;
  brand: string;
  price: number;
  discount: number;
  images: string[];
  sizes: { size: string; stock: number }[];
  stock: number;
}

interface SpecialOffersProps {
  title: Translation;
  subtitle: Translation;
  viewAllText: Translation;
  endsIn: Translation;
  products: Product[];
  accentColor: string;
  primaryColor: string;
  endDate?: string;
}

function CountdownTimer({ endDate, accentColor }: { endDate: string; accentColor: string }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endDate).getTime() - new Date().getTime();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  });

  const timeUnits = [
    { label: "d", value: timeLeft.days },
    { label: "h", value: timeLeft.hours },
    { label: "m", value: timeLeft.minutes },
    { label: "s", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-5 w-5" style={{ color: accentColor }} />
      <div className="flex gap-2">
        {timeUnits.map((unit) => (
          <div key={unit.label} className="flex items-center gap-1">
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-white text-sm"
              style={{ backgroundColor: accentColor }}
            >
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-xs text-gray-500 font-medium">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpecialOffers({
  title,
  subtitle,
  viewAllText,
  endsIn,
  products,
  accentColor,
  primaryColor,
  endDate,
}: SpecialOffersProps) {
  const { t } = useTranslations();

  const offerProducts = products.filter((p) => p.discount > 0);
  if (offerProducts.length === 0) return null;

  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 3);
  const timerEndDate = endDate || defaultEndDate.toISOString();

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight"
                style={{ color: primaryColor }}
              >
                {t(title)}
              </h2>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                style={{ backgroundColor: accentColor }}
              >
                {t(endsIn)}
              </span>
            </div>
            <p className="text-gray-600 text-lg">{t(subtitle)}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <CountdownTimer endDate={timerEndDate} accentColor={accentColor} />
            <Link
              href="/catalog"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg text-white"
              style={{ backgroundColor: accentColor }}
            >
              {t(viewAllText)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {offerProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              accentColor={accentColor}
            />
          ))}
        </div>

        <div className="text-center mt-10 sm:hidden">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 text-white"
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
