import mongoose from "mongoose";
import "dotenv/config";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

const demoData = {
  tenant: {
    name: "Demo Store",
    slug: "demo",
    theme: {
      primaryColor: "#1a1a1a",
      secondaryColor: "#4a4a4a",
      accentColor: "#ff6b35",
      logoUrl:
        "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop",
      heroImageUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop",
      heroTitle: "Welcome to Demo Store",
      heroSubtitle: "Discover amazing products from top brands worldwide",
      fontFamily: "Poppins",
    },
    translations: {
      hero: {
        shopNow: { en: "Shop Now", es: "Comprar Ahora" },
        viewCollections: { en: "View Collections", es: "Ver Colecciones" },
      },
      featured: {
        title: { en: "Featured Products", es: "Productos Destacados" },
        subtitle: {
          en: "Handpicked items just for you",
          es: "Artículos seleccionados para ti",
        },
        viewAll: { en: "View All", es: "Ver Todos" },
      },
      categories: {
        title: { en: "Shop by Category", es: "Comprar por Categoría" },
        subtitle: {
          en: "Explore our curated collections",
          es: "Explora nuestras colecciones",
        },
        viewAll: { en: "View All Categories", es: "Ver Todas las Categorías" },
      },
      reviews: {
        title: {
          en: "What Our Customers Say",
          es: "Lo Que Dicen Nuestros Clientes",
        },
        subtitle: {
          en: "Real reviews from our community",
          es: "Reseñas reales de nuestra comunidad",
        },
      },
      newsletter: {
        title: {
          en: "Get 10% Off Your First Order",
          es: "Obtén 10% de Descuento",
        },
        subtitle: {
          en: "Subscribe to our newsletter",
          es: "Suscríbete a nuestro newsletter",
        },
        placeholder: { en: "Enter your email", es: "Ingresa tu email" },
        button: { en: "Subscribe", es: "Suscribirse" },
        success: {
          en: "Thanks! Check your email.",
          es: "¡Gracias! Revisa tu email.",
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
        support: { en: "24/7 Support", es: "Soporte 24/7" },
        supportDesc: {
          en: "Dedicated help center",
          es: "Centro de ayuda dedicado",
        },
      },
      common: {
        addToCart: { en: "Add to Cart", es: "Agregar al Carrito" },
        added: { en: "Added!", es: "¡Agregado!" },
        quickView: { en: "Quick View", es: "Vista Rápida" },
        onlyLeft: { en: "Only {count} left", es: "Solo quedan {count}" },
        new: { en: "New", es: "Nuevo" },
        bestSeller: { en: "Best Seller", es: "Más Vendido" },
        off: { en: "OFF", es: "DESC" },
      },
      newProducts: {
        title: { en: "New Arrivals", es: "Nuevos Ingresos" },
        subtitle: { en: "Just landed in our store", es: "Recién llegados" },
        viewAll: { en: "View All New", es: "Ver Todos" },
      },
      bestSellers: {
        title: { en: "Best Sellers", es: "Más Vendidos" },
        subtitle: { en: "Our customers' favorites", es: "Los favoritos" },
        viewAll: { en: "View All", es: "Ver Todos" },
      },
      specialOffers: {
        title: { en: "Special Offers", es: "Ofertas Especiales" },
        subtitle: {
          en: "Limited time deals",
          es: "Ofertas por tiempo limitado",
        },
        viewAll: { en: "View All Offers", es: "Ver Todas" },
        endsIn: { en: "Ends in", es: "Termina en" },
      },
      brands: {
        title: { en: "Our Brands", es: "Nuestras Marcas" },
        subtitle: { en: "Trusted by the best", es: "Confianza de las mejores" },
      },
      whyChooseUs: {
        title: { en: "Why Choose Us", es: "Por Qué Elegirnos" },
        subtitle: {
          en: "What makes us different",
          es: "Lo que nos hace diferentes",
        },
      },
      paymentMethods: {
        title: { en: "Secure Payment", es: "Pago Seguro" },
        subtitle: { en: "We accept", es: "Aceptamos" },
      },
      howItWorks: {
        title: { en: "How It Works", es: "Cómo Funciona" },
        subtitle: { en: "Simple steps to get your order", es: "Pasos simples" },
        step1Title: { en: "Choose Products", es: "Elige Productos" },
        step1Desc: { en: "Browse our catalog", es: "Explora nuestro catálogo" },
        step2Title: { en: "Secure Checkout", es: "Pago Seguro" },
        step2Desc: {
          en: "Complete your purchase safely",
          es: "Completa tu compra",
        },
        step3Title: { en: "Fast Delivery", es: "Entrega Rápida" },
        step3Desc: { en: "Receive your order", es: "Recibe tu pedido" },
      },
      faq: {
        title: { en: "Frequently Asked Questions", es: "Preguntas Frecuentes" },
        subtitle: {
          en: "Find answers to common questions",
          es: "Encuentra respuestas",
        },
        viewAll: { en: "View All FAQs", es: "Ver Todas" },
      },
    },
    homeConfig: {
      heroSlides: [
        {
          id: "slide1",
          title: { en: "Summer Collection 2024", es: "Colección Verano 2024" },
          subtitle: {
            en: "Light, breezy, and effortlessly stylish",
            es: "Ligero, fresco y con estilo",
          },
          imageUrl:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop",
          ctaPrimary: { en: "Shop Summer", es: "Comprar Verano" },
          ctaSecondary: { en: "View Lookbook", es: "Ver Lookbook" },
          ctaPrimaryLink: "/catalog",
          ctaSecondaryLink: "/catalog",
          enabled: true,
          order: 0,
        },
        {
          id: "slide2",
          title: { en: "New Arrivals", es: "Nuevos Ingresos" },
          subtitle: {
            en: "Fresh styles just landed",
            es: "Estilos frescos recién llegados",
          },
          imageUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop",
          ctaPrimary: { en: "Shop New", es: "Comprar Nuevo" },
          ctaSecondary: { en: "See All", es: "Ver Todo" },
          ctaPrimaryLink: "/catalog",
          ctaSecondaryLink: "/catalog",
          enabled: true,
          order: 1,
        },
        {
          id: "slide3",
          title: { en: "Tech Essentials", es: "Esenciales Tech" },
          subtitle: {
            en: "Latest gadgets and electronics",
            es: "Últimos gadgets y electrónica",
          },
          imageUrl:
            "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&h=1080&fit=crop",
          ctaPrimary: { en: "Shop Tech", es: "Comprar Tech" },
          ctaSecondary: { en: "View Deals", es: "Ver Ofertas" },
          ctaPrimaryLink: "/catalog",
          ctaSecondaryLink: "/catalog",
          enabled: true,
          order: 2,
        },
      ],
      banners: [
        {
          id: "banner1",
          title: { en: "Flash Sale - 50% Off", es: "Venta Flash - 50% Desc" },
          description: {
            en: "Limited time offer on selected items",
            es: "Oferta por tiempo limitado",
          },
          imageUrl:
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop",
          link: "/catalog",
          enabled: true,
          order: 0,
        },
        {
          id: "banner2",
          title: { en: "New Collection", es: "Nueva Colección" },
          description: {
            en: "Discover the latest trends",
            es: "Descubre las últimas tendencias",
          },
          imageUrl:
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop",
          link: "/catalog",
          enabled: true,
          order: 1,
        },
        {
          id: "banner3",
          title: { en: "Free Shipping", es: "Envío Gratis" },
          description: {
            en: "On all orders over $50",
            es: "En pedidos mayores a $50",
          },
          imageUrl:
            "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop",
          link: "/catalog",
          enabled: true,
          order: 2,
        },
      ],
      trustSignals: [
        {
          id: "ts1",
          icon: "Truck",
          title: { en: "Free Shipping", es: "Envío Gratis" },
          description: { en: "On orders over $50", es: "En pedidos +$50" },
          enabled: true,
          order: 0,
        },
        {
          id: "ts2",
          icon: "Shield",
          title: { en: "Secure Payment", es: "Pago Seguro" },
          description: { en: "100% protected", es: "100% protegido" },
          enabled: true,
          order: 1,
        },
        {
          id: "ts3",
          icon: "RotateCcw",
          title: { en: "Easy Returns", es: "Devoluciones" },
          description: { en: "30-day policy", es: "30 días" },
          enabled: true,
          order: 2,
        },
        {
          id: "ts4",
          icon: "Headphones",
          title: { en: "24/7 Support", es: "Soporte 24/7" },
          description: { en: "Always here", es: "Siempre aquí" },
          enabled: true,
          order: 3,
        },
      ],
      brands: [
        {
          id: "b1",
          name: "Nike",
          logoUrl: "",
          website: "",
          enabled: true,
          order: 0,
        },
        {
          id: "b2",
          name: "Adidas",
          logoUrl: "",
          website: "",
          enabled: true,
          order: 1,
        },
        {
          id: "b3",
          name: "Apple",
          logoUrl: "",
          website: "",
          enabled: true,
          order: 2,
        },
        {
          id: "b4",
          name: "Samsung",
          logoUrl: "",
          website: "",
          enabled: true,
          order: 3,
        },
        {
          id: "b5",
          name: "Sony",
          logoUrl: "",
          website: "",
          enabled: true,
          order: 4,
        },
        {
          id: "b6",
          name: "Zara",
          logoUrl: "",
          website: "",
          enabled: true,
          order: 5,
        },
      ],
      benefits: [
        {
          id: "ben1",
          icon: "Award",
          title: { en: "Premium Quality", es: "Calidad Premium" },
          description: { en: "Only the best products", es: "Solo los mejores" },
          enabled: true,
          order: 0,
        },
        {
          id: "ben2",
          icon: "Truck",
          title: { en: "Fast Delivery", es: "Entrega Rápida" },
          description: { en: "2-3 business days", es: "2-3 días hábiles" },
          enabled: true,
          order: 1,
        },
        {
          id: "ben3",
          icon: "Shield",
          title: { en: "Secure Shopping", es: "Compra Segura" },
          description: { en: "SSL encrypted", es: "Encriptado SSL" },
          enabled: true,
          order: 2,
        },
        {
          id: "ben4",
          icon: "Headphones",
          title: { en: "Expert Support", es: "Soporte Experto" },
          description: { en: "Always available", es: "Siempre disponible" },
          enabled: true,
          order: 3,
        },
      ],
      faqItems: [
        {
          id: "faq1",
          question: {
            en: "How long does shipping take?",
            es: "¿Cuánto tarda el envío?",
          },
          answer: {
            en: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 days.",
            es: "El envío estándar tarda 3-5 días. El express tarda 1-2 días.",
          },
          enabled: true,
          order: 0,
        },
        {
          id: "faq2",
          question: {
            en: "What is your return policy?",
            es: "¿Cuál es su política de devolución?",
          },
          answer: {
            en: "We offer a 30-day return policy for all items in original condition.",
            es: "Ofrecemos 30 días para devoluciones en condición original.",
          },
          enabled: true,
          order: 1,
        },
        {
          id: "faq3",
          question: {
            en: "Do you ship internationally?",
            es: "¿Hacen envíos internacionales?",
          },
          answer: {
            en: "Yes, we ship to over 50 countries worldwide.",
            es: "Sí, enviamos a más de 50 países.",
          },
          enabled: true,
          order: 2,
        },
        {
          id: "faq4",
          question: {
            en: "How can I track my order?",
            es: "¿Cómo rastreo mi pedido?",
          },
          answer: {
            en: "You'll receive a tracking number via email once your order ships.",
            es: "Recibirás un número de seguimiento por email.",
          },
          enabled: true,
          order: 3,
        },
        {
          id: "faq5",
          question: {
            en: "What payment methods do you accept?",
            es: "¿Qué métodos de pago aceptan?",
          },
          answer: {
            en: "We accept Visa, MasterCard, PayPal, Apple Pay, and Google Pay.",
            es: "Aceptamos Visa, MasterCard, PayPal, Apple Pay y Google Pay.",
          },
          enabled: true,
          order: 4,
        },
      ],
      categoriesConfig: {
        layout: "grid",
        columns: 3,
        showDescription: true,
        showProductCount: false,
        cardStyle: "overlay",
        hoverEffect: "zoom",
        borderRadius: "2xl",
        maxHeight: "256px",
      },
      sections: [
        { id: "s1", type: "hero", enabled: true, order: 0, config: {} },
        { id: "s2", type: "trust", enabled: true, order: 1, config: {} },
        { id: "s3", type: "banners", enabled: true, order: 2, config: {} },
        { id: "s4", type: "categories", enabled: true, order: 3, config: {} },
        { id: "s5", type: "flash", enabled: true, order: 4, config: {} },
        { id: "s6", type: "featured", enabled: true, order: 5, config: {} },
        { id: "s7", type: "new", enabled: true, order: 6, config: {} },
        { id: "s8", type: "bestseller", enabled: true, order: 7, config: {} },
        { id: "s9", type: "brands", enabled: true, order: 8, config: {} },
        {
          id: "s10",
          type: "why-choose-us",
          enabled: true,
          order: 9,
          config: {},
        },
        {
          id: "s11",
          type: "how-it-works",
          enabled: true,
          order: 10,
          config: {},
        },
        { id: "s12", type: "reviews", enabled: true, order: 11, config: {} },
        {
          id: "s13",
          type: "payment-methods",
          enabled: true,
          order: 12,
          config: {},
        },
        { id: "s14", type: "faq", enabled: true, order: 13, config: {} },
        { id: "s15", type: "newsletter", enabled: true, order: 14, config: {} },
      ],
      defaultLanguage: "en",
      supportedLanguages: ["en", "es"],
    },
    settings: {
      currency: "USD",
      language: "en",
      whatsappNumber: "1234567890",
      email: "demo@demostore.com",
      phone: "+1 234 567 8900",
      address: "123 Demo Street, City, Country",
      paymentMethods: [
        { type: "stripe", enabled: true, config: {} },
        { type: "mercadopago", enabled: true, config: {} },
      ],
      shippingMethods: [
        { type: "free", enabled: true, config: { minOrder: 50 } },
        { type: "flat", enabled: true, config: { rate: 5 } },
      ],
      features: {
        loyaltyPoints: true,
        coupons: true,
        reviews: true,
        emailMarketing: true,
      },
    },
    isActive: true,
    plan: "premium",
  },
  categories: [
    {
      name: "Fashion",
      slug: "fashion",
      description: "Latest trends in clothing and accessories",
      imageUrl:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
      icon: "👕",
      backgroundColor: "#ff6b6b",
      displayStyle: "image",
      showOnHome: true,
      order: 0,
    },
    {
      name: "Electronics",
      slug: "electronics",
      description: "Gadgets and tech essentials",
      imageUrl:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop",
      icon: "💻",
      backgroundColor: "#4ecdc4",
      displayStyle: "image",
      showOnHome: true,
      order: 1,
    },
    {
      name: "Home & Living",
      slug: "home-living",
      description: "Make your house a home",
      imageUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      icon: "🏠",
      backgroundColor: "#95e1d3",
      displayStyle: "image",
      showOnHome: true,
      order: 2,
    },
    {
      name: "Sports",
      slug: "sports",
      description: "Gear up for adventure",
      imageUrl:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
      icon: "⚽",
      backgroundColor: "#f38181",
      displayStyle: "image",
      showOnHome: true,
      order: 3,
    },
    {
      name: "Beauty",
      slug: "beauty",
      description: "Pamper yourself with the best",
      imageUrl:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
      icon: "💄",
      backgroundColor: "#fce38a",
      displayStyle: "image",
      showOnHome: true,
      order: 4,
    },
    {
      name: "Books",
      slug: "books",
      description: "Expand your mind",
      imageUrl:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop",
      icon: "📚",
      backgroundColor: "#e0c3fc",
      displayStyle: "image",
      showOnHome: true,
      order: 5,
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Complete your look",
      imageUrl:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop",
      icon: "⌚",
      backgroundColor: "#845ec2",
      displayStyle: "image",
      showOnHome: true,
      order: 6,
    },
    {
      name: "Toys",
      slug: "toys",
      description: "Fun for all ages",
      imageUrl:
        "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=600&fit=crop",
      icon: "🎮",
      backgroundColor: "#ff9a8b",
      displayStyle: "image",
      showOnHome: true,
      order: 7,
    },
  ],
  products: [
    // Fashion (5 products)
    {
      model: "Classic White Sneakers",
      brand: "Nike",
      category: "Fashion",
      price: 89.99,
      discount: 0,
      stock: 25,
      isFeatured: true,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "8", stock: 5 },
        { size: "9", stock: 10 },
        { size: "10", stock: 10 },
      ],
    },
    {
      model: "Denim Jacket",
      brand: "Zara",
      category: "Fashion",
      price: 129.99,
      discount: 20,
      stock: 15,
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "S", stock: 5 },
        { size: "M", stock: 5 },
        { size: "L", stock: 5 },
      ],
    },
    {
      model: "Summer Dress",
      brand: "H&M",
      category: "Fashion",
      price: 59.99,
      discount: 30,
      stock: 20,
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "XS", stock: 5 },
        { size: "S", stock: 5 },
        { size: "M", stock: 5 },
        { size: "L", stock: 5 },
      ],
    },
    {
      model: "Leather Belt",
      brand: "Gucci",
      category: "Accessories",
      price: 199.99,
      discount: 0,
      stock: 10,
      isFeatured: true,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "32", stock: 3 },
        { size: "34", stock: 4 },
        { size: "36", stock: 3 },
      ],
    },
    {
      model: "Sunglasses",
      brand: "Ray-Ban",
      category: "Accessories",
      price: 159.99,
      discount: 15,
      stock: 8,
      isFeatured: false,
      isNew: true,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "One Size", stock: 8 }],
    },

    // Electronics (5 products)
    {
      model: "Wireless Headphones",
      brand: "Sony",
      category: "Electronics",
      price: 299.99,
      discount: 25,
      stock: 12,
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "One Size", stock: 12 }],
    },
    {
      model: "Smart Watch",
      brand: "Apple",
      category: "Electronics",
      price: 399.99,
      discount: 0,
      stock: 18,
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "40mm", stock: 9 },
        { size: "44mm", stock: 9 },
      ],
    },
    {
      model: "Laptop Stand",
      brand: "Logitech",
      category: "Electronics",
      price: 79.99,
      discount: 0,
      stock: 30,
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "One Size", stock: 30 }],
    },
    {
      model: "Bluetooth Speaker",
      brand: "JBL",
      category: "Electronics",
      price: 149.99,
      discount: 40,
      stock: 5,
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "One Size", stock: 5 }],
    },
    {
      model: "Wireless Mouse",
      brand: "Logitech",
      category: "Electronics",
      price: 49.99,
      discount: 0,
      stock: 40,
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "One Size", stock: 40 }],
    },

    // Home & Living (5 products)
    {
      model: "Scented Candle Set",
      brand: "Yankee",
      category: "Home & Living",
      price: 34.99,
      discount: 0,
      stock: 50,
      isFeatured: true,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1602874801006-e26c4f5b5e8e?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Set of 3", stock: 50 }],
    },
    {
      model: "Throw Pillow",
      brand: "IKEA",
      category: "Home & Living",
      price: 24.99,
      discount: 20,
      stock: 35,
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "18x18", stock: 20 },
        { size: "20x20", stock: 15 },
      ],
    },
    {
      model: "Wall Art Print",
      brand: "Art.com",
      category: "Home & Living",
      price: 89.99,
      discount: 0,
      stock: 15,
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "24x36", stock: 10 },
        { size: "18x24", stock: 5 },
      ],
    },
    {
      model: "Coffee Table Book",
      brand: "Assouline",
      category: "Books",
      price: 65.0,
      discount: 0,
      stock: 20,
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Hardcover", stock: 20 }],
    },
    {
      model: "Desk Lamp",
      brand: "Philips",
      category: "Home & Living",
      price: 59.99,
      discount: 35,
      stock: 3,
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "One Size", stock: 3 }],
    },

    // Sports (5 products)
    {
      model: "Yoga Mat",
      brand: "Lululemon",
      category: "Sports",
      price: 78.0,
      discount: 0,
      stock: 25,
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "Standard", stock: 15 },
        { size: "Travel", stock: 10 },
      ],
    },
    {
      model: "Running Shoes",
      brand: "Adidas",
      category: "Sports",
      price: 129.99,
      discount: 15,
      stock: 18,
      isFeatured: true,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "8", stock: 6 },
        { size: "9", stock: 6 },
        { size: "10", stock: 6 },
      ],
    },
    {
      model: "Water Bottle",
      brand: "HydroFlask",
      category: "Sports",
      price: 32.99,
      discount: 0,
      stock: 60,
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "24oz", stock: 30 },
        { size: "32oz", stock: 30 },
      ],
    },
    {
      model: "Resistance Bands",
      brand: "Fit Simplify",
      category: "Sports",
      price: 19.99,
      discount: 50,
      stock: 2,
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Set of 5", stock: 2 }],
    },
    {
      model: "Gym Bag",
      brand: "Nike",
      category: "Sports",
      price: 55.0,
      discount: 0,
      stock: 22,
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "Medium", stock: 12 },
        { size: "Large", stock: 10 },
      ],
    },

    // Beauty (5 products)
    {
      model: "Moisturizer Cream",
      brand: "CeraVe",
      category: "Beauty",
      price: 18.99,
      discount: 0,
      stock: 45,
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "12oz", stock: 25 },
        { size: "19oz", stock: 20 },
      ],
    },
    {
      model: "Lipstick Set",
      brand: "MAC",
      category: "Beauty",
      price: 42.0,
      discount: 25,
      stock: 16,
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Set of 4", stock: 16 }],
    },
    {
      model: "Perfume",
      brand: "Chanel",
      category: "Beauty",
      price: 135.0,
      discount: 0,
      stock: 10,
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "50ml", stock: 5 },
        { size: "100ml", stock: 5 },
      ],
    },
    {
      model: "Hair Dryer",
      brand: "Dyson",
      category: "Beauty",
      price: 399.99,
      discount: 30,
      stock: 4,
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "One Size", stock: 4 }],
    },
    {
      model: "Face Mask Pack",
      brand: "Sheet Mask",
      category: "Beauty",
      price: 24.99,
      discount: 0,
      stock: 55,
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Pack of 10", stock: 55 }],
    },

    // Books (5 products)
    {
      model: "Bestseller Novel",
      brand: "Penguin",
      category: "Books",
      price: 16.99,
      discount: 0,
      stock: 40,
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop",
      ],
      sizes: [
        { size: "Paperback", stock: 30 },
        { size: "Hardcover", stock: 10 },
      ],
    },
    {
      model: "Cookbook",
      brand: "Williams Sonoma",
      category: "Books",
      price: 39.99,
      discount: 20,
      stock: 18,
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Hardcover", stock: 18 }],
    },
    {
      model: "Self-Help Book",
      brand: "Random House",
      category: "Books",
      price: 14.99,
      discount: 0,
      stock: 50,
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Paperback", stock: 50 }],
    },
    {
      model: "Children's Book Set",
      brand: "Scholastic",
      category: "Toys",
      price: 29.99,
      discount: 40,
      stock: 1,
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1614937802623-issuesc0e0e0e0e0?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Set of 5", stock: 1 }],
    },
    {
      model: "Art Book",
      brand: "Phaidon",
      category: "Books",
      price: 75.0,
      discount: 0,
      stock: 12,
      isFeatured: true,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Hardcover", stock: 12 }],
    },

    // Toys (5 products)
    {
      model: "Building Blocks Set",
      brand: "LEGO",
      category: "Toys",
      price: 89.99,
      discount: 0,
      stock: 20,
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "500 pieces", stock: 20 }],
    },
    {
      model: "Board Game",
      brand: "Hasbro",
      category: "Toys",
      price: 34.99,
      discount: 15,
      stock: 28,
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Standard", stock: 28 }],
    },
    {
      model: "Action Figure",
      brand: "Marvel",
      category: "Toys",
      price: 24.99,
      discount: 0,
      stock: 35,
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1608889825103-eb5ed7a6fc6f?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "One Size", stock: 35 }],
    },
    {
      model: "Puzzle 1000pc",
      brand: "Ravensburger",
      category: "Toys",
      price: 19.99,
      discount: 60,
      stock: 3,
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1606503153255-59d8b2e4b0e4?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "1000 pieces", stock: 3 }],
    },
    {
      model: "Plush Toy",
      brand: "Jellycat",
      category: "Toys",
      price: 28.0,
      discount: 0,
      stock: 25,
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1584727638745-7e72b1a16a4c?w=600&h=600&fit=crop",
      ],
      sizes: [{ size: "Medium", stock: 25 }],
    },
  ],
  reviews: [
    {
      clientName: "Sarah Johnson",
      clientRole: "Verified Buyer",
      message:
        "Amazing quality and fast shipping! I'm absolutely in love with my purchase. The product exceeded my expectations and the customer service was outstanding.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
      rating: 5,
    },
    {
      clientName: "Michael Chen",
      clientRole: "Verified Buyer",
      message:
        "Best online shopping experience I've had. The website is easy to navigate, prices are competitive, and delivery was super quick. Highly recommended!",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      rating: 5,
    },
    {
      clientName: "Emily Rodriguez",
      clientRole: "Verified Buyer",
      message:
        "I've been shopping here for months now and I'm always impressed. Great selection of products, excellent quality, and the return policy is very fair.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      rating: 5,
    },
  ],
};

async function seedDemo() {
  try {
    console.log("🌱 Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to database");

    // Check if demo tenant already exists
    const existingTenant = await Tenant.findOne({ slug: "demo" });
    if (existingTenant) {
      console.log("⚠️  Demo tenant already exists. Deleting existing data...");
      await User.deleteMany({ tenantId: existingTenant._id });
      await Category.deleteMany({ tenantId: existingTenant._id });
      await Product.deleteMany({ tenantId: existingTenant._id });
      await Review.deleteMany({ tenantId: existingTenant._id });
      await Tenant.deleteOne({ slug: "demo" });
    }

    // Create admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash("demo123", 10);

    const adminId = new mongoose.Types.ObjectId();
    demoData.tenant.owner = adminId;

    const tenant = await Tenant.create(demoData.tenant);

    const adminUser = await User.create({
      _id: adminId,
      name: "Demo Admin",
      email: "admin@demo.com",
      password: hashedPassword,
      role: "admin",
      tenantId: tenant._id,
      isDeleted: false,
      tokenVersion: 1,
    });
    console.log("✅ Admin user created (admin@demo.com / demo123)");

    // Create categories
    console.log("📁 Creating categories...");
    const categories = await Category.insertMany(
      demoData.categories.map((cat) => ({
        ...cat,
        tenantId: tenant._id,
      })),
    );
    console.log(`✅ ${categories.length} categories created`);

    // Create products
    console.log("📦 Creating products...");
    const products = await Product.insertMany(
      demoData.products.map((prod) => ({
        ...prod,
        tenantId: tenant._id,
      })),
    );
    console.log(`✅ ${products.length} products created`);

    // Create reviews
    console.log("⭐ Creating reviews...");
    const reviews = await Review.insertMany(
      demoData.reviews.map((rev) => ({
        ...rev,
        tenantId: tenant._id,
      })),
    );
    console.log(`✅ ${reviews.length} reviews created`);

    console.log("\n🎉 Demo data seeded successfully!");
    console.log("\n📋 Demo Store Details:");
    console.log(`   URL: http://localhost:3000`);
    console.log(`   Tenant Slug: demo`);
    console.log(`   Admin Email: admin@demo.com`);
    console.log(`   Admin Password: demo123`);
    console.log("\n📊 Stats:");
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log(`   Featured: ${products.filter((p) => p.isFeatured).length}`);
    console.log(`   New: ${products.filter((p) => p.isNew).length}`);
    console.log(
      `   Best Sellers: ${products.filter((p) => p.isBestSeller).length}`,
    );
    console.log(`   On Sale: ${products.filter((p) => p.discount > 0).length}`);
    console.log("\n💡 To access the demo:");
    console.log(`   1. Set NEXT_PUBLIC_DEFAULT_TENANT=demo in .env.local`);
    console.log(`   2. Or use subdomain: demo.yourdomain.com`);
    console.log(`   3. Or add header: X-Tenant-Slug: demo`);
    console.log("\n🗑️  To remove demo data:");
    console.log(`   Delete the tenant 'demo' from Super Admin panel`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding demo data:", error);
    process.exit(1);
  }
}

seedDemo();
