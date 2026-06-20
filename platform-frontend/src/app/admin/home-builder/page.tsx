"use client";

import { useState, useEffect } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link as LinkIcon,
  LayoutGrid,
} from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import type { HeroSlide, Banner, TrustSignal, Translation, CategoriesConfig } from "@/stores/tenantStore";

interface TranslationInputProps {
  value: Translation;
  onChange: (value: Translation) => void;
  label: string;
}

function TranslationInput({ value, onChange, label }: TranslationInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase">English</span>
          <input
            type="text"
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
            placeholder="English text"
          />
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase">Español</span>
          <input
            type="text"
            value={value.es}
            onChange={(e) => onChange({ ...value, es: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
            placeholder="Texto en español"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminHomeBuilderPage() {
  const { config, fetchConfig } = useTenant();
  const { isAuthenticated, isAdmin , isHydrated} = useAuth();
  const router = useRouter();

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(config?.homeConfig?.heroSlides || []);
  const [banners, setBanners] = useState<Banner[]>(config?.homeConfig?.banners || []);
  const [trustSignals] = useState<TrustSignal[]>(config?.homeConfig?.trustSignals || []);
  const [categoriesConfig, setCategoriesConfig] = useState<CategoriesConfig>(config?.homeConfig?.categoriesConfig || {
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

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !isAdmin) {
      router.push("/");
    }
  }, [isAuthenticated, isAdmin, router, isHydrated]);

  const saveAll = async () => {
    if (!config) return;
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
        config.slug
      );
      await fetchConfig(config.slug);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving configuration");
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Home Builder</h2>
        <p className="text-gray-500 text-sm mt-1">
          Configure your homepage content in multiple languages.
        </p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: config?.theme.accentColor }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-6 font-semibold">
          Configuration saved successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Hero Slides Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hero Slides
          </h3>
          <button
            onClick={addHeroSlide}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        </div>

        <div className="space-y-4">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="border border-gray-200 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                  <span className="font-semibold text-sm">Slide {index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateHeroSlide(index, { enabled: !slide.enabled })}
                    className={`p-2 rounded ${
                      slide.enabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {slide.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => removeHeroSlide(index)}
                    className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TranslationInput
                  label="Title"
                  value={slide.title}
                  onChange={(value) => updateHeroSlide(index, { title: value })}
                />
                <TranslationInput
                  label="Subtitle"
                  value={slide.subtitle}
                  onChange={(value) => updateHeroSlide(index, { subtitle: value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={slide.imageUrl}
                    onChange={(e) => updateHeroSlide(index, { imageUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={slide.order}
                    onChange={(e) => updateHeroSlide(index, { order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TranslationInput
                  label="Primary CTA"
                  value={slide.ctaPrimary}
                  onChange={(value) => updateHeroSlide(index, { ctaPrimary: value })}
                />
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={slide.ctaPrimaryLink}
                    onChange={(e) => updateHeroSlide(index, { ctaPrimaryLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                    placeholder="/catalog"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TranslationInput
                  label="Secondary CTA"
                  value={slide.ctaSecondary}
                  onChange={(value) => updateHeroSlide(index, { ctaSecondary: value })}
                />
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Secondary CTA Link
                  </label>
                  <input
                    type="text"
                    value={slide.ctaSecondaryLink}
                    onChange={(e) => updateHeroSlide(index, { ctaSecondaryLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                    placeholder="/catalog"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banners Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Promotional Banners
          </h3>
          <button
            onClick={addBanner}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        </div>

        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="border border-gray-200 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                  <span className="font-semibold text-sm">Banner {index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateBanner(index, { enabled: !banner.enabled })}
                    className={`p-2 rounded ${
                      banner.enabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {banner.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => removeBanner(index)}
                    className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TranslationInput
                  label="Title"
                  value={banner.title}
                  onChange={(value) => updateBanner(index, { title: value })}
                />
                <TranslationInput
                  label="Description"
                  value={banner.description}
                  onChange={(value) => updateBanner(index, { description: value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={banner.imageUrl}
                    onChange={(e) => updateBanner(index, { imageUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Link
                  </label>
                  <input
                    type="text"
                    value={banner.link}
                    onChange={(e) => updateBanner(index, { link: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                    placeholder="/catalog"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={banner.order}
                    onChange={(e) => updateBanner(index, { order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Configuration Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Categories Section
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Layout</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: "grid", label: "Grid", icon: "⊞" },
                { value: "masonry", label: "Masonry", icon: "▦" },
                { value: "horizontal-scroll", label: "Horizontal Scroll", icon: "←→" },
                { value: "cards-icon", label: "Cards with Icons", icon: "🎯" },
                { value: "cards-image", label: "Cards with Images", icon: "🖼️" },
                { value: "list", label: "List", icon: "☰" },
              ].map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => setCategoriesConfig({ ...categoriesConfig, layout: layout.value as CategoriesConfig["layout"] })}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    categoriesConfig.layout === layout.value
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{layout.icon}</div>
                  <div className="text-sm font-semibold">{layout.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Columns</label>
              <select
                value={categoriesConfig.columns}
                onChange={(e) => setCategoriesConfig({ ...categoriesConfig, columns: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
                <option value={6}>6 Columns</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Card Style</label>
              <select
                value={categoriesConfig.cardStyle}
                onChange={(e) => setCategoriesConfig({ ...categoriesConfig, cardStyle: e.target.value as CategoriesConfig["cardStyle"] })}
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
              >
                <option value="overlay">Overlay (text on image)</option>
                <option value="bottom">Bottom (text below image)</option>
                <option value="side">Side (text overlay at bottom)</option>
                <option value="minimal">Minimal (hover reveal)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hover Effect</label>
              <select
                value={categoriesConfig.hoverEffect}
                onChange={(e) => setCategoriesConfig({ ...categoriesConfig, hoverEffect: e.target.value as CategoriesConfig["hoverEffect"] })}
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
              >
                <option value="zoom">Zoom In</option>
                <option value="slide">Slide Up</option>
                <option value="fade">Fade</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Border Radius</label>
              <select
                value={categoriesConfig.borderRadius}
                onChange={(e) => setCategoriesConfig({ ...categoriesConfig, borderRadius: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Max Height</label>
              <select
                value={categoriesConfig.maxHeight}
                onChange={(e) => setCategoriesConfig({ ...categoriesConfig, maxHeight: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
              >
                <option value="200px">200px (small)</option>
                <option value="256px">256px (medium)</option>
                <option value="320px">320px (large)</option>
                <option value="400px">400px (extra large)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={categoriesConfig.showDescription}
                onChange={(e) => setCategoriesConfig({ ...categoriesConfig, showDescription: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium">Show Description</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={categoriesConfig.showProductCount}
                onChange={(e) => setCategoriesConfig({ ...categoriesConfig, showProductCount: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium">Show Product Count</span>
            </label>
          </div>
        </div>
      </div>

      {/* Trust Signals Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-bold mb-4">Trust Signals</h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure the trust signals displayed on your homepage. These help build confidence with your customers.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          Trust signals are currently using default translations. To customize them, you&apos;ll need to update the translations in the code.
        </div>
      </div>
    </div>
  );
}
