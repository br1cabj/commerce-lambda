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
      const lang = isHydrated ? currentLanguage : "es";
      return translation[lang] || translation.es || translation.en || "";
    },
    [currentLanguage, isHydrated],
  );

  const adminT = useCallback(
    (key: keyof typeof adminTranslations.en): string => {
      const lang = isHydrated ? currentLanguage : "es";
      const dict = adminTranslations[lang] || adminTranslations.es;
      return dict[key] || adminTranslations.es[key] || "";
    },
    [currentLanguage, isHydrated],
  );

  const translations = config?.translations;

  return {
    t,
    adminT,
    currentLanguage: isHydrated ? currentLanguage : "es",
    setLanguage,
    supportedLanguages: config?.homeConfig?.supportedLanguages || ["es"],
    translations,
    isHydrated,
  };
}
