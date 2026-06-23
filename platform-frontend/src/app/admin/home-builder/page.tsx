"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link as LinkIcon,
  LayoutGrid,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { useTranslations } from "@/hooks/useTranslations";
import type {
  HeroSlide,
  Banner,
  TrustSignal,
  Translation,
  CategoriesConfig,
} from "@/stores/tenantStore";

interface TranslationInputProps {
  value: Translation;
  onChange: (value: Translation) => void;
  label: string;
  lang: "en" | "es";
}

function TranslationInput({ value, onChange, label, lang }: TranslationInputProps) {
  const langLabel = lang === "en" ? "English" : "Español";
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
        {label} ({langLabel})
      </label>
      <input
        type="text"
        value={value[lang] || ""}
        onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all placeholder-gray-300"
        placeholder={`Enter ${label.toLowerCase()} in ${langLabel}...`}
      />
    </div>
  );
}

const defaultTrustSignalsList: TrustSignal[] = [
  {
    id: "freeShipping",
    icon: "Truck",
    title: { en: "Free Shipping", es: "Envío Gratis" },
    description: { en: "On orders over $75", es: "En pedidos mayores a $75" },
    enabled: true,
    order: 0
  },
  {
    id: "securePayment",
    icon: "Shield",
    title: { en: "Secure Payment", es: "Pago Seguro" },
    description: { en: "100% protected checkout", es: "Compra 100% protegida" },
    enabled: true,
    order: 1
  },
  {
    id: "easyReturns",
    icon: "RotateCcw",
    title: { en: "Easy Returns", es: "Devoluciones Fáciles" },
    description: { en: "30-day return policy", es: "Política de devolución de 30 días" },
    enabled: true,
    order: 2
  },
  {
    id: "support",
    icon: "Headphones",
    title: { en: "Customer Support", es: "Soporte al Cliente" },
    description: { en: "We are here to help you", es: "Estamos para ayudarte" },
    enabled: true,
    order: 3
  }
];

export default function AdminHomeBuilderPage() {
  const { config, fetchConfig } = useTenant();
  const { isAuthenticated, isAdmin, isHydrated: isAuthHydrated } = useAuth();
  const { adminT, isHydrated: isLangHydrated } = useTranslations();
  const router = useRouter();

  const [editLang, setEditLang] = useState<"en" | "es">("en");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [trustSignals, setTrustSignals] = useState<TrustSignal[]>([]);
  const [categoriesConfig, setCategoriesConfig] = useState<CategoriesConfig>({
    layout: "grid",
    columns: 3,
    showDescription: true,
    showProductCount: false,
    cardStyle: "overlay",
    hoverEffect: "zoom",
    borderRadius: "2xl",
    maxHeight: "256px",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const configSyncedRef = useRef(false);

  // Auto-sync store states when config is available
  useEffect(() => {
    if (config?.homeConfig && !configSyncedRef.current) {
      configSyncedRef.current = true;
      setHeroSlides(config.homeConfig.heroSlides || []);
      setBanners(config.homeConfig.banners || []);
      
      const configSignals = config.homeConfig.trustSignals || [];
      if (configSignals.length > 0) {
        setTrustSignals(configSignals);
      } else {
        setTrustSignals(defaultTrustSignalsList);
      }

      if (config.homeConfig.categoriesConfig) {
        setCategoriesConfig(config.homeConfig.categoriesConfig);
      }
      setEditLang((config.homeConfig.defaultLanguage || "en") as "en" | "es");
    }
  }, [config]);

  const updateTrustSignal = (index: number, updates: Partial<TrustSignal>) => {
    const updated = [...trustSignals];
    updated[index] = { ...updated[index], ...updates };
    setTrustSignals(updated);
  };

  useEffect(() => {
    if (!isAuthHydrated) return;
    if (isAuthenticated && !isAdmin) {
      router.push("/");
    }
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, router, isAuthHydrated]);

  if (!isAuthenticated || !isAdmin) return null;
  if (!config) return null;

  const supportedLanguages = config.homeConfig?.supportedLanguages || ["en", "es"];

  const saveAll = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(
        "/store/home-config",
        {
          homeConfig: {
            heroSlides,
            banners,
            trustSignals,
            categoriesConfig,
          },
        },
        config.slug,
      );
      await fetchConfig(config.slug);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error saving configuration",
      );
    } finally {
      setSaving(false);
    }
  };

  const addHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      title: { en: "", es: "" },
      subtitle: { en: "", es: "" },
      imageUrl: "",
      ctaPrimary: { en: "Shop Now", es: "Comprar Ahora" },
      ctaSecondary: { en: "View Collections", es: "Ver Colecciones" },
      ctaPrimaryLink: "/catalog",
      ctaSecondaryLink: "/catalog",
      enabled: true,
      order: heroSlides.length,
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const updateHeroSlide = (index: number, updates: Partial<HeroSlide>) => {
    const updated = [...heroSlides];
    updated[index] = { ...updated[index], ...updates };
    setHeroSlides(updated);
  };

  const removeHeroSlide = (index: number) => {
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  };

  const addBanner = () => {
    const newBanner: Banner = {
      id: Date.now().toString(),
      title: { en: "", es: "" },
      description: { en: "", es: "" },
      imageUrl: "",
      link: "/catalog",
      enabled: true,
      order: banners.length,
    };
    setBanners([...banners, newBanner]);
  };

  const updateBanner = (index: number, updates: Partial<Banner>) => {
    const updated = [...banners];
    updated[index] = { ...updated[index], ...updates };
    setBanners(updated);
  };

  const removeBanner = (index: number) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const isReady = isAuthHydrated && isLangHydrated;

  if (!isReady) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">{adminT("homeBuilder")}</h2>
          <p className="text-gray-500 text-sm mt-1">
            Customize the storefront content layouts and details.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Active Editing Language Tabs */}
          {supportedLanguages.length > 1 && (
            <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setEditLang(lang as "en" | "es")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    editLang === lang
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {lang === "en" ? "English" : "Español"}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? adminT("saving") : adminT("saveChanges")}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-sm p-4 rounded-xl mb-6 font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {adminT("saved")}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Slides and Banners Builders */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Slides Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-400" />
                {adminT("heroSlides")}
              </h3>
              <button
                onClick={addHeroSlide}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-bold transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> {adminT("addSlide")}
              </button>
            </div>

            <div className="space-y-6">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/50 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-gray-800">
                      {adminT("slide")} #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateHeroSlide(index, { enabled: !slide.enabled })
                        }
                        className={`p-2 rounded-xl transition-colors ${
                          slide.enabled
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}
                      >
                        {slide.enabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeHeroSlide(index)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TranslationInput
                      label="Title"
                      value={slide.title}
                      lang={editLang}
                      onChange={(value) => updateHeroSlide(index, { title: value })}
                    />
                    <TranslationInput
                      label="Subtitle"
                      value={slide.subtitle}
                      lang={editLang}
                      onChange={(value) =>
                        updateHeroSlide(index, { subtitle: value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {adminT("imageUrl")}
                      </label>
                      <input
                        type="text"
                        value={slide.imageUrl}
                        onChange={(e) =>
                          updateHeroSlide(index, { imageUrl: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                        placeholder="https://example.com/slide.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {adminT("orderSorting")}
                      </label>
                      <input
                        type="number"
                        value={slide.order}
                        onChange={(e) =>
                          updateHeroSlide(index, {
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TranslationInput
                      label="Primary CTA"
                      value={slide.ctaPrimary}
                      lang={editLang}
                      onChange={(value) =>
                        updateHeroSlide(index, { ctaPrimary: value })
                      }
                    />
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {adminT("primaryCtaLink")}
                      </label>
                      <input
                        type="text"
                        value={slide.ctaPrimaryLink}
                        onChange={(e) =>
                          updateHeroSlide(index, { ctaPrimaryLink: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                        placeholder="/catalog"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TranslationInput
                      label="Secondary CTA"
                      value={slide.ctaSecondary}
                      lang={editLang}
                      onChange={(value) =>
                        updateHeroSlide(index, { ctaSecondary: value })
                      }
                    />
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {adminT("secondaryCtaLink")}
                      </label>
                      <input
                        type="text"
                        value={slide.ctaSecondaryLink}
                        onChange={(e) =>
                          updateHeroSlide(index, {
                            ctaSecondaryLink: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                        placeholder="/catalog"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {heroSlides.length === 0 && (
                <div className="text-center py-8 text-gray-400 font-semibold text-sm">
                  No slides yet. Click add slide above to create one.
                </div>
              )}
            </div>
          </div>

          {/* Banners Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-gray-400" />
                {adminT("promotionalBanners")}
              </h3>
              <button
                onClick={addBanner}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-bold transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> {adminT("addBanner")}
              </button>
            </div>

            <div className="space-y-6">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/50 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-gray-800">
                      {adminT("banner")} #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateBanner(index, { enabled: !banner.enabled })
                        }
                        className={`p-2 rounded-xl transition-colors ${
                          banner.enabled
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}
                      >
                        {banner.enabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeBanner(index)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TranslationInput
                      label="Title"
                      value={banner.title}
                      lang={editLang}
                      onChange={(value) => updateBanner(index, { title: value })}
                    />
                    <TranslationInput
                      label="Description"
                      value={banner.description}
                      lang={editLang}
                      onChange={(value) =>
                        updateBanner(index, { description: value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {adminT("imageUrl")}
                      </label>
                      <input
                        type="text"
                        value={banner.imageUrl}
                        onChange={(e) =>
                          updateBanner(index, { imageUrl: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {adminT("link")}
                      </label>
                      <input
                        type="text"
                        value={banner.link}
                        onChange={(e) =>
                          updateBanner(index, { link: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                        placeholder="/catalog"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {adminT("orderSorting")}
                      </label>
                      <input
                        type="number"
                        value={banner.order}
                        onChange={(e) =>
                          updateBanner(index, { order: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="text-center py-8 text-gray-400 font-semibold text-sm">
                  No banners yet. Click add banner above to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Layout settings and Explanation Cards */}
        <div className="space-y-8">
          
          {/* Categories Configuration Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-gray-400" />
              {adminT("categoriesSection")}
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {adminT("layout")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "grid", label: "Grid", icon: "⊞" },
                  { value: "masonry", label: "Masonry", icon: "▦" },
                  { value: "horizontal-scroll", label: "Scroll", icon: "←→" },
                  { value: "cards-icon", label: "Icons", icon: "🎯" },
                  { value: "cards-image", label: "Images", icon: "🖼️" },
                  { value: "list", label: "List", icon: "☰" },
                ].map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() =>
                      setCategoriesConfig({
                        ...categoriesConfig,
                        layout: layout.value as CategoriesConfig["layout"],
                      })
                    }
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      categoriesConfig.layout === layout.value
                        ? "border-gray-900 bg-gray-50 text-gray-900"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    <div className="text-xl mb-0.5">{layout.icon}</div>
                    <div className="text-xs font-bold">{layout.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {adminT("columns")}
                </label>
                <select
                  value={categoriesConfig.columns}
                  onChange={(e) =>
                    setCategoriesConfig({
                      ...categoriesConfig,
                      columns: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700"
                >
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                  <option value={6}>6 Columns</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {adminT("cardStyle")}
                </label>
                <select
                  value={categoriesConfig.cardStyle}
                  onChange={(e) =>
                    setCategoriesConfig({
                      ...categoriesConfig,
                      cardStyle: e.target.value as CategoriesConfig["cardStyle"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700"
                >
                  <option value="overlay">Overlay (text on image)</option>
                  <option value="bottom">Bottom (text below image)</option>
                  <option value="side">Side (text overlay at bottom)</option>
                  <option value="minimal">Minimal (hover reveal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {adminT("hoverEffect")}
                </label>
                <select
                  value={categoriesConfig.hoverEffect}
                  onChange={(e) =>
                    setCategoriesConfig({
                      ...categoriesConfig,
                      hoverEffect: e.target.value as CategoriesConfig["hoverEffect"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700"
                >
                  <option value="zoom">Zoom In</option>
                  <option value="slide">Slide Up</option>
                  <option value="fade">Fade</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {adminT("borderRadius")}
                </label>
                <select
                  value={categoriesConfig.borderRadius}
                  onChange={(e) =>
                    setCategoriesConfig({
                      ...categoriesConfig,
                      borderRadius: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700"
                >
                  <option value="none">None (square)</option>
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                  <option value="2xl">2X Large</option>
                  <option value="3xl">3X Large</option>
                  <option value="full">Full (circle)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {adminT("maxHeight")}
                </label>
                <select
                  value={categoriesConfig.maxHeight}
                  onChange={(e) =>
                    setCategoriesConfig({
                      ...categoriesConfig,
                      maxHeight: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700"
                >
                  <option value="200px">200px (small)</option>
                  <option value="256px">256px (medium)</option>
                  <option value="320px">320px (large)</option>
                  <option value="400px">400px (extra large)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoriesConfig.showDescription}
                    onChange={(e) =>
                      setCategoriesConfig({
                        ...categoriesConfig,
                        showDescription: e.target.checked,
                      })
                    }
                    className="rounded border-gray-200 text-gray-900 focus:ring-gray-900 h-5 w-5"
                  />
                  {adminT("showDescription")}
                </label>

                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoriesConfig.showProductCount}
                    onChange={(e) =>
                      setCategoriesConfig({
                        ...categoriesConfig,
                        showProductCount: e.target.checked,
                      })
                    }
                    className="rounded border-gray-200 text-gray-900 focus:ring-gray-900 h-5 w-5"
                  />
                  {adminT("showProductCount")}
                </label>
              </div>
            </div>
          </div>

          {/* Trust Signals & Educational Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                {adminT("trustSignals")}
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {adminT("trustSignalsDesc")}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Trust Signals List */}
              <div className="space-y-4">
                {trustSignals.map((signal, index) => (
                  <div
                    key={signal.id}
                    className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600 font-bold text-xs uppercase tracking-wide">
                        {signal.icon}
                      </span>
                      <button
                        onClick={() =>
                          updateTrustSignal(index, { enabled: !signal.enabled })
                        }
                        className={`p-2 rounded-xl transition-colors ${
                          signal.enabled
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}
                      >
                        {signal.enabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <TranslationInput
                        label="Title"
                        value={signal.title}
                        lang={editLang}
                        onChange={(value) =>
                          updateTrustSignal(index, { title: value })
                        }
                      />
                      <TranslationInput
                        label="Description"
                        value={signal.description}
                        lang={editLang}
                        onChange={(value) =>
                          updateTrustSignal(index, { description: value })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* What are Trust Signals Explanation */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-orange-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <HelpCircle className="h-4 w-4" /> ¿Qué son las Señales de Confianza?
                </h4>
                <p className="text-xs text-orange-950 font-medium leading-relaxed">
                  Son elementos gráficos informativos colocados en tu página de inicio para derribar las barreras de compra de tus clientes.
                </p>
                <ul className="text-[11px] text-orange-900 space-y-1.5 pl-1.5 list-disc list-inside font-semibold">
                  <li><strong>Envío Gratis:</strong> Reduce abandonos de carrito.</li>
                  <li><strong>Pago Seguro:</strong> Garantiza que sus datos bancarios están protegidos.</li>
                  <li><strong>Garantía/Devoluciones:</strong> Brinda tranquilidad y respalda tu calidad.</li>
                  <li><strong>Soporte Directo:</strong> Demuestra que hay un equipo real listo para ayudar.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
