import { create } from "zustand";

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  fontFamily: string;
}

export interface TenantCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: number;
}

export interface TenantConfig {
  name: string;
  slug: string;
  theme: TenantTheme;
  settings: {
    currency: string;
    language: string;
    whatsappNumber: string;
    email: string;
    phone: string;
    address: string;
    paymentMethods: { type: string; enabled: boolean; config: Record<string, unknown> }[];
    shippingMethods: { type: string; enabled: boolean; config: Record<string, unknown> }[];
    features: {
      loyaltyPoints: boolean;
      coupons: boolean;
      reviews: boolean;
      emailMarketing: boolean;
    };
  };
  categories: TenantCategory[];
}

interface TenantState {
  config: TenantConfig | null;
  loading: boolean;
  error: string | null;
  setConfig: (config: TenantConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTenantStore = create<TenantState>()((set) => ({
  config: null,
  loading: false,
  error: null,

  setConfig: (config) => set({ config, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
