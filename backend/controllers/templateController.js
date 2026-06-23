import Tenant from "../models/Tenant.js";

const templates = {
  fashion: {
    name: "Fashion & Apparel",
    description: "Modern template for clothing and fashion stores",
    theme: {
      primaryColor: "#1a1a1a",
      secondaryColor: "#4a4a4a",
      accentColor: "#e91e63",
      heroTitle: {
        en: "New Season Collection",
        es: "Nueva Colección de Temporada",
      },
      heroSubtitle: {
        en: "Discover the latest trends in fashion",
        es: "Descubre las últimas tendencias en moda",
      },
    },
    translations: {
      hero: {
        shopNow: { en: "Shop Now", es: "Comprar Ahora" },
        viewCollections: { en: "View Collections", es: "Ver Colecciones" },
      },
      featured: {
        title: { en: "Trending Now", es: "Tendencias Ahora" },
        subtitle: {
          en: "Most popular items this season",
          es: "Artículos más populares esta temporada",
        },
        viewAll: { en: "View All", es: "Ver Todo" },
      },
      categories: {
        title: { en: "Shop by Category", es: "Comprar por Categoría" },
        subtitle: {
          en: "Find your perfect style",
          es: "Encuentra tu estilo perfecto",
        },
      },
      trustSignals: {
        freeShipping: { en: "Free Shipping", es: "Envío Gratis" },
        freeShippingDesc: {
          en: "On orders over $75",
          es: "En pedidos mayores a $75",
        },
        securePayment: { en: "Secure Payment", es: "Pago Seguro" },
        securePaymentDesc: { en: "100% protected", es: "100% protegido" },
        easyReturns: { en: "Easy Returns", es: "Devoluciones Fáciles" },
        easyReturnsDesc: {
          en: "30-day return policy",
          es: "Política de 30 días",
        },
        support: { en: "Style Support", es: "Soporte de Estilo" },
        supportDesc: {
          en: "Personal styling advice",
          es: "Consejos de estilo personal",
        },
      },
    },
    heroSlides: [
      {
        title: { en: "Summer Collection 2024", es: "Colección Verano 2024" },
        subtitle: {
          en: "Light, breezy, and effortlessly stylish",
          es: "Ligero, fresco y con estilo",
        },
        ctaPrimary: { en: "Shop Summer", es: "Comprar Verano" },
        ctaSecondary: { en: "View Lookbook", es: "Ver Lookbook" },
      },
      {
        title: { en: "New Arrivals", es: "Nuevos Ingresos" },
        subtitle: {
          en: "Fresh styles just landed",
          es: "Estilos frescos recién llegados",
        },
        ctaPrimary: { en: "Shop New", es: "Comprar Nuevo" },
        ctaSecondary: { en: "See All", es: "Ver Todo" },
      },
    ],
    categories: ["Women", "Men", "Accessories", "Shoes", "Sale"],
  },

  electronics: {
    name: "Electronics & Tech",
    description: "Professional template for electronics and technology stores",
    theme: {
      primaryColor: "#0d47a1",
      secondaryColor: "#1976d2",
      accentColor: "#00bcd4",
      heroTitle: { en: "Latest Technology", es: "Última Tecnología" },
      heroSubtitle: {
        en: "Innovation at your fingertips",
        es: "Innovación al alcance de tu mano",
      },
    },
    translations: {
      hero: {
        shopNow: { en: "Shop Tech", es: "Comprar Tech" },
        viewCollections: { en: "View Categories", es: "Ver Categorías" },
      },
      featured: {
        title: { en: "Featured Products", es: "Productos Destacados" },
        subtitle: {
          en: "Top-rated electronics and gadgets",
          es: "Electrónica y gadgets mejor valorados",
        },
        viewAll: { en: "View All", es: "Ver Todo" },
      },
      categories: {
        title: { en: "Shop by Category", es: "Comprar por Categoría" },
        subtitle: {
          en: "Find the perfect tech for you",
          es: "Encuentra la tecnología perfecta para ti",
        },
      },
      trustSignals: {
        freeShipping: { en: "Free Shipping", es: "Envío Gratis" },
        freeShippingDesc: {
          en: "On orders over $100",
          es: "En pedidos mayores a $100",
        },
        securePayment: { en: "Secure Payment", es: "Pago Seguro" },
        securePaymentDesc: {
          en: "256-bit SSL encryption",
          es: "Encriptación SSL de 256 bits",
        },
        easyReturns: { en: "30-Day Returns", es: "Devoluciones en 30 Días" },
        easyReturnsDesc: {
          en: "Hassle-free returns",
          es: "Devoluciones sin complicaciones",
        },
        support: { en: "24/7 Tech Support", es: "Soporte Técnico 24/7" },
        supportDesc: {
          en: "Expert help anytime",
          es: "Ayuda experta en cualquier momento",
        },
      },
    },
    heroSlides: [
      {
        title: { en: "New Smartphones", es: "Nuevos Smartphones" },
        subtitle: {
          en: "Latest models with cutting-edge features",
          es: "Últimos modelos con características de vanguardia",
        },
        ctaPrimary: { en: "Shop Phones", es: "Comprar Teléfonos" },
        ctaSecondary: { en: "Compare Models", es: "Comparar Modelos" },
      },
      {
        title: { en: "Gaming Zone", es: "Zona Gaming" },
        subtitle: {
          en: "Level up your gaming experience",
          es: "Mejora tu experiencia de juego",
        },
        ctaPrimary: { en: "Shop Gaming", es: "Comprar Gaming" },
        ctaSecondary: { en: "View Deals", es: "Ver Ofertas" },
      },
    ],
    categories: ["Smartphones", "Laptops", "Audio", "Gaming", "Accessories"],
  },

  food: {
    name: "Food & Beverage",
    description: "Appetizing template for food and beverage stores",
    theme: {
      primaryColor: "#d32f2f",
      secondaryColor: "#f57c00",
      accentColor: "#ffa000",
      heroTitle: { en: "Delicious Delivered", es: "Delicioso a tu Puerta" },
      heroSubtitle: {
        en: "Fresh ingredients, amazing flavors",
        es: "Ingredientes frescos, sabores increíbles",
      },
    },
    translations: {
      hero: {
        shopNow: { en: "Order Now", es: "Ordenar Ahora" },
        viewCollections: { en: "View Menu", es: "Ver Menú" },
      },
      featured: {
        title: { en: "Popular Items", es: "Artículos Populares" },
        subtitle: {
          en: "Customer favorites this week",
          es: "Favoritos de clientes esta semana",
        },
        viewAll: { en: "View Menu", es: "Ver Menú" },
      },
      categories: {
        title: { en: "Browse Categories", es: "Explorar Categorías" },
        subtitle: {
          en: "Something for every taste",
          es: "Algo para cada gusto",
        },
      },
      trustSignals: {
        freeShipping: { en: "Free Delivery", es: "Entrega Gratis" },
        freeShippingDesc: {
          en: "On orders over $30",
          es: "En pedidos mayores a $30",
        },
        securePayment: { en: "Secure Checkout", es: "Pago Seguro" },
        securePaymentDesc: {
          en: "Safe & encrypted",
          es: "Seguro y encriptado",
        },
        easyReturns: { en: "Quality Guarantee", es: "Garantía de Calidad" },
        easyReturnsDesc: {
          en: "Freshness guaranteed",
          es: "Frescura garantizada",
        },
        support: { en: "Fast Delivery", es: "Entrega Rápida" },
        supportDesc: { en: "30 minutes or less", es: "30 minutos o menos" },
      },
    },
    heroSlides: [
      {
        title: { en: "Fresh & Local", es: "Fresco y Local" },
        subtitle: {
          en: "Farm-to-table quality ingredients",
          es: "Ingredientes de calidad del campo a la mesa",
        },
        ctaPrimary: { en: "Shop Fresh", es: "Comprar Fresco" },
        ctaSecondary: { en: "View Recipes", es: "Ver Recetas" },
      },
      {
        title: { en: "Weekly Specials", es: "Especiales de la Semana" },
        subtitle: {
          en: "Save on your favorites",
          es: "Ahorra en tus favoritos",
        },
        ctaPrimary: { en: "See Deals", es: "Ver Ofertas" },
        ctaSecondary: { en: "Shop All", es: "Comprar Todo" },
      },
    ],
    categories: [
      "Fresh Produce",
      "Beverages",
      "Snacks",
      "Organic",
      "Specialty",
    ],
  },

  beauty: {
    name: "Beauty & Cosmetics",
    description: "Elegant template for beauty and cosmetics stores",
    theme: {
      primaryColor: "#880e4f",
      secondaryColor: "#ad1457",
      accentColor: "#f8bbd0",
      heroTitle: { en: "Glow Up", es: "Brilla Más" },
      heroSubtitle: {
        en: "Premium beauty products for your best self",
        es: "Productos de belleza premium para tu mejor versión",
      },
    },
    translations: {
      hero: {
        shopNow: { en: "Shop Beauty", es: "Comprar Belleza" },
        viewCollections: { en: "View Collections", es: "Ver Colecciones" },
      },
      featured: {
        title: { en: "Bestsellers", es: "Más Vendidos" },
        subtitle: { en: "Loved by thousands", es: "Amados por miles" },
        viewAll: { en: "View All", es: "Ver Todo" },
      },
      categories: {
        title: { en: "Shop by Category", es: "Comprar por Categoría" },
        subtitle: {
          en: "Your beauty essentials",
          es: "Tus esenciales de belleza",
        },
      },
      trustSignals: {
        freeShipping: { en: "Free Shipping", es: "Envío Gratis" },
        freeShippingDesc: {
          en: "On orders over $50",
          es: "En pedidos mayores a $50",
        },
        securePayment: { en: "Secure Payment", es: "Pago Seguro" },
        securePaymentDesc: { en: "100% protected", es: "100% protegido" },
        easyReturns: {
          en: "Satisfaction Guarantee",
          es: "Garantía de Satisfacción",
        },
        easyReturnsDesc: {
          en: "Love it or return it",
          es: "Ámalo o devuélvelo",
        },
        support: { en: "Beauty Advisors", es: "Asesores de Belleza" },
        supportDesc: {
          en: "Expert advice available",
          es: "Consejos expertos disponibles",
        },
      },
    },
    heroSlides: [
      {
        title: { en: "New Arrivals", es: "Nuevos Ingresos" },
        subtitle: {
          en: "Latest beauty innovations",
          es: "Últimas innovaciones en belleza",
        },
        ctaPrimary: { en: "Shop New", es: "Comprar Nuevo" },
        ctaSecondary: { en: "View Lookbook", es: "Ver Lookbook" },
      },
      {
        title: { en: "Skincare Essentials", es: "Esenciales de Skincare" },
        subtitle: {
          en: "Your daily routine perfected",
          es: "Tu rutina diaria perfeccionada",
        },
        ctaPrimary: { en: "Shop Skincare", es: "Comprar Skincare" },
        ctaSecondary: { en: "Take Quiz", es: "Hacer Test" },
      },
    ],
    categories: ["Skincare", "Makeup", "Haircare", "Fragrance", "Tools"],
  },

  sports: {
    name: "Sports & Fitness",
    description: "Dynamic template for sports and fitness stores",
    theme: {
      primaryColor: "#1b5e20",
      secondaryColor: "#2e7d32",
      accentColor: "#ff6f00",
      heroTitle: { en: "Gear Up", es: "Equípate" },
      heroSubtitle: {
        en: "Performance gear for every athlete",
        es: "Equipo de rendimiento para cada atleta",
      },
    },
    translations: {
      hero: {
        shopNow: { en: "Shop Now", es: "Comprar Ahora" },
        viewCollections: { en: "View Sports", es: "Ver Deportes" },
      },
      featured: {
        title: { en: "Top Gear", es: "Mejor Equipo" },
        subtitle: {
          en: "Athlete-approved equipment",
          es: "Equipo aprobado por atletas",
        },
        viewAll: { en: "View All", es: "Ver Todo" },
      },
      categories: {
        title: { en: "Shop by Sport", es: "Comprar por Deporte" },
        subtitle: {
          en: "Find your sport's essentials",
          es: "Encuentra los esenciales de tu deporte",
        },
      },
      trustSignals: {
        freeShipping: { en: "Free Shipping", es: "Envío Gratis" },
        freeShippingDesc: {
          en: "On orders over $75",
          es: "En pedidos mayores a $75",
        },
        securePayment: { en: "Secure Payment", es: "Pago Seguro" },
        securePaymentDesc: { en: "100% protected", es: "100% protegido" },
        easyReturns: { en: "60-Day Returns", es: "Devoluciones en 60 Días" },
        easyReturnsDesc: { en: "Try it risk-free", es: "Pruébalo sin riesgo" },
        support: { en: "Expert Advice", es: "Consejos Expertos" },
        supportDesc: { en: "From real athletes", es: "De atletas reales" },
      },
    },
    heroSlides: [
      {
        title: { en: "Running Season", es: "Temporada de Running" },
        subtitle: {
          en: "Everything you need to hit the road",
          es: "Todo lo que necesitas para salir a correr",
        },
        ctaPrimary: { en: "Shop Running", es: "Comprar Running" },
        ctaSecondary: { en: "View Guide", es: "Ver Guía" },
      },
      {
        title: { en: "Training Essentials", es: "Esenciales de Entrenamiento" },
        subtitle: {
          en: "Build your perfect workout",
          es: "Construye tu entrenamiento perfecto",
        },
        ctaPrimary: { en: "Shop Training", es: "Comprar Entrenamiento" },
        ctaSecondary: { en: "See Deals", es: "Ver Ofertas" },
      },
    ],
    categories: ["Running", "Training", "Team Sports", "Outdoor", "Recovery"],
  },

  home: {
    name: "Home & Decor",
    description: "Cozy template for home and decoration stores",
    theme: {
      primaryColor: "#4e342e",
      secondaryColor: "#6d4c41",
      accentColor: "#ffab40",
      heroTitle: { en: "Make It Home", es: "Hazlo Hogar" },
      heroSubtitle: {
        en: "Transform your space with style",
        es: "Transforma tu espacio con estilo",
      },
    },
    translations: {
      hero: {
        shopNow: { en: "Shop Home", es: "Comprar Hogar" },
        viewCollections: { en: "View Rooms", es: "Ver Habitaciones" },
      },
      featured: {
        title: { en: "Featured Picks", es: "Selecciones Destacadas" },
        subtitle: {
          en: "Curated for your home",
          es: "Seleccionados para tu hogar",
        },
        viewAll: { en: "View All", es: "Ver Todo" },
      },
      categories: {
        title: { en: "Shop by Room", es: "Comprar por Habitación" },
        subtitle: {
          en: "Find what you need",
          es: "Encuentra lo que necesitas",
        },
      },
      trustSignals: {
        freeShipping: { en: "Free Shipping", es: "Envío Gratis" },
        freeShippingDesc: {
          en: "On orders over $100",
          es: "En pedidos mayores a $100",
        },
        securePayment: { en: "Secure Payment", es: "Pago Seguro" },
        securePaymentDesc: { en: "100% protected", es: "100% protegido" },
        easyReturns: { en: "Easy Returns", es: "Devoluciones Fáciles" },
        easyReturnsDesc: {
          en: "30-day return policy",
          es: "Política de 30 días",
        },
        support: { en: "Design Help", es: "Ayuda de Diseño" },
        supportDesc: { en: "Free consultation", es: "Consulta gratis" },
      },
    },
    heroSlides: [
      {
        title: { en: "Living Room Refresh", es: "Renueva tu Sala" },
        subtitle: {
          en: "Cozy essentials for gathering",
          es: "Esenciales acogedores para reunirse",
        },
        ctaPrimary: { en: "Shop Living", es: "Comprar Sala" },
        ctaSecondary: { en: "Get Inspired", es: "Inspírate" },
      },
      {
        title: { en: "Bedroom Bliss", es: "Dormitorio de Ensueño" },
        subtitle: { en: "Create your sanctuary", es: "Crea tu santuario" },
        ctaPrimary: { en: "Shop Bedroom", es: "Comprar Dormitorio" },
        ctaSecondary: { en: "View Sets", es: "Ver Sets" },
      },
    ],
    categories: ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Outdoor"],
  },

  books: {
    name: "Books & Media",
    description: "Classic template for books and media stores",
    theme: {
      primaryColor: "#1a237e",
      secondaryColor: "#283593",
      accentColor: "#ff6f00",
      heroTitle: {
        en: "Discover Your Next Read",
        es: "Descubre Tu Próxima Lectura",
      },
      heroSubtitle: {
        en: "Thousands of titles, endless stories",
        es: "Miles de títulos, historias infinitas",
      },
    },
    translations: {
      hero: {
        shopNow: { en: "Shop Books", es: "Comprar Libros" },
        viewCollections: { en: "Browse Genres", es: "Explorar Géneros" },
      },
      featured: {
        title: { en: "Bestsellers", es: "Más Vendidos" },
        subtitle: {
          en: "What everyone's reading",
          es: "Lo que todos están leyendo",
        },
        viewAll: { en: "View All", es: "Ver Todo" },
      },
      categories: {
        title: { en: "Browse by Genre", es: "Explorar por Género" },
        subtitle: {
          en: "Find your next favorite",
          es: "Encuentra tu próximo favorito",
        },
      },
      trustSignals: {
        freeShipping: { en: "Free Shipping", es: "Envío Gratis" },
        freeShippingDesc: {
          en: "On orders over $25",
          es: "En pedidos mayores a $25",
        },
        securePayment: { en: "Secure Payment", es: "Pago Seguro" },
        securePaymentDesc: { en: "100% protected", es: "100% protegido" },
        easyReturns: { en: "Easy Returns", es: "Devoluciones Fáciles" },
        easyReturnsDesc: {
          en: "30-day return policy",
          es: "Política de 30 días",
        },
        support: {
          en: "Book Recommendations",
          es: "Recomendaciones de Libros",
        },
        supportDesc: {
          en: "Personalized suggestions",
          es: "Sugerencias personalizadas",
        },
      },
    },
    heroSlides: [
      {
        title: { en: "New Releases", es: "Nuevos Lanzamientos" },
        subtitle: {
          en: "Fresh off the press",
          es: "Recién salidos de la imprenta",
        },
        ctaPrimary: { en: "Shop New", es: "Comprar Nuevo" },
        ctaSecondary: { en: "View Pre-orders", es: "Ver Pre-ventas" },
      },
      {
        title: { en: "Staff Picks", es: "Selecciones del Personal" },
        subtitle: {
          en: "Our favorites this month",
          es: "Nuestros favoritos este mes",
        },
        ctaPrimary: { en: "See Picks", es: "Ver Selecciones" },
        ctaSecondary: { en: "Read Reviews", es: "Leer Reseñas" },
      },
    ],
    categories: [
      "Fiction",
      "Non-Fiction",
      "Children",
      "Education",
      "Audiobooks",
    ],
  },

  toys: {
    name: "Toys & Games",
    description: "Fun template for toys and games stores",
    theme: {
      primaryColor: "#6a1b9a",
      secondaryColor: "#8e24aa",
      accentColor: "#ffeb3b",
      heroTitle: { en: "Play Time!", es: "¡Hora de Jugar!" },
      heroSubtitle: {
        en: "Toys that inspire imagination",
        es: "Juguetes que inspiran imaginación",
      },
    },
    translations: {
      hero: {
        shopNow: { en: "Shop Toys", es: "Comprar Juguetes" },
        viewCollections: { en: "View Categories", es: "Ver Categorías" },
      },
      featured: {
        title: { en: "Hot Toys", es: "Juguetes Populares" },
        subtitle: {
          en: "Kids' favorites right now",
          es: "Favoritos de los niños ahora",
        },
        viewAll: { en: "View All", es: "Ver Todo" },
      },
      categories: {
        title: { en: "Shop by Age", es: "Comprar por Edad" },
        subtitle: {
          en: "Perfect toys for every age",
          es: "Juguetes perfectos para cada edad",
        },
      },
      trustSignals: {
        freeShipping: { en: "Free Shipping", es: "Envío Gratis" },
        freeShippingDesc: {
          en: "On orders over $50",
          es: "En pedidos mayores a $50",
        },
        securePayment: { en: "Secure Payment", es: "Pago Seguro" },
        securePaymentDesc: { en: "100% protected", es: "100% protegido" },
        easyReturns: { en: "Easy Returns", es: "Devoluciones Fáciles" },
        easyReturnsDesc: {
          en: "30-day return policy",
          es: "Política de 30 días",
        },
        support: { en: "Gift Wrapping", es: "Envoltura de Regalo" },
        supportDesc: {
          en: "Free with every order",
          es: "Gratis en cada pedido",
        },
      },
    },
    heroSlides: [
      {
        title: { en: "New Arrivals", es: "Nuevos Ingresos" },
        subtitle: {
          en: "Exciting new toys just in",
          es: "Emocionantes juguetes nuevos",
        },
        ctaPrimary: { en: "Shop New", es: "Comprar Nuevo" },
        ctaSecondary: { en: "See All", es: "Ver Todo" },
      },
      {
        title: { en: "Educational Toys", es: "Juguetes Educativos" },
        subtitle: {
          en: "Learn while having fun",
          es: "Aprende mientras te diviertes",
        },
        ctaPrimary: { en: "Shop Learning", es: "Comprar Aprendizaje" },
        ctaSecondary: { en: "View by Age", es: "Ver por Edad" },
      },
    ],
    categories: ["0-2 Years", "3-5 Years", "6-8 Years", "9-12 Years", "Games"],
  },
};

export const getTemplates = async (req, res) => {
  try {
    const templateList = Object.entries(templates).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
    }));

    res.json(templateList);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Error fetching templates" });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = templates[templateId];

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({ id: templateId, ...template });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Error fetching template" });
  }
};

export const applyTemplate = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const { templateId } = req.body;
    const template = templates[templateId];

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const defaultLang = tenant.settings?.language || "en";

    tenant.theme = {
      ...tenant.theme,
      ...template.theme,
      heroTitle: typeof template.theme.heroTitle === "object"
        ? (template.theme.heroTitle[defaultLang] || template.theme.heroTitle["en"])
        : template.theme.heroTitle,
      heroSubtitle: typeof template.theme.heroSubtitle === "object"
        ? (template.theme.heroSubtitle[defaultLang] || template.theme.heroSubtitle["en"])
        : template.theme.heroSubtitle,
    };

    tenant.translations = {
      ...tenant.translations,
      ...template.translations,
    };

    const heroSlides = template.heroSlides.map((slide, index) => ({
      id: `${templateId}_slide_${index}`,
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: "",
      ctaPrimary: slide.ctaPrimary,
      ctaSecondary: slide.ctaSecondary,
      ctaPrimaryLink: "/catalog",
      ctaSecondaryLink: "/catalog",
      enabled: true,
      order: index,
    }));

    tenant.homeConfig = {
      ...tenant.homeConfig,
      heroSlides,
    };

    await tenant.save();

    res.json({
      message: `Template "${template.name}" applied successfully`,
      template: { id: templateId, ...template },
      tenant: {
        theme: tenant.theme,
        translations: tenant.translations,
        homeConfig: tenant.homeConfig,
      },
    });
  } catch (error) {
    console.error("Error applying template:", error);
    res.status(500).json({ message: "Error applying template" });
  }
};
