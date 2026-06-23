"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { HeroSlide } from "@/stores/tenantStore";

interface HeroCarouselProps {
  slides: HeroSlide[];
  accentColor: string;
  autoPlayInterval?: number;
}

export function HeroCarousel({
  slides,
  accentColor,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const { t } = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);

  const enabledSlides = useMemo(
    () =>
      slides
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order),
    [slides],
  );

  useEffect(() => {
    if (enabledSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % enabledSlides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [enabledSlides.length, autoPlayInterval]);

  if (enabledSlides.length === 0) return null;

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % enabledSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + enabledSlides.length) % enabledSlides.length,
    );
  };

  return (
    <section
      className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden bg-gray-950"
      aria-roledescription="carousel"
      aria-label="Hero carousel"
    >
      {enabledSlides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {slide.imageUrl && (
              <Image
                src={slide.imageUrl}
                alt={t(slide.title)}
                fill
                className="absolute inset-0 object-cover opacity-40 transition-transform duration-[6000ms] ease-out"
                style={{
                  transform: isActive ? "scale(1)" : "scale(1.08)",
                }}
                priority={index === 0}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
                <h1
                  className={`text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight transition-all duration-700 delay-300 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  {t(slide.title)}
                </h1>
                <p
                  className={`text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto transition-all duration-700 delay-500 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  {t(slide.subtitle)}
                </p>
                <div
                  className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-700 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  {t(slide.ctaPrimary) && (
                    <Link
                      href={slide.ctaPrimaryLink}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105 hover:shadow-2xl"
                      style={{ backgroundColor: accentColor }}
                    >
                      {t(slide.ctaPrimary)}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  )}
                  {t(slide.ctaSecondary) && (
                    <Link
                      href={slide.ctaSecondaryLink}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 transition-all hover:bg-white/20 hover:scale-105"
                    >
                      {t(slide.ctaSecondary)}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {enabledSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {enabledSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
