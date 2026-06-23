import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    es: { type: String, default: "" },
  },
  { _id: false },
);

const heroSlideSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: { type: translationSchema, default: { en: "", es: "" } },
    subtitle: { type: translationSchema, default: { en: "", es: "" } },
    imageUrl: { type: String, default: "" },
    ctaPrimary: {
      type: translationSchema,
      default: { en: "Shop Now", es: "Comprar Ahora" },
    },
    ctaSecondary: {
      type: translationSchema,
      default: { en: "View Collections", es: "Ver Colecciones" },
    },
    ctaPrimaryLink: { type: String, default: "/catalog" },
    ctaSecondaryLink: { type: String, default: "/catalog" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const bannerSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: { type: translationSchema, default: { en: "", es: "" } },
    description: { type: translationSchema, default: { en: "", es: "" } },
    imageUrl: { type: String, default: "" },
    link: { type: String, default: "/catalog" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const trustSignalSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    icon: { type: String, default: "Truck" },
    title: { type: translationSchema, default: { en: "", es: "" } },
    description: { type: translationSchema, default: { en: "", es: "" } },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const sectionConfigSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "hero",
        "trust",
        "categories",
        "featured",
        "banners",
        "flash",
        "new",
        "bestseller",
        "reviews",
        "newsletter",
        "brands",
        "why-choose-us",
        "payment-methods",
        "how-it-works",
        "faq",
      ],
      required: true,
    },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const brandSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    website: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const benefitSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    icon: { type: String, default: "CheckCircle" },
    title: { type: translationSchema, default: { en: "", es: "" } },
    description: { type: translationSchema, default: { en: "", es: "" } },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const faqItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    question: { type: translationSchema, default: { en: "", es: "" } },
    answer: { type: translationSchema, default: { en: "", es: "" } },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const announcementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    text: { type: String, required: true },
    icon: { type: String, default: "Info" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const categoriesConfigSchema = new mongoose.Schema(
  {
    layout: {
      type: String,
      enum: [
        "grid",
        "masonry",
        "horizontal-scroll",
        "cards-icon",
        "cards-image",
        "list",
      ],
      default: "grid",
    },
    columns: { type: Number, default: 3 },
    showDescription: { type: Boolean, default: true },
    showProductCount: { type: Boolean, default: false },
    cardStyle: {
      type: String,
      enum: ["overlay", "bottom", "side", "minimal"],
      default: "overlay",
    },
    hoverEffect: {
      type: String,
      enum: ["zoom", "slide", "fade", "none"],
      default: "zoom",
    },
    borderRadius: { type: String, default: "2xl" },
    maxHeight: { type: String, default: "256px" },
  },
  { _id: false },
);

const footerLinkSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    label: { type: translationSchema, default: () => ({ en: "", es: "" }) },
    url: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const footerConfigSchema = new mongoose.Schema(
  {
    preset: {
      type: String,
      enum: ["classic", "minimalist", "modern", "newsletter"],
      default: "classic",
    },
    bgColorMode: {
      type: String,
      enum: ["dark", "light", "brand"],
      default: "dark",
    },
    description: {
      type: translationSchema,
      default: () => ({
        en: "Your specialized online store. The best brands, the latest launches, and passion for quality in one place.",
        es: "Tu tienda online especializada. Las mejores marcas, los últimos lanzamientos y pasión por la calidad en un solo lugar.",
      }),
    },
    showSocials: { type: Boolean, default: true },
    showPaymentMethods: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: true },
    showNewsletter: { type: Boolean, default: false },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    customLinks: {
      type: [footerLinkSchema],
      default: () => [],
    },
    termsOfService: {
      type: translationSchema,
      default: () => ({ en: "", es: "" }),
    },
    privacyPolicy: {
      type: translationSchema,
      default: () => ({ en: "", es: "" }),
    },
    featuredCategories: {
      type: [String],
      default: () => [],
    },
  },
  { _id: false },
);

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be alphanumeric with hyphens",
      ],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customDomain: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    theme: {
      primaryColor: { type: String, default: "#000000" },
      secondaryColor: { type: String, default: "#333333" },
      accentColor: { type: String, default: "#f28c28" },
      logoUrl: { type: String, default: "" },
      heroImageUrl: { type: String, default: "" },
      heroTitle: { type: String, default: "Welcome to our store" },
      heroSubtitle: {
        type: String,
        default: "The best products at the best price",
      },
      fontFamily: { type: String, default: "Poppins" },
    },
    translations: {
      hero: {
        shopNow: {
          type: translationSchema,
          default: { en: "Shop Now", es: "Comprar Ahora" },
        },
        viewCollections: {
          type: translationSchema,
          default: { en: "View Collections", es: "Ver Colecciones" },
        },
      },
      featured: {
        title: {
          type: translationSchema,
          default: { en: "Featured Products", es: "Productos Destacados" },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Handpicked items just for you",
            es: "Artículos seleccionados para ti",
          },
        },
        viewAll: {
          type: translationSchema,
          default: { en: "View All", es: "Ver Todos" },
        },
      },
      categories: {
        title: {
          type: translationSchema,
          default: { en: "Shop by Category", es: "Comprar por Categoría" },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Explore our curated collections",
            es: "Explora nuestras colecciones",
          },
        },
        viewAll: {
          type: translationSchema,
          default: {
            en: "View All Categories",
            es: "Ver Todas las Categorías",
          },
        },
      },
      reviews: {
        title: {
          type: translationSchema,
          default: {
            en: "What Our Customers Say",
            es: "Lo Que Dicen Nuestros Clientes",
          },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Real reviews from our community",
            es: "Reseñas reales de nuestra comunidad",
          },
        },
      },
      newsletter: {
        title: {
          type: translationSchema,
          default: {
            en: "Get 10% Off Your First Order",
            es: "Obtén 10% de Descuento en tu Primera Compra",
          },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Subscribe to our newsletter",
            es: "Suscríbete a nuestro newsletter",
          },
        },
        placeholder: {
          type: translationSchema,
          default: { en: "Enter your email", es: "Ingresa tu email" },
        },
        button: {
          type: translationSchema,
          default: { en: "Subscribe", es: "Suscribirse" },
        },
        success: {
          type: translationSchema,
          default: {
            en: "Thanks! Check your email for your discount code.",
            es: "¡Gracias! Revisa tu email para tu código de descuento.",
          },
        },
      },
      trustSignals: {
        freeShipping: {
          type: translationSchema,
          default: { en: "Free Shipping", es: "Envío Gratis" },
        },
        freeShippingDesc: {
          type: translationSchema,
          default: { en: "On orders over $50", es: "En pedidos mayores a $50" },
        },
        securePayment: {
          type: translationSchema,
          default: { en: "Secure Payment", es: "Pago Seguro" },
        },
        securePaymentDesc: {
          type: translationSchema,
          default: { en: "100% protected", es: "100% protegido" },
        },
        easyReturns: {
          type: translationSchema,
          default: { en: "Easy Returns", es: "Devoluciones Fáciles" },
        },
        easyReturnsDesc: {
          type: translationSchema,
          default: { en: "30-day return policy", es: "Política de 30 días" },
        },
        support: {
          type: translationSchema,
          default: { en: "24/7 Support", es: "Soporte 24/7" },
        },
        supportDesc: {
          type: translationSchema,
          default: {
            en: "Dedicated help center",
            es: "Centro de ayuda dedicado",
          },
        },
      },
      common: {
        addToCart: {
          type: translationSchema,
          default: { en: "Add to Cart", es: "Agregar al Carrito" },
        },
        added: {
          type: translationSchema,
          default: { en: "Added!", es: "¡Agregado!" },
        },
        quickView: {
          type: translationSchema,
          default: { en: "Quick View", es: "Vista Rápida" },
        },
        onlyLeft: {
          type: translationSchema,
          default: { en: "Only {count} left", es: "Solo quedan {count}" },
        },
        new: { type: translationSchema, default: { en: "New", es: "Nuevo" } },
        bestSeller: {
          type: translationSchema,
          default: { en: "Best Seller", es: "Más Vendido" },
        },
        off: { type: translationSchema, default: { en: "OFF", es: "DESC" } },
      },
      newProducts: {
        title: {
          type: translationSchema,
          default: { en: "New Arrivals", es: "Nuevos Ingresos" },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Just landed in our store",
            es: "Recién llegados a nuestra tienda",
          },
        },
        viewAll: {
          type: translationSchema,
          default: { en: "View All New", es: "Ver Todos los Nuevos" },
        },
      },
      bestSellers: {
        title: {
          type: translationSchema,
          default: { en: "Best Sellers", es: "Más Vendidos" },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Our customers' favorites",
            es: "Los favoritos de nuestros clientes",
          },
        },
        viewAll: {
          type: translationSchema,
          default: {
            en: "View All Best Sellers",
            es: "Ver Todos los Más Vendidos",
          },
        },
      },
      specialOffers: {
        title: {
          type: translationSchema,
          default: { en: "Special Offers", es: "Ofertas Especiales" },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Limited time deals",
            es: "Ofertas por tiempo limitado",
          },
        },
        viewAll: {
          type: translationSchema,
          default: { en: "View All Offers", es: "Ver Todas las Ofertas" },
        },
        endsIn: {
          type: translationSchema,
          default: { en: "Ends in", es: "Termina en" },
        },
      },
      brands: {
        title: {
          type: translationSchema,
          default: { en: "Our Brands", es: "Nuestras Marcas" },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Trusted by the best",
            es: "Confianza de las mejores marcas",
          },
        },
      },
      whyChooseUs: {
        title: {
          type: translationSchema,
          default: { en: "Why Choose Us", es: "Por Qué Elegirnos" },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "What makes us different",
            es: "Lo que nos hace diferentes",
          },
        },
      },
      paymentMethods: {
        title: {
          type: translationSchema,
          default: { en: "Secure Payment", es: "Pago Seguro" },
        },
        subtitle: {
          type: translationSchema,
          default: { en: "We accept", es: "Aceptamos" },
        },
      },
      howItWorks: {
        title: {
          type: translationSchema,
          default: { en: "How It Works", es: "Cómo Funciona" },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Simple steps to get your order",
            es: "Pasos simples para recibir tu pedido",
          },
        },
        step1Title: {
          type: translationSchema,
          default: { en: "Choose Products", es: "Elige Productos" },
        },
        step1Desc: {
          type: translationSchema,
          default: {
            en: "Browse our catalog and add items to cart",
            es: "Explora nuestro catálogo y agrega al carrito",
          },
        },
        step2Title: {
          type: translationSchema,
          default: { en: "Secure Checkout", es: "Pago Seguro" },
        },
        step2Desc: {
          type: translationSchema,
          default: {
            en: "Complete your purchase safely",
            es: "Completa tu compra de forma segura",
          },
        },
        step3Title: {
          type: translationSchema,
          default: { en: "Fast Delivery", es: "Entrega Rápida" },
        },
        step3Desc: {
          type: translationSchema,
          default: {
            en: "Receive your order at your door",
            es: "Recibe tu pedido en tu puerta",
          },
        },
        step4Title: {
          type: translationSchema,
          default: { en: "Enjoy!", es: "¡Disfruta!" },
        },
        step4Desc: {
          type: translationSchema,
          default: {
            en: "Love your new products",
            es: "Disfruta tus nuevos productos",
          },
        },
      },
      faq: {
        title: {
          type: translationSchema,
          default: {
            en: "Frequently Asked Questions",
            es: "Preguntas Frecuentes",
          },
        },
        subtitle: {
          type: translationSchema,
          default: {
            en: "Find answers to common questions",
            es: "Encuentra respuestas a preguntas comunes",
          },
        },
        viewAll: {
          type: translationSchema,
          default: { en: "View All FAQs", es: "Ver Todas las Preguntas" },
        },
      },
    },
    homeConfig: {
      heroSlides: [heroSlideSchema],
      banners: [bannerSchema],
      trustSignals: [trustSignalSchema],
      brands: [brandSchema],
      benefits: [benefitSchema],
      faqItems: [faqItemSchema],
      announcements: [announcementSchema],
      categoriesConfig: { type: categoriesConfigSchema, default: () => ({}) },
      sections: [sectionConfigSchema],
      defaultLanguage: { type: String, enum: ["en", "es"], default: "es" },
      supportedLanguages: {
        type: [String],
        enum: ["en", "es"],
        default: ["es"],
      },
    },
    settings: {
      currency: { type: String, default: "USD" },
      language: { type: String, default: "es" },
      whatsappNumber: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      openingHours: { type: String, default: "" },
      paymentMethods: [
        {
          type: {
            type: String,
            enum: ["whatsapp", "mercadopago", "stripe", "transfer"],
            required: true,
          },
          enabled: { type: Boolean, default: false },
          config: { type: mongoose.Schema.Types.Mixed, default: {} },
        },
      ],
      shippingMethods: [
        {
          type: {
            type: String,
            enum: ["flat", "free", "custom", "local_carrier"],
            required: true,
          },
          enabled: { type: Boolean, default: false },
          config: { type: mongoose.Schema.Types.Mixed, default: {} },
        },
      ],
      features: {
        loyaltyPoints: { type: Boolean, default: false },
        coupons: { type: Boolean, default: true },
        reviews: { type: Boolean, default: true },
        emailMarketing: { type: Boolean, default: false },
      },
      footer: {
        type: footerConfigSchema,
        default: () => ({}),
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
  },
  {
    timestamps: true,
  },
);

tenantSchema.index({ isActive: 1 });

export default mongoose.model("Tenant", tenantSchema);
