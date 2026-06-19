"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useTenant } from "@/hooks/useTenant";

interface TenantProviderProps {
  children: React.ReactNode;
  initialSlug?: string | null;
}

const TenantContext = createContext<{ tenantSlug: string | null }>({ tenantSlug: null });

export function TenantProvider({ children, initialSlug }: TenantProviderProps) {
  const { config, loading, error, fetchConfig } = useTenant();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let tenantSlug: string | null = initialSlug || null;

    if (!tenantSlug && typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const hostParts = hostname.split(".");

      if (hostParts.length > 2) {
        tenantSlug = hostParts[0].toLowerCase();
      } else {
        tenantSlug = localStorage.getItem("tenantSlug") || process.env.NEXT_PUBLIC_DEFAULT_TENANT || null;
      }
    }

    if (tenantSlug && !initialized) {
      setInitialized(true);
      fetchConfig(tenantSlug);
    }
  }, [fetchConfig, initialized, initialSlug]);

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Make sure the store slug is correct.</p>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenantSlug: config?.slug || null }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  return useContext(TenantContext);
}
