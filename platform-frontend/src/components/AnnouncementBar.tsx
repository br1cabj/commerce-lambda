"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Truck, Tag, Gift, Info, AlertCircle, Sparkles } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { TenantConfig, Translation } from "@/stores/tenantStore";

interface AnnouncementBarProps {
  accentColor: string;
  config?: TenantConfig;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  Tag,
  Gift,
  Info,
  AlertCircle,
  Sparkles,
};

const defaultAnnouncements = [
  {
    icon: "Truck",
    text: {
      en: "Free shipping on orders over $50",
      es: "Envío gratis en pedidos superiores a $50",
    },
  },
  {
    icon: "Tag",
    text: {
      en: "New arrivals every week - Shop now!",
      es: "Nuevas colecciones cada semana - ¡Compra ahora!",
    },
  },
  {
    icon: "Gift",
    text: {
      en: "Sign up and get 10% off your first order",
      es: "¡Regístrate y obtén un 10% de descuento en tu primera compra!",
    },
  },
];

export function AnnouncementBar({ accentColor, config }: AnnouncementBarProps) {
  const { t } = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Check if announcements are defined in tenant config (dynamic custom support)
  const configAnnouncements = config?.homeConfig?.announcements;
  
  const activeAnnouncements = useMemo(() => {
    if (configAnnouncements && Array.isArray(configAnnouncements) && configAnnouncements.length > 0) {
      return configAnnouncements.filter(a => a.enabled);
    }
    return defaultAnnouncements;
  }, [configAnnouncements]);

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  const getAnnouncementText = (text: string | Translation | undefined) => {
    if (typeof text === "string") return text;
    if (text && typeof text === "object") {
      return t(text);
    }
    return "";
  };

  if (!isVisible || activeAnnouncements.length === 0) return null;

  // Safe fallback if index goes out of bounds when announcements count changes
  const safeIndex = currentIndex >= activeAnnouncements.length ? 0 : currentIndex;
  const currentAnnouncement = activeAnnouncements[safeIndex];

  // Resolve icon
  const iconName = currentAnnouncement.icon;
  const Icon = iconMap[iconName] || Info;

  return (
    <div
      className="relative py-2 px-4 text-white text-sm font-medium overflow-hidden transition-all duration-300"
      style={{ backgroundColor: accentColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{getAnnouncementText(currentAnnouncement.text)}</span>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" />
      </button>

      {activeAnnouncements.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
          {activeAnnouncements.map((_, index) => (
            <div
              key={index}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                index === safeIndex ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
