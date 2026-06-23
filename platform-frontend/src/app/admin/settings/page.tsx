"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef, useMemo } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Save, Palette, CreditCard, Truck, Settings, CheckCircle, Layout, Plus, Trash2, ChevronUp, ChevronDown, Megaphone, Eye, EyeOff } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { useTranslations } from "@/hooks/useTranslations";
import type { FooterLink, FaqItem, AnnouncementItem } from "@/stores/tenantStore";

type Tab = "theme" | "payments" | "shipping" | "features" | "footer" | "announcements";

export default function AdminSettingsPage() {
  const { config, fetchConfig } = useTenant();
  const { isAuthenticated, isAdmin, isHydrated } = useAuth();
  const { adminT, setLanguage } = useTranslations();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("theme");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const configSyncedRef = useRef(false);

  // Theme states
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#333333");
  const [accentColor, setAccentColor] = useState("#f28c28");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  // General settings states
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Feature states
  const [loyaltyPoints, setLoyaltyPoints] = useState(false);
  const [coupons, setCoupons] = useState(true);
  const [reviews, setReviews] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);

  // Shipping states
  const [shippingProvider, setShippingProvider] = useState("correo_argentino");
  const [shippingApiKey, setShippingApiKey] = useState("");
  const [shippingOriginZip, setShippingOriginZip] = useState("");

  // Payment integration states
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");

  const [mpEnabled, setMpEnabled] = useState(false);
  const [mpPublicKey, setMpPublicKey] = useState("");
  const [mpAccessToken, setMpAccessToken] = useState("");

  // Language settings states
  const [defaultLanguage, setDefaultLanguage] = useState<"en" | "es">("en");
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(["en", "es"]);

  // Footer settings states
  const [footerPreset, setFooterPreset] = useState<"classic" | "minimalist" | "modern" | "newsletter">("classic");
  const [footerBgColorMode, setFooterBgColorMode] = useState<"dark" | "light" | "brand">("dark");
  const [footerDesc, setFooterDesc] = useState<{ en: string; es: string }>({ en: "", es: "" });
  const [openingHours, setOpeningHours] = useState("");
  const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);
  const [showSocials, setShowSocials] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [socialFb, setSocialFb] = useState("");
  const [socialIg, setSocialIg] = useState("");
  const [socialTw, setSocialTw] = useState("");
  const [socialTk, setSocialTk] = useState("");
  const [socialYt, setSocialYt] = useState("");

  // Footer & Pages dynamic states
  const [customLinks, setCustomLinks] = useState<FooterLink[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [termsOfService, setTermsOfService] = useState<{ en: string; es: string }>({ en: "", es: "" });
  const [privacyPolicy, setPrivacyPolicy] = useState<{ en: string; es: string }>({ en: "", es: "" });
  
  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated && !isAdmin) {
      router.push("/");
    }
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, router, isHydrated]);

  useEffect(() => {
    if (config && !configSyncedRef.current) {
      configSyncedRef.current = true;
      setPrimaryColor(config.theme.primaryColor || "#000000");
      setSecondaryColor(config.theme.secondaryColor || "#333333");
      setAccentColor(config.theme.accentColor || "#f28c28");
      setHeroTitle(config.theme.heroTitle || "");
      setHeroSubtitle(config.theme.heroSubtitle || "");
      setLogoUrl(config.theme.logoUrl || "");
      setHeroImageUrl(config.theme.heroImageUrl || "");
      setWhatsappNumber(config.settings.whatsappNumber || "");
      setEmail(config.settings.email || "");
      setPhone(config.settings.phone || "");
      setAddress(config.settings.address || "");
      setCurrency(config.settings.currency || "USD");
      setLoyaltyPoints(config.settings.features.loyaltyPoints || false);
      setCoupons(config.settings.features.coupons ?? true);
      setReviews(config.settings.features.reviews ?? true);
      setEmailMarketing(config.settings.features.emailMarketing || false);

      const lc = (config.settings.shippingMethods?.find((m) => m.type === "local_carrier")?.config || {}) as Record<string, string>;
      setShippingProvider(lc.provider || "correo_argentino");
      setShippingApiKey(lc.apiKey || "");
      setShippingOriginZip(lc.originZipCode || "");

      const stripeM = config.settings.paymentMethods?.find((m) => m.type === "stripe");
      setStripeEnabled(stripeM?.enabled || false);
      const stripeConfig = (stripeM?.config || {}) as Record<string, string>;
      setStripePublicKey(stripeConfig.publicKey || "");
      setStripeSecretKey(stripeConfig.secretKey || "");
      setStripeWebhookSecret(stripeConfig.webhookSecret || "");

      const mpM = config.settings.paymentMethods?.find((m) => m.type === "mercadopago");
      setMpEnabled(mpM?.enabled || false);
      const mpConfig = (mpM?.config || {}) as Record<string, string>;
      setMpPublicKey(mpConfig.publicKey || "");
      setMpAccessToken(mpConfig.accessToken || "");

      setDefaultLanguage((config.homeConfig?.defaultLanguage || "en") as "en" | "es");
      setSupportedLanguages(config.homeConfig?.supportedLanguages || ["en", "es"]);

      if (config.settings.footer) {
        setFooterPreset(config.settings.footer.preset || "classic");
        setFooterBgColorMode(config.settings.footer.bgColorMode || "dark");
        setFooterDesc({
          en: config.settings.footer.description?.en || "",
          es: config.settings.footer.description?.es || "",
        });
        setShowSocials(config.settings.footer.showSocials ?? true);
        setShowPaymentMethods(config.settings.footer.showPaymentMethods ?? true);
        setShowContactInfo(config.settings.footer.showContactInfo ?? true);
        setShowNewsletter(config.settings.footer.showNewsletter ?? false);
        const sl = config.settings.footer.socialLinks || {};
        setSocialFb(sl.facebook || "");
        setSocialIg(sl.instagram || "");
        setSocialTw(sl.twitter || "");
        setSocialTk(sl.tiktok || "");
        setSocialYt(sl.youtube || "");

        // Populate links, faqs and policies
        setCustomLinks(config.settings.footer.customLinks || []);
        setTermsOfService({
          en: config.settings.footer.termsOfService?.en || "",
          es: config.settings.footer.termsOfService?.es || "",
        });
        setPrivacyPolicy({
          en: config.settings.footer.privacyPolicy?.en || "",
          es: config.settings.footer.privacyPolicy?.es || "",
        });
        setFeaturedCategories(config.settings.footer.featuredCategories || []);
      }
      setOpeningHours(config.settings.openingHours || "");

      // Populate FAQs from homeConfig
      setFaqItems(config.homeConfig?.faqItems || []);

      // Populate Announcements from homeConfig
      setAnnouncements(config.homeConfig?.announcements || []);
    }
  }, [config]);

  const logoPreviewUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile],
  );
  const heroPreviewUrl = useMemo(
    () => (heroImageFile ? URL.createObjectURL(heroImageFile) : null),
    [heroImageFile],
  );

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      if (heroPreviewUrl) URL.revokeObjectURL(heroPreviewUrl);
    };
  }, [logoPreviewUrl, heroPreviewUrl]);

  if (!isAuthenticated || !isAdmin) return null;
  if (!config) return null;

  const saveTheme = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "theme",
        JSON.stringify({
          primaryColor,
          secondaryColor,
          accentColor,
          heroTitle,
          heroSubtitle,
          logoUrl,
          heroImageUrl,
        }),
      );

      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (heroImageFile) {
        formData.append("heroImage", heroImageFile);
      }

      await api.put("/store/theme", formData, config.slug);

      await fetchConfig(config.slug);
      setSaved(true);
      setLogoFile(null);
      setHeroImageFile(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving theme:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put(
        "/store",
        {
          settings: {
            whatsappNumber,
            email,
            phone,
            address,
            openingHours,
            currency,
            features: { loyaltyPoints, coupons, reviews, emailMarketing },
            footer: {
              preset: footerPreset,
              bgColorMode: footerBgColorMode,
              description: footerDesc,
              showSocials,
              showPaymentMethods,
              showContactInfo,
              showNewsletter,
              socialLinks: {
                facebook: socialFb,
                instagram: socialIg,
                twitter: socialTw,
                tiktok: socialTk,
                youtube: socialYt
              },
              customLinks,
              termsOfService,
              privacyPolicy,
              featuredCategories
            },
            shippingMethods: [
              {
                type: "local_carrier",
                enabled: !!shippingApiKey,
                config: {
                  provider: shippingProvider,
                  apiKey: shippingApiKey,
                  originZipCode: shippingOriginZip
                }
              }
            ],
            paymentMethods: [
              {
                type: "whatsapp",
                enabled: true,
                config: {}
              },
              {
                type: "stripe",
                enabled: stripeEnabled,
                config: {
                  publicKey: stripePublicKey,
                  secretKey: stripeSecretKey,
                  webhookSecret: stripeWebhookSecret
                }
              },
              {
                type: "mercadopago",
                enabled: mpEnabled,
                config: {
                  publicKey: mpPublicKey,
                  accessToken: mpAccessToken
                }
              }
            ]
          },
          homeConfig: {
            defaultLanguage,
            supportedLanguages,
            faqItems,
            announcements
          }
        },
        config.slug,
      );
      await fetchConfig(config.slug);
      setLanguage(defaultLanguage);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSupportedLang = (lang: string) => {
    if (supportedLanguages.includes(lang)) {
      if (supportedLanguages.length > 1) {
        setSupportedLanguages(supportedLanguages.filter(l => l !== lang));
      }
    } else {
      setSupportedLanguages([...supportedLanguages, lang]);
    }
  };

  const toggleCategoryFeatured = (catId: string) => {
    if (featuredCategories.includes(catId)) {
      setFeaturedCategories(featuredCategories.filter((id) => id !== catId));
    } else {
      setFeaturedCategories([...featuredCategories, catId]);
    }
  };

  const addCustomLink = () => {
    const newLink: FooterLink = {
      id: Math.random().toString(36).substring(2, 9),
      label: { en: "", es: "" },
      url: "",
      order: customLinks.length,
    };
    setCustomLinks([...customLinks, newLink]);
  };

  const updateLink = (id: string, field: string, value: string) => {
    setCustomLinks(
      customLinks.map((link) => {
        if (link.id !== id) return link;
        if (field === "label") {
          return { ...link, label: { en: value, es: value } };
        }
        if (field === "url") {
          return { ...link, url: value };
        }
        return link;
      })
    );
  };

  const deleteLink = (id: string) => {
    const filtered = customLinks.filter((link) => link.id !== id);
    const ordered = filtered.map((link, idx) => ({ ...link, order: idx }));
    setCustomLinks(ordered);
  };

  const moveLink = (index: number, direction: "up" | "down") => {
    const newLinks = [...customLinks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;

    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    const ordered = newLinks.map((link, idx) => ({ ...link, order: idx }));
    setCustomLinks(ordered);
  };

  const addFaqItem = () => {
    const newFaq: FaqItem = {
      id: Math.random().toString(36).substring(2, 9),
      question: { en: "", es: "" },
      answer: { en: "", es: "" },
      enabled: true,
      order: faqItems.length,
    };
    setFaqItems([...faqItems, newFaq]);
  };

  const updateFaq = (id: string, field: string, value: string) => {
    setFaqItems(
      faqItems.map((faq) => {
        if (faq.id !== id) return faq;
        if (field === "question") {
          return { ...faq, question: { en: value, es: value } };
        }
        if (field === "answer") {
          return { ...faq, answer: { en: value, es: value } };
        }
        return faq;
      })
    );
  };

  const deleteFaq = (id: string) => {
    const filtered = faqItems.filter((faq) => faq.id !== id);
    const ordered = filtered.map((faq, idx) => ({ ...faq, order: idx }));
    setFaqItems(ordered);
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    const newFaqs = [...faqItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFaqs.length) return;

    const temp = newFaqs[index];
    newFaqs[index] = newFaqs[targetIndex];
    newFaqs[targetIndex] = temp;

    const ordered = newFaqs.map((faq, idx) => ({ ...faq, order: idx }));
    setFaqItems(ordered);
  };

  const addAnnouncement = () => {
    const newAnn = {
      id: Math.random().toString(36).substring(2, 9),
      text: "",
      icon: "Info",
      enabled: true,
      order: announcements.length,
    };
    setAnnouncements([...announcements, newAnn]);
  };

  const updateAnnouncement = (id: string, field: keyof AnnouncementItem, value: string | boolean | number) => {
    setAnnouncements(
      announcements.map((ann) => {
        if (ann.id !== id) return ann;
        return { ...ann, [field]: value };
      })
    );
  };

  const deleteAnnouncement = (id: string) => {
    const filtered = announcements.filter((ann) => ann.id !== id);
    const ordered = filtered.map((ann, idx) => ({ ...ann, order: idx }));
    setAnnouncements(ordered);
  };

  const moveAnnouncement = (index: number, direction: "up" | "down") => {
    const newAnns = [...announcements];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAnns.length) return;

    const temp = newAnns[index];
    newAnns[index] = newAnns[targetIndex];
    newAnns[targetIndex] = temp;

    const ordered = newAnns.map((ann, idx) => ({ ...ann, order: idx }));
    setAnnouncements(ordered);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "theme", label: adminT("themeSettings"), icon: <Palette className="h-4 w-4" /> },
    { id: "announcements", label: adminT("announcementsSettings"), icon: <Megaphone className="h-4 w-4" /> },
    { id: "payments", label: adminT("paymentSettings"), icon: <CreditCard className="h-4 w-4" /> },
    { id: "shipping", label: adminT("shippingSettings"), icon: <Truck className="h-4 w-4" /> },
    { id: "features", label: adminT("features"), icon: <Settings className="h-4 w-4" /> },
    { id: "footer", label: adminT("footerSettings"), icon: <Layout className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{adminT("settings")}</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Customize your store&apos;s appearance and functionality.
      </p>

      {saved && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-sm p-4 rounded-xl mb-6 font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {adminT("saved")}
        </div>
      )}

      <div className="flex gap-2 mb-8 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "theme" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-extrabold text-gray-800">{adminT("themeSettings")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 rounded-xl border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-10 rounded-xl border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-10 rounded-xl border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Logo URL or Upload Image
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold"
              />
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none"
                placeholder="Or paste an image URL here..."
              />
            </div>
            {logoUrl && !logoFile && (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="h-16 mt-2 object-contain"
              />
            )}
            {logoFile && (
              <img
                src={logoPreviewUrl || ""}
                alt="Logo preview"
                className="h-16 mt-2 object-contain"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Hero Image URL or Upload Image
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold"
              />
              <input
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none"
                placeholder="Or paste an image URL here..."
              />
            </div>
            {heroImageUrl && !heroImageFile && (
              <img
                src={heroImageUrl}
                alt="Hero preview"
                className="h-32 mt-2 object-cover rounded-xl w-full max-w-md"
              />
            )}
            {heroImageFile && (
              <img
                src={heroPreviewUrl || ""}
                alt="Hero preview"
                className="h-32 mt-2 object-cover rounded-xl w-full max-w-md"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hero Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Hero Subtitle
            </label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none"
            />
          </div>

          <button
            onClick={saveTheme}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Save className="h-4 w-4" /> {saving ? adminT("saving") : adminT("save")}
          </button>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-extrabold text-gray-800">{adminT("paymentSettings")}</h2>

          {/* WhatsApp Settings */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {adminT("whatsappNumber")}
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none"
              placeholder="5491112345678"
            />
            <p className="text-[10px] text-gray-400 font-medium mt-1">
              Include country code, no spaces or dashes (e.g. 5491133334444).
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Mercado Pago Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm">{adminT("mpConfig")}</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{adminT("mpDesc")}</p>
              </div>
              <button
                onClick={() => setMpEnabled(!mpEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${mpEnabled ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${mpEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>

            {mpEnabled && (
              <div className="grid grid-cols-1 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    {adminT("mpPublicKey")}
                  </label>
                  <input
                    type="text"
                    value={mpPublicKey}
                    onChange={(e) => setMpPublicKey(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl font-semibold text-sm focus:outline-none"
                    placeholder="APP_USR-..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    {adminT("mpAccessToken")}
                  </label>
                  <input
                    type="password"
                    value={mpAccessToken}
                    onChange={(e) => setMpAccessToken(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl font-semibold text-sm focus:outline-none"
                    placeholder="APP_USR-..."
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Stripe Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm">{adminT("stripeConfig")}</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{adminT("stripeDesc")}</p>
              </div>
              <button
                onClick={() => setStripeEnabled(!stripeEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${stripeEnabled ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${stripeEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>

            {stripeEnabled && (
              <div className="grid grid-cols-1 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    {adminT("stripePublicKey")}
                  </label>
                  <input
                    type="text"
                    value={stripePublicKey}
                    onChange={(e) => setStripePublicKey(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl font-semibold text-sm focus:outline-none"
                    placeholder="pk_test_..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    {adminT("stripeSecretKey")}
                  </label>
                  <input
                    type="password"
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl font-semibold text-sm focus:outline-none"
                    placeholder="sk_test_..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    {adminT("stripeWebhookSecret")}
                  </label>
                  <input
                    type="password"
                    value={stripeWebhookSecret}
                    onChange={(e) => setStripeWebhookSecret(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl font-semibold text-sm focus:outline-none"
                    placeholder="whsec_..."
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Save className="h-4 w-4" /> {saving ? adminT("saving") : adminT("saveSettings")}
          </button>
        </div>
      )}

      {activeTab === "shipping" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-extrabold text-gray-800">{adminT("shippingSettings")}</h2>

          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h3 className="font-extrabold text-sm mb-1 text-gray-800">{adminT("carrierIntegration")}</h3>
            <p className="text-xs text-gray-400 mb-4 font-medium">
              {adminT("carrierDesc")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{adminT("shippingProvider")}</label>
                <select
                  value={shippingProvider}
                  onChange={(e) => setShippingProvider(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700"
                >
                  <option value="correo_argentino">Correo Argentino</option>
                  <option value="andreani">Andreani</option>
                  <option value="fedex">FedEx</option>
                  <option value="custom">Custom Flat Rate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{adminT("shippingApiKey")}</label>
                <input
                  type="password"
                  value={shippingApiKey}
                  onChange={(e) => setShippingApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{adminT("shippingOriginZip")}</label>
                <input
                  type="text"
                  value={shippingOriginZip}
                  onChange={(e) => setShippingOriginZip(e.target.value)}
                  placeholder="e.g. 1425"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 font-medium mt-1">Used to calculate distance to customer.</p>
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Save className="h-4 w-4" /> {saving ? adminT("saving") : adminT("saveSettings")}
          </button>
        </div>
      )}

      {activeTab === "features" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-extrabold text-gray-800">{adminT("features")}</h2>

          {[
            {
              label: adminT("loyaltyPoints"),
              desc: "Customers earn points on purchases",
              value: loyaltyPoints,
              setter: setLoyaltyPoints,
            },
            {
              label: adminT("enableCoupons"),
              desc: "Allow discount codes at checkout",
              value: coupons,
              setter: setCoupons,
            },
            {
              label: adminT("enableReviews"),
              desc: "Show customer testimonials on homepage",
              value: reviews,
              setter: setReviews,
            },
            {
              label: adminT("emailMarketing"),
              desc: "Send promotional emails to customers",
              value: emailMarketing,
              setter: setEmailMarketing,
            },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div>
                <p className="font-bold text-gray-800 text-sm">{feature.label}</p>
                <p className="text-xs text-gray-400 font-medium">{feature.desc}</p>
              </div>
              <button
                onClick={() => feature.setter(!feature.value)}
                className={`relative h-6 w-11 rounded-full transition-colors ${feature.value ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${feature.value ? "translate-x-5" : ""}`}
                />
              </button>
            </div>
          ))}

          <hr className="border-gray-100" />

          {/* Currency Configuration */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{adminT("currency")}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="ARS">ARS - Argentine Peso</option>
              <option value="MXN">MXN - Mexican Peso</option>
              <option value="BRL">BRL - Brazilian Real</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* Store Language Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {adminT("storeLanguage")}
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => {
                  const lang = e.target.value as "en" | "es";
                  setDefaultLanguage(lang);
                  setLanguage(lang);
                }}
                className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 w-full"
              >
                <option value="en">{adminT("english")}</option>
                <option value="es">{adminT("spanish")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {adminT("supportedLanguages")}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportedLanguages.includes("en")}
                    onChange={() => toggleSupportedLang("en")}
                    className="rounded border-gray-200 text-gray-900 focus:ring-gray-900 h-5 w-5"
                  />
                  {adminT("english")}
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportedLanguages.includes("es")}
                    onChange={() => toggleSupportedLang("es")}
                    className="rounded border-gray-200 text-gray-900 focus:ring-gray-900 h-5 w-5"
                  />
                  {adminT("spanish")}
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Save className="h-4 w-4" /> {saving ? adminT("saving") : adminT("saveSettings")}
          </button>
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm text-left">{adminT("announcementsSettings")}</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5 text-left">{adminT("announcementsDesc")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addAnnouncement}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold transition-transform hover:scale-[1.02] shadow-sm"
            >
              <Plus className="h-4 w-4" /> {adminT("addAnnouncement")}
            </button>
          </div>

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-4">
                <p className="text-xs text-gray-500 font-bold mb-2">
                  No hay anuncios configurados aún.
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Haz clic en &quot;Añadir Anuncio&quot; para crear tu primer anuncio para la barra superior.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {announcements.map((ann, idx) => (
                  <div key={ann.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-500">Anuncio #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveAnnouncement(idx, "up")}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === announcements.length - 1}
                          onClick={() => moveAnnouncement(idx, "down")}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAnnouncement(ann.id, "enabled", !ann.enabled)}
                          className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${ann.enabled ? "text-green-600" : "text-gray-400"}`}
                          title={ann.enabled ? "Desactivar" : "Activar"}
                        >
                          {ann.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAnnouncement(ann.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">
                          {adminT("announcementText")}
                        </label>
                        <input
                          type="text"
                          value={ann.text || ""}
                          onChange={(e) => updateAnnouncement(ann.id, "text", e.target.value)}
                          placeholder="Ej. ¡Envío gratis en compras mayores a $50!"
                          className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900/5 text-left"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">
                          {adminT("announcementIcon")}
                        </label>
                        <select
                          value={ann.icon || "Info"}
                          onChange={(e) => updateAnnouncement(ann.id, "icon", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900/5 text-gray-700 text-left"
                        >
                          <option value="Info">Información (Info)</option>
                          <option value="Truck">Envío / Camión (Truck)</option>
                          <option value="Tag">Etiqueta / Descuento (Tag)</option>
                          <option value="Gift">Regalo (Gift)</option>
                          <option value="AlertCircle">Alerta (AlertCircle)</option>
                          <option value="Sparkles">Estrellas / Novedad (Sparkles)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 text-left">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-[1.02]"
            >
              <Save className="h-4 w-4" /> {saving ? adminT("saving") : adminT("saveSettings")}
            </button>
          </div>
        </div>
      )}

      {activeTab === "footer" && (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              {adminT("footerSettings") || "Footer & Pages Settings"}
            </h3>
            <p className="text-gray-500 text-sm">
              {adminT("footerDesc") || "Configure footer design, navigation links, FAQ list and legal policy text."}
            </p>
          </div>

          {/* Columna 1: Marca & Redes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Layout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm">Columna 1: Marca & Redes Sociales</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Define la descripción del negocio y los enlaces a redes sociales.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Descripción Corta del Negocio
                </label>
                <textarea
                  value={footerDesc.es || footerDesc.en || ""}
                  onChange={(e) => setFooterDesc({ en: e.target.value, es: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all placeholder-gray-300"
                  placeholder="Introduce una breve descripción de tu tienda..."
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-50 mt-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-xs">Mostrar Iconos de Redes Sociales</h4>
                  <p className="text-[10px] text-gray-400">Si lo desactivas, no se mostrarán enlaces a redes en el footer.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSocials(!showSocials)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${showSocials ? "bg-gray-900" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${showSocials ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {showSocials && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    { id: "fb", value: socialFb, onChange: setSocialFb, label: "Facebook", placeholder: "https://facebook.com/..." },
                    { id: "ig", value: socialIg, onChange: setSocialIg, label: "Instagram", placeholder: "https://instagram.com/..." },
                    { id: "tw", value: socialTw, onChange: setSocialTw, label: "Twitter / X", placeholder: "https://twitter.com/..." },
                    { id: "tk", value: socialTk, onChange: setSocialTk, label: "TikTok", placeholder: "https://tiktok.com/@..." },
                    { id: "yt", value: socialYt, onChange: setSocialYt, label: "YouTube", placeholder: "https://youtube.com/..." },
                  ].map((social) => (
                    <div key={social.id} className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {social.label}
                      </label>
                      <input
                        type="text"
                        value={social.value}
                        onChange={(e) => social.onChange(e.target.value)}
                        placeholder={social.placeholder}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all placeholder-gray-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Layout className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm">Columna 2: Enlaces Rápidos</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Administra enlaces de navegación rápidos personalizados.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addCustomLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold transition-transform hover:scale-[1.02] shadow-sm"
              >
                <Plus className="h-4 w-4" /> {adminT("addLink") || "Añadir Enlace"}
              </button>
            </div>

            <div className="space-y-4">
              {customLinks.length === 0 ? (
                <div className="text-center py-6 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 font-bold mb-2">
                    No hay enlaces personalizados configurados.
                  </p>
                  <p className="text-[10px] text-gray-450 font-medium">
                    Se mostrarán los enlaces de respaldo: Inicio, Productos, Ofertas, Contacto y Preguntas Frecuentes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {customLinks.map((link, idx) => (
                    <div key={link.id} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex sm:flex-col gap-1 items-center">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveLink(idx, "up")}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        </button>
                        <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                        <button
                          type="button"
                          disabled={idx === customLinks.length - 1}
                          onClick={() => moveLink(idx, "down")}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {adminT("linkLabel") || "Etiqueta"}
                          </label>
                          <input
                            type="text"
                            value={link.label.es || link.label.en || ""}
                            onChange={(e) => updateLink(link.id, "label", e.target.value)}
                            placeholder="Ej. Sobre Nosotros"
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {adminT("linkUrl") || "Ruta o URL"}
                          </label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateLink(link.id, "url", e.target.value)}
                            placeholder="Ej. /catalog o https://..."
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteLink(link.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors self-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna 3: Categorías Destacadas */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm">Columna 3: Categorías Destacadas</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Selecciona qué categorías de tu tienda deseas destacar.</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-4 font-semibold">
                Marca las categorías que quieras mostrar en el pie de página. Si no seleccionas ninguna, se mostrarán las primeras 5 categorías activas de tu tienda como respaldo.
              </p>

              {!config.categories || config.categories.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No tienes categorías creadas en tu tienda.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {config.categories.map((cat) => {
                    const isChecked = featuredCategories.includes(cat._id);
                    return (
                      <label
                        key={cat._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "border-gray-900 bg-gray-50 text-gray-900 shadow-sm font-bold"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 font-medium"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategoryFeatured(cat._id)}
                          className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 h-4.5 w-4.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-700">{cat.name}</span>
                          <span className="text-[9px] text-gray-400">/{cat.slug}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Columna 4: Información de Contacto & Horarios */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm">Columna 4: Información de Contacto & Horarios</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Configura los datos comerciales. Los campos vacíos no se dibujarán en el footer, ideal para negocios 100% online.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    WhatsApp Comercial
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                    placeholder="Ej. 5491112345678"
                  />
                  <p className="text-[9px] text-gray-400 font-medium mt-1">
                    Incluye código de país, sin espacios ni guiones (ej. 5491133334444).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                    placeholder="Ej. +54 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                    placeholder="Ej. contacto@mitienda.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                    placeholder="Ej. Av. Siempreviva 742, CABA"
                  />
                  <p className="text-[9px] text-gray-400 font-medium mt-1">
                    Deja vacío si eres una tienda 100% online sin local físico.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Horarios de Atención
                  </label>
                  <textarea
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all"
                    placeholder="Ej. Lunes a Viernes de 9:00 a 18:00 hs"
                  />
                  <p className="text-[9px] text-gray-400 font-medium mt-1">
                    Deja vacío si tu negocio no cuenta con horarios fijos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Manager */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm">Preguntas Frecuentes (FAQs)</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Administra las preguntas y respuestas frecuentes de tu tienda.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold transition-transform hover:scale-[1.02] shadow-sm"
              >
                <Plus className="h-4 w-4" /> {adminT("addFaq") || "Añadir FAQ"}
              </button>
            </div>

            <div className="space-y-4">
              {faqItems.length === 0 ? (
                <div className="text-center py-6 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 font-bold mb-2">
                    No hay preguntas frecuentes configuradas aún.
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Haz clic en &quot;Añadir FAQ&quot; para crear la primera pregunta.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {faqItems.map((faq, idx) => (
                    <div key={faq.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-bold text-gray-500">Pregunta Frecuente #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveFaq(idx, "up")}
                            className="p-1 rounded hover:bg-gray-250 disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === faqItems.length - 1}
                            onClick={() => moveFaq(idx, "down")}
                            className="p-1 rounded hover:bg-gray-250 disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFaq(faq.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {adminT("faqQuestion") || "Pregunta"}
                          </label>
                          <input
                            type="text"
                            value={faq.question.es || faq.question.en || ""}
                            onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                            placeholder="Ej. ¿Hacen envíos a todo el país?"
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {adminT("faqAnswer") || "Respuesta"}
                          </label>
                          <textarea
                            value={faq.answer.es || faq.answer.en || ""}
                            onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                            rows={2}
                            placeholder="Ej. Sí, realizamos despachos a todas las provincias..."
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Barra Inferior y Páginas Legales */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm">Barra Inferior & Páginas Legales</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Escribe el contenido legal de los Términos y Condiciones y de la Política de Privacidad de tu tienda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Términos y Condiciones del Servicio
                </label>
                <textarea
                  value={termsOfService.es || termsOfService.en || ""}
                  onChange={(e) => setTermsOfService({ en: e.target.value, es: e.target.value })}
                  rows={8}
                  placeholder="Escribe aquí los Términos y Condiciones de uso..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Política de Privacidad
                </label>
                <textarea
                  value={privacyPolicy.es || privacyPolicy.en || ""}
                  onChange={(e) => setPrivacyPolicy({ en: e.target.value, es: e.target.value })}
                  rows={8}
                  placeholder="Escribe aquí la Política de Privacidad y uso de datos..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-750 focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all placeholder-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-[1.02]"
            >
              <Save className="h-4 w-4" /> {saving ? adminT("saving") : adminT("saveSettings")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
