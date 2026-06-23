import { create } from "zustand";

export interface Translation {
  en: string;
  es: string;
}

export interface HeroSlide {
  id: string;
  title: Translation;
  subtitle: Translation;
  imageUrl: string;
  ctaPrimary: Translation;
  ctaSecondary: Translation;
  ctaPrimaryLink: string;
  ctaSecondaryLink: string;
  enabled: boolean;
  order: number;
}

export interface Banner {
  id: string;
  title: Translation;
  description: Translation;
  imageUrl: string;
  link: string;
  enabled: boolean;
  order: number;
}

export interface TrustSignal {
  id: string;
  icon: string;
  title: Translation;
  description: Translation;
  enabled: boolean;
  order: number;
}

export interface SectionConfig {
  id: string;
  type:
    | "hero"
    | "trust"
    | "categories"
    | "featured"
    | "banners"
    | "flash"
    | "new"
    | "bestseller"
    | "reviews"
    | "newsletter"
    | "brands"
    | "why-choose-us"
    | "payment-methods"
    | "how-it-works"
    | "faq";
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  enabled: boolean;
  order: number;
}

export interface Benefit {
  id: string;
  icon: string;
  title: Translation;
  description: Translation;
  enabled: boolean;
  order: number;
}

export interface FaqItem {
  id: string;
  question: Translation;
  answer: Translation;
  enabled: boolean;
  order: number;
}

export interface AnnouncementItem {
  id: string;
  text: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface HomeConfig {
  heroSlides: HeroSlide[];
  banners: Banner[];
  trustSignals: TrustSignal[];
  brands: Brand[];
  benefits: Benefit[];
  faqItems: FaqItem[];
  announcements?: AnnouncementItem[];
  categoriesConfig: CategoriesConfig;
  sections: SectionConfig[];
  defaultLanguage: "en" | "es";
  supportedLanguages: ("en" | "es")[];
}

export interface Translations {
  hero: {
    shopNow: Translation;
    viewCollections: Translation;
  };
  featured: {
    title: Translation;
    subtitle: Translation;
    viewAll: Translation;
  };
  categories: {
    title: Translation;
    subtitle: Translation;
    viewAll: Translation;
  };
  reviews: {
    title: Translation;
    subtitle: Translation;
  };
  newsletter: {
    title: Translation;
    subtitle: Translation;
    placeholder: Translation;
    button: Translation;
    success: Translation;
  };
  trustSignals: {
    freeShipping: Translation;
    freeShippingDesc: Translation;
    securePayment: Translation;
    securePaymentDesc: Translation;
    easyReturns: Translation;
    easyReturnsDesc: Translation;
    support: Translation;
    supportDesc: Translation;
  };
  common: {
    addToCart: Translation;
    added: Translation;
    quickView: Translation;
    onlyLeft: Translation;
    new: Translation;
    bestSeller: Translation;
    off: Translation;
  };
  newProducts: {
    title: Translation;
    subtitle: Translation;
    viewAll: Translation;
  };
  bestSellers: {
    title: Translation;
    subtitle: Translation;
    viewAll: Translation;
  };
  specialOffers: {
    title: Translation;
    subtitle: Translation;
    viewAll: Translation;
    endsIn: Translation;
  };
  brands: {
    title: Translation;
    subtitle: Translation;
  };
  whyChooseUs: {
    title: Translation;
    subtitle: Translation;
  };
  paymentMethods: {
    title: Translation;
    subtitle: Translation;
  };
  howItWorks: {
    title: Translation;
    subtitle: Translation;
    step1Title: Translation;
    step1Desc: Translation;
    step2Title: Translation;
    step2Desc: Translation;
    step3Title: Translation;
    step3Desc: Translation;
  };
  faq: {
    title: Translation;
    subtitle: Translation;
    viewAll: Translation;
  };
}

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
  icon: string;
  backgroundColor: string;
  displayStyle: "image" | "icon" | "gradient";
  showOnHome: boolean;
  parentId: string | null;
  order: number;
  isActive: boolean;
}

export interface CategoriesConfig {
  layout:
    | "grid"
    | "masonry"
    | "horizontal-scroll"
    | "cards-icon"
    | "cards-image"
    | "list";
  columns: number;
  showDescription: boolean;
  showProductCount: boolean;
  cardStyle: "overlay" | "bottom" | "side" | "minimal";
  hoverEffect: "zoom" | "slide" | "fade" | "none";
  borderRadius: string;
  maxHeight: string;
}

export interface FooterLink {
  id: string;
  label: Translation;
  url: string;
  order: number;
}

export interface FooterConfig {
  preset: "classic" | "minimalist" | "modern" | "newsletter";
  bgColorMode: "dark" | "light" | "brand";
  description: Translation;
  showSocials: boolean;
  showPaymentMethods: boolean;
  showContactInfo: boolean;
  showNewsletter: boolean;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  customLinks?: FooterLink[];
  termsOfService?: Translation;
  privacyPolicy?: Translation;
  featuredCategories?: string[];
}

export interface TenantConfig {
  name: string;
  slug: string;
  theme: TenantTheme;
  translations: Translations;
  homeConfig: HomeConfig;
  settings: {
    currency: string;
    language: string;
    whatsappNumber: string;
    email: string;
    phone: string;
    address: string;
    openingHours?: string;
    paymentMethods: {
      type: string;
      enabled: boolean;
      config: Record<string, unknown>;
    }[];
    shippingMethods: {
      type: string;
      enabled: boolean;
      config: Record<string, unknown>;
    }[];
    features: {
      loyaltyPoints: boolean;
      coupons: boolean;
      reviews: boolean;
      emailMarketing: boolean;
    };
    footer?: FooterConfig;
  };
  categories: TenantCategory[];
}

interface TenantState {
  config: TenantConfig | null;
  loading: boolean;
  error: string | null;
  currentLanguage: "en" | "es";
  setConfig: (config: TenantConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLanguage: (lang: "en" | "es") => void;
}

export const useTenantStore = create<TenantState>()((set) => ({
  config: null,
  loading: false,
  error: null,
  currentLanguage: "en", // Default to "en" to prevent hydration mismatch

  setConfig: (config) => {
    set({
      config,
      error: null,
      currentLanguage: config.homeConfig?.defaultLanguage || "en",
    });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLanguage: (lang) => {
    set({ currentLanguage: lang });
  },
}));
