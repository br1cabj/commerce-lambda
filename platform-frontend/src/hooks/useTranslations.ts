"use client";

import { useTenantStore, type Translation } from "@/stores/tenantStore";
import { useCallback, useState, useEffect } from "react";

export function useTranslations() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { config, currentLanguage, setLanguage } = useTenantStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const t = useCallback(
    (translation: Translation | undefined): string => {
      if (!translation) return "";
      const lang = isHydrated ? currentLanguage : "en";
      return translation[lang] || translation.en || "";
    },
    [currentLanguage, isHydrated]
  );

  const translations = config?.translations;

  return {
    t,
    currentLanguage: isHydrated ? currentLanguage : "en",
    setLanguage,
    supportedLanguages: config?.homeConfig?.supportedLanguages || ["en", "es"],
    translations,
    isHydrated,
  };
}
