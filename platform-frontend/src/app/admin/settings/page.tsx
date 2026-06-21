"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Save, Palette, Truck, CreditCard, Settings } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

type Tab = "theme" | "payments" | "shipping" | "features";

export default function AdminSettingsPage() {
  const { config, fetchConfig } = useTenant();
  const { isAuthenticated, isAdmin, isHydrated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("theme");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const configSyncedRef = useRef(false);

  const [primaryColor, setPrimaryColor] = useState(
    config?.theme.primaryColor || "#000000",
  );
  const [secondaryColor, setSecondaryColor] = useState(
    config?.theme.secondaryColor || "#333333",
  );
  const [accentColor, setAccentColor] = useState(
    config?.theme.accentColor || "#f28c28",
  );
  const [heroTitle, setHeroTitle] = useState(config?.theme.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(
    config?.theme.heroSubtitle || "",
  );
  const [logoUrl, setLogoUrl] = useState(config?.theme.logoUrl || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState(
    config?.theme.heroImageUrl || "",
  );
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  const [whatsappNumber, setWhatsappNumber] = useState(
    config?.settings.whatsappNumber || "",
  );
  const [email, setEmail] = useState(config?.settings.email || "");
  const [phone, setPhone] = useState(config?.settings.phone || "");
  const [currency, setCurrency] = useState(config?.settings.currency || "USD");

  const [loyaltyPoints, setLoyaltyPoints] = useState(
    config?.settings.features.loyaltyPoints || false,
  );
  const [coupons, setCoupons] = useState(
    config?.settings.features.coupons ?? true,
  );
  const [reviews, setReviews] = useState(
    config?.settings.features.reviews ?? true,
  );
  const [emailMarketing, setEmailMarketing] = useState(
    config?.settings.features.emailMarketing || false,
  );

  const localCarrierMethod = config?.settings?.shippingMethods?.find(m => m.type === "local_carrier")?.config || {};
  const [shippingProvider, setShippingProvider] = useState(localCarrierMethod.provider || "correo_argentino");
  const [shippingApiKey, setShippingApiKey] = useState(localCarrierMethod.apiKey || "");
  const [shippingOriginZip, setShippingOriginZip] = useState(localCarrierMethod.originZipCode || "");

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
      setPrimaryColor(config.theme.primaryColor);
      setSecondaryColor(config.theme.secondaryColor);
      setAccentColor(config.theme.accentColor);
      setHeroTitle(config.theme.heroTitle);
      setHeroSubtitle(config.theme.heroSubtitle);
      setLogoUrl(config.theme.logoUrl);
      setHeroImageUrl(config.theme.heroImageUrl);
      setWhatsappNumber(config.settings.whatsappNumber);
      setEmail(config.settings.email);
      setPhone(config.settings.phone);
      setCurrency(config.settings.currency);
      setLoyaltyPoints(config.settings.features.loyaltyPoints);
      setCoupons(config.settings.features.coupons);
      setReviews(config.settings.features.reviews);
      setEmailMarketing(config.settings.features.emailMarketing);

      const lc = config.settings.shippingMethods?.find((m: any) => m.type === "local_carrier")?.config || {};
      setShippingProvider(lc.provider || "correo_argentino");
      setShippingApiKey(lc.apiKey || "");
      setShippingOriginZip(lc.originZipCode || "");
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
            currency,
            features: { loyaltyPoints, coupons, reviews, emailMarketing },
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
            ]
          },
        },
        config.slug,
      );
      await fetchConfig(config.slug);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "theme", label: "Theme", icon: <Palette className="h-4 w-4" /> },
    {
      id: "payments",
      label: "Payments",
      icon: <CreditCard className="h-4 w-4" />,
    },
    { id: "shipping", label: "Shipping", icon: <Truck className="h-4 w-4" /> },
    {
      id: "features",
      label: "Features",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <h2 className="text-2xl font-bold mb-2">Store Settings</h2>
      <p className="text-gray-500 mb-6">
        Customize your store&apos;s appearance and functionality.
      </p>

      {saved && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-6 font-semibold">
          Settings saved successfully!
        </div>
      )}

      <div className="flex gap-2 mb-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "theme" && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <h2 className="text-lg font-bold">Appearance</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 rounded border"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-10 rounded border"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-10 rounded border"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Logo URL or Upload Image
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
              />
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
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
            <label className="block text-sm font-bold mb-2">
              Hero Image URL or Upload Image
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
              />
              <input
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
                placeholder="Or paste an image URL here..."
              />
            </div>
            {heroImageUrl && !heroImageFile && (
              <img
                src={heroImageUrl}
                alt="Hero preview"
                className="h-32 mt-2 object-cover rounded-lg w-full max-w-md"
              />
            )}
            {heroImageFile && (
              <img
                src={heroPreviewUrl || ""}
                alt="Hero preview"
                className="h-32 mt-2 object-cover rounded-lg w-full max-w-md"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Hero Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Hero Subtitle
            </label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
            />
          </div>

          <button
            onClick={saveTheme}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Theme"}
          </button>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <h2 className="text-lg font-bold">Payment Configuration</h2>

          <div>
            <label className="block text-sm font-bold mb-2">
              WhatsApp Number (for orders)
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              placeholder="5491112345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code, no spaces or dashes.
            </p>
          </div>

          <hr />

          <h3 className="font-bold">MercadoPago</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Enable MercadoPago to accept payments via credit/debit cards, bank
              transfers, and cash. You need a MercadoPago account and an access
              token.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Get your access token at:{" "}
              <a
                href="https://www.mercadopago.com/developers/panel"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                MercadoPago Developers Panel
              </a>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              Configure MercadoPago credentials through the Super Admin panel or
              environment variables.
            </p>
          </div>

          <hr />

          <h3 className="font-bold">Stripe</h3>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-700">
              Enable Stripe to accept credit and debit card payments online. You
              need a Stripe account and API keys.
            </p>
            <p className="text-xs text-purple-600 mt-2">
              Get your keys at:{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Stripe Dashboard
              </a>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              Configure Stripe credentials through the Super Admin panel or
              environment variables.
            </p>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {activeTab === "shipping" && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <h2 className="text-lg font-bold">Shipping Configuration</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-sm mb-2">Carrier Integration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your local carrier (e.g., Correo Argentino, FedEx) to automatically quote shipping costs at checkout based on package dimensions and weight.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Provider</label>
                <select
                  value={shippingProvider}
                  onChange={(e) => setShippingProvider(e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-white"
                >
                  <option value="correo_argentino">Correo Argentino</option>
                  <option value="andreani">Andreani</option>
                  <option value="fedex">FedEx</option>
                  <option value="custom">Custom Flat Rate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">API Key</label>
                <input
                  type="password"
                  value={shippingApiKey}
                  onChange={(e) => setShippingApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Origin Zip Code</label>
                <input
                  type="text"
                  value={shippingOriginZip}
                  onChange={(e) => setShippingOriginZip(e.target.value)}
                  placeholder="e.g. 1425"
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">Used to calculate distance to customer.</p>
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {activeTab === "features" && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <h2 className="text-lg font-bold">Store Features</h2>

          {[
            {
              label: "Loyalty Points",
              desc: "Customers earn points on purchases",
              value: loyaltyPoints,
              setter: setLoyaltyPoints,
            },
            {
              label: "Coupons",
              desc: "Allow discount codes at checkout",
              value: coupons,
              setter: setCoupons,
            },
            {
              label: "Reviews",
              desc: "Show customer testimonials on homepage",
              value: reviews,
              setter: setReviews,
            },
            {
              label: "Email Marketing",
              desc: "Send promotional emails to customers",
              value: emailMarketing,
              setter: setEmailMarketing,
            },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div>
                <p className="font-semibold">{feature.label}</p>
                <p className="text-sm text-gray-500">{feature.desc}</p>
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

          <div className="pt-4">
            <label className="block text-sm font-bold mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-4 py-2 rounded-lg border"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="ARS">ARS - Argentine Peso</option>
              <option value="MXN">MXN - Mexican Peso</option>
              <option value="BRL">BRL - Brazilian Real</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            <Save className="h-4 w-4" />{" "}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}
    </div>
  );
}
