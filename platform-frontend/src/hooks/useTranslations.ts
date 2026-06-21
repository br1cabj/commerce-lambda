"use client";

import { useTenantStore, type Translation } from "@/stores/tenantStore";
import { useCallback, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function useIsHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
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
