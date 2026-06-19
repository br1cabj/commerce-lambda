"use client";

import { useEffect, useCallback } from "react";
import { useTenantStore, type TenantConfig } from "@/stores/tenantStore";
import { api } from "@/lib/api";

export function useTenant() {
  const { config, loading, error, setConfig, setLoading, setError } =
    useTenantStore();

  const fetchConfig = useCallback(
    async (slug: string) => {
      setLoading(true);
      try {
        const data = (await api.get("/store", slug)) as TenantConfig;
        setConfig(data);
        applyTheme(data.theme);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load store config";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [setConfig, setLoading, setError],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--font-family",
      config?.theme.fontFamily || "Poppins",
    );

    return () => {
      root.style.removeProperty("--font-family");
    };
  }, [config?.theme.fontFamily]);

  return { config, loading, error, fetchConfig };
}

function applyTheme(theme: TenantConfig["theme"]) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.primaryColor);
  root.style.setProperty("--color-secondary", theme.secondaryColor);
  root.style.setProperty("--color-accent", theme.accentColor);
  root.style.setProperty("--font-family", theme.fontFamily);
}
