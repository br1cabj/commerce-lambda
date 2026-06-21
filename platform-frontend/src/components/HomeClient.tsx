"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { ProductSection } from "@/components/ProductSection";
import { SpecialOffers } from "@/components/SpecialOffers";
import { BrandsSection } from "@/components/BrandsSection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { PaymentMethodsSection } from "@/components/PaymentMethodsSection";
import { HowItWorks } from "@/components/HowItWorks";
import { FaqSection } from "@/components/FaqSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { TrustSignals } from "@/components/TrustSignals";
import { NewsletterSection } from "@/components/NewsletterSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PromotionalBanners } from "@/components/PromotionalBanners";
import { useTranslations } from "@/hooks/useTranslations";
import type { TenantConfig } from "@/stores/tenantStore";
import type { Product, Review } from "@/types";

interface HomeClientProps {
  config: TenantConfig;
  featuredProducts: Product[];
  newProducts: Product[];
  bestSellers: Product[];
  offerProducts: Product[];
  reviews: Review[];
}

export function HomeClient({
  config,
  featuredProducts,
  newProducts,
  bestSellers,
  offerProducts,
  reviews,
}: HomeClientProps) {
  const { t } = useTranslations();

  const categories = config.categories || [];
  const heroSlides = config.homeConfig?.heroSlides || [];
  const banners = config.homeConfig?.banners || [];
  const trustSignals = config.homeConfig?.trustSignals || [];
  const brands = config.homeConfig?.brands || [];
  const benefits = config.homeConfig?.benefits || [];
  const faqItems = config.homeConfig?.faqItems || [];
  const categoriesConfig = config.homeConfig?.categoriesConfig;
  const sections = config.homeConfig?.sections || [];

  const hasCustomHero =
    heroSlides.length > 0 && heroSlides.some((s) => s.enabled);

  const enabledSections = sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const isSectionEnabled = (type: string) => {
    if (enabledSections.length === 0) return true;
    return enabledSections.some((s) => s.type === type);
  };

  const tr = config.translations;

  return (
    <div>
      {/* Hero Section */}
      {hasCustomHero ? (
        <HeroCarousel
          slides={heroSlides}
          accentColor={config.theme.accentColor}
        />
      ) : (
        <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
          {config.theme.heroImageUrl && (
            <Image
              src={config.theme.heroImageUrl}
              alt="Hero"
              fill
              className="absolute inset-0 object-cover opacity-40"

              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              {config.theme.heroTitle}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
              {config.theme.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: config.theme.accentColor }}
              >
                {t(tr?.hero?.shopNow) || "Shop Now"}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 transition-all hover:bg-white/20 hover:scale-105"
              >
                {t(tr?.hero?.viewCollections) || "View Collections"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust Signals */}
      {isSectionEnabled("trust") && (
        <TrustSignals
          accentColor={config.theme.accentColor}
          customSignals={trustSignals}
        />
      )}

      {/* Promotional Banners */}
      {isSectionEnabled("banners") &&
        banners.length > 0 &&
        banners.some((b) => b.enabled) && (
          <PromotionalBanners
            banners={banners}
            accentColor={config.theme.accentColor}
          />
        )}

      {/* Categories Section */}
      {isSectionEnabled("categories") && categories.length > 0 && (
        <CategoriesSection
          categories={categories}
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
          config={categoriesConfig}
        />
      )}

      {/* Special Offers */}
      {isSectionEnabled("flash") && offerProducts.length > 0 && (
        <SpecialOffers
          title={
            tr?.specialOffers?.title || {
              en: "Special Offers",
              es: "Ofertas Especiales",
            }
          }
          subtitle={
            tr?.specialOffers?.subtitle || {
              en: "Limited time deals",
              es: "Ofertas por tiempo limitado",
            }
          }
          viewAllText={
            tr?.specialOffers?.viewAll || {
              en: "View All Offers",
              es: "Ver Todas las Ofertas",
            }
          }
          endsIn={
            tr?.specialOffers?.endsIn || { en: "Ends in", es: "Termina en" }
          }
          products={offerProducts}
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
        />
      )}

      {/* Featured Products */}
      {isSectionEnabled("featured") && featuredProducts.length > 0 && (
        <ProductSection
          title={
            tr?.featured?.title || {
              en: "Featured Products",
              es: "Productos Destacados",
            }
          }
          subtitle={
            tr?.featured?.subtitle || {
              en: "Handpicked items just for you",
              es: "Artículos seleccionados para ti",
            }
          }
          viewAllText={
            tr?.featured?.viewAll || { en: "View All", es: "Ver Todos" }
          }
          products={featuredProducts}
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
        />
      )}

      {/* New Products */}
      {isSectionEnabled("new") && newProducts.length > 0 && (
        <ProductSection
          title={
            tr?.newProducts?.title || {
              en: "New Arrivals",
              es: "Nuevos Ingresos",
            }
          }
          subtitle={
            tr?.newProducts?.subtitle || {
              en: "Just landed in our store",
              es: "Recién llegados a nuestra tienda",
            }
          }
          viewAllText={
            tr?.newProducts?.viewAll || {
              en: "View All New",
              es: "Ver Todos los Nuevos",
            }
          }
          viewAllLink="/catalog?sort=newest"
          products={newProducts}
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
          badge="new"
        />
      )}

      {/* Best Sellers */}
      {isSectionEnabled("bestseller") && bestSellers.length > 0 && (
        <ProductSection
          title={
            tr?.bestSellers?.title || { en: "Best Sellers", es: "Más Vendidos" }
          }
          subtitle={
            tr?.bestSellers?.subtitle || {
              en: "Our customers' favorites",
              es: "Los favoritos de nuestros clientes",
            }
          }
          viewAllText={
            tr?.bestSellers?.viewAll || {
              en: "View All Best Sellers",
              es: "Ver Todos los Más Vendidos",
            }
          }
          viewAllLink="/catalog?sort=bestselling"
          products={bestSellers}
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
          badge="bestseller"
        />
      )}

      {/* Brands Section */}
      {isSectionEnabled("brands") &&
        brands.length > 0 &&
        brands.some((b) => b.enabled) && (
          <BrandsSection
            title={
              tr?.brands?.title || { en: "Our Brands", es: "Nuestras Marcas" }
            }
            subtitle={
              tr?.brands?.subtitle || {
                en: "Trusted by the best",
                es: "Confianza de las mejores marcas",
              }
            }
            brands={brands}
            accentColor={config.theme.accentColor}
            primaryColor={config.theme.primaryColor}
          />
        )}

      {/* Why Choose Us */}
      {isSectionEnabled("why-choose-us") && (
        <WhyChooseUs
          title={
            tr?.whyChooseUs?.title || {
              en: "Why Choose Us",
              es: "Por Qué Elegirnos",
            }
          }
          subtitle={
            tr?.whyChooseUs?.subtitle || {
              en: "What makes us different",
              es: "Lo que nos hace diferentes",
            }
          }
          benefits={benefits}
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
        />
      )}

      {/* How It Works */}
      {isSectionEnabled("how-it-works") && (
        <HowItWorks
          title={
            tr?.howItWorks?.title || { en: "How It Works", es: "Cómo Funciona" }
          }
          subtitle={
            tr?.howItWorks?.subtitle || {
              en: "Simple steps to get your order",
              es: "Pasos simples para recibir tu pedido",
            }
          }
          step1Title={
            tr?.howItWorks?.step1Title || {
              en: "Choose Products",
              es: "Elige Productos",
            }
          }
          step1Desc={
            tr?.howItWorks?.step1Desc || {
              en: "Browse our catalog and add items to cart",
              es: "Explora nuestro catálogo y agrega al carrito",
            }
          }
          step2Title={
            tr?.howItWorks?.step2Title || {
              en: "Secure Checkout",
              es: "Pago Seguro",
            }
          }
          step2Desc={
            tr?.howItWorks?.step2Desc || {
              en: "Complete your purchase safely",
              es: "Completa tu compra de forma segura",
            }
          }
          step3Title={
            tr?.howItWorks?.step3Title || {
              en: "Fast Delivery",
              es: "Entrega Rápida",
            }
          }
          step3Desc={
            tr?.howItWorks?.step3Desc || {
              en: "Receive your order at your door",
              es: "Recibe tu pedido en tu puerta",
            }
          }
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
        />
      )}

      {/* Reviews Section */}
      {isSectionEnabled("reviews") &&
        config?.settings.features.reviews &&
        reviews.length > 0 && (
          <ReviewsSection
            reviews={reviews}
            accentColor={config.theme.accentColor}
            translations={tr}
          />
        )}

      {/* Payment Methods */}
      {isSectionEnabled("payment-methods") && (
        <PaymentMethodsSection
          title={
            tr?.paymentMethods?.title || {
              en: "Secure Payment",
              es: "Pago Seguro",
            }
          }
          subtitle={
            tr?.paymentMethods?.subtitle || { en: "We accept", es: "Aceptamos" }
          }
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
          paymentMethods={config.settings.paymentMethods}
        />
      )}

      {/* FAQ Section */}
      {isSectionEnabled("faq") &&
        faqItems.length > 0 &&
        faqItems.some((f) => f.enabled) && (
          <FaqSection
            title={
              tr?.faq?.title || {
                en: "Frequently Asked Questions",
                es: "Preguntas Frecuentes",
              }
            }
            subtitle={
              tr?.faq?.subtitle || {
                en: "Find answers to common questions",
                es: "Encuentra respuestas a preguntas comunes",
              }
            }
            viewAllText={
              tr?.faq?.viewAll || {
                en: "View All FAQs",
                es: "Ver Todas las Preguntas",
              }
            }
            faqItems={faqItems}
            accentColor={config.theme.accentColor}
            primaryColor={config.theme.primaryColor}
          />
        )}

      {/* Newsletter Section */}
      {isSectionEnabled("newsletter") && (
        <NewsletterSection
          accentColor={config.theme.accentColor}
          primaryColor={config.theme.primaryColor}
        />
      )}
    </div>
  );
}

function ReviewsSection({
  reviews,
  accentColor,
  translations: tr,
}: {
  reviews: Review[];
  accentColor: string;
  translations?: TenantConfig["translations"];
}) {
  const { t } = useTranslations();

  const averageRating =
    reviews.reduce(
      (acc: number, review: Review) => acc + (review.rating || 5),
      0,
    ) / reviews.length;

  return (
    <section className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(averageRating)
                      ? "fill-current"
                      : "fill-transparent"
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-white">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-extrabold mb-3"
            style={{ color: accentColor }}
          >
            {t(tr?.reviews?.title) || "What Our Customers Say"}
          </h2>
          <p className="text-gray-400 text-lg">
            {t(tr?.reviews?.subtitle) || "Real reviews from our community"} (
            {reviews.length} reviews)
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review: Review) => (
            <div
              key={review._id}
              className="group bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 transition-all duration-300 relative overflow-hidden hover:bg-gray-800 hover:border-gray-600 hover:shadow-2xl hover:-translate-y-1"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: accentColor }}
              />

              <div className="flex gap-1 mb-4 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < (review.rating || 5)
                        ? "fill-current"
                        : "fill-transparent"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-300 text-base leading-relaxed mb-6 italic">
                &ldquo;{review.message}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-700/50">
                <div
                  className="h-12 w-12 rounded-full border-2 overflow-hidden relative shadow-lg flex-shrink-0"
                  style={{ borderColor: accentColor }}
                >
                  {review.image && (
                    <Image
                      src={review.image}
                      alt={review.clientName}
                      fill
                      className="object-cover"

                    />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-100">
                    {review.clientName}
                  </h4>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mt-0.5"
                    style={{ color: accentColor }}
                  >
                    {review.clientRole}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
