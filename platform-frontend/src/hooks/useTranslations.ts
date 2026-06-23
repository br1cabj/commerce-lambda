"use client";

import { useTenantStore, type Translation } from "@/stores/tenantStore";
import { useCallback, useState, useEffect } from "react";
import { adminTranslations } from "@/locales/admin";

function useIsHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);
  return hydrated;
}

export function useTranslations() {
  const isHydrated = useIsHydrated();
  const { config, currentLanguage, setLanguage } = useTenantStore();

  const t = useCallback(
    (translation: Translation | undefined): string => {
      if (!translation) return "";
      const lang = isHydrated ? currentLanguage : "en";
      return translation[lang] || translation.en || "";
    },
    [currentLanguage, isHydrated],
  );

  const adminT = useCallback(
    (key: keyof typeof adminTranslations.en): string => {
      const lang = isHydrated ? currentLanguage : "en";
      const dict = adminTranslations[lang] || adminTranslations.en;
      return dict[key] || adminTranslations.en[key] || "";
    },
    [currentLanguage, isHydrated],
  );

  const translations = config?.translations;

  return {
    t,
    adminT,
    currentLanguage: isHydrated ? currentLanguage : "en",
    setLanguage,
    supportedLanguages: config?.homeConfig?.supportedLanguages || ["en", "es"],
    translations,
    isHydrated,
  };
}
