import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce",
    );
    console.log("🔗 Connected to MongoDB\n");

    // ── 0. Clear Database for a fresh start ──
    console.log("🧹 Clearing existing database collections...");
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    console.log("🗑️  All old data deleted.\n");

    // ── 1. Super Admin ──
    const superAdminEmail = "admin@platform.com";
    const salt = await bcrypt.genSalt(10);
    const superAdminPassword = await bcrypt.hash("admin123", salt);
    
    const superAdmin = await User.create({
      name: "Super Admin",
      email: superAdminEmail,
      password: superAdminPassword,
      role: "super_admin",
      tenantId: null,
    });
    console.log("✅ Super Admin created:", superAdminEmail, "/ admin123");

    // ── 2. Tenant ──
    const tenantSlug = "demo";
    const tenant = await Tenant.create({
      name: "Mi Tienda",
      slug: tenantSlug,
      owner: superAdmin._id,
      theme: {
        primaryColor: "#1a1a2e",
        secondaryColor: "#16213e",
        accentColor: "#f28c28",
        logoUrl: "",
        heroImageUrl:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop",
        heroTitle: "Welcome to Mi Tienda",
        heroSubtitle: "The best products at the best price",
        fontFamily: "Poppins",
      },
      settings: {
        currency: "USD",
        language: "es",
        whatsappNumber: "5491112345678",
        email: "contact@mitienda.com",
        phone: "+54 11 1234-5678",
        address: "Av. Principal 123, Buenos Aires",
        paymentMethods: [
          { type: "whatsapp", enabled: true, config: {} },
          { type: "mercadopago", enabled: false, config: {} },
          { type: "stripe", enabled: false, config: {} },
        ],
        shippingMethods: [
          { type: "flat", enabled: true, config: { cost: 5 } },
          { type: "free", enabled: false, config: {} },
        ],
        features: {
          loyaltyPoints: true,
          coupons: true,
          reviews: true,
          emailMarketing: false,
        },
      },
      homeConfig: {
        defaultLanguage: "es",
        supportedLanguages: ["es"],
        faqItems: [
          {
            id: "faq-1",
            question: { en: "Do you ship worldwide?", es: "¿Hacen envíos a todo el país?" },
            answer: { en: "Yes, we ship to all provinces.", es: "Sí, realizamos envíos a todo el país." },
            enabled: true,
            order: 0
          }
        ],
        announcements: [
          { id: "ann-1", text: "¡Envío gratis en compras mayores a $50!", icon: "Truck", enabled: true, order: 0 },
          { id: "ann-2", text: "Especial Día del Padre: ¡20% de descuento con el cupón SAVE20!", icon: "Gift", enabled: true, order: 1 },
          { id: "ann-3", text: "Nuevas colecciones de invierno ya disponibles", icon: "Sparkles", enabled: true, order: 2 }
        ]
      },
      isActive: true,
      plan: "premium",
    });
    console.log("✅ Tenant created:", tenant.name, `(${tenant.slug})`);

    // ── 3. Admin User for Tenant ──
    const adminEmail = "admin@mitienda.com";
    const adminPassword = await bcrypt.hash("admin123", salt);
    await User.create({
      tenantId: tenant._id,
      name: "Store Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    console.log("✅ Admin user created:", adminEmail, "/ admin123");

    // ── 4. Sample Client Users ──
    const clients = [
      {
        name: "Juan Pérez",
        email: "juan@email.com",
        phone: "+54 11 5555-0001",
      },
      {
        name: "María García",
        email: "maria@email.com",
        phone: "+54 11 5555-0002",
      },
      {
        name: "Carlos López",
        email: "carlos@email.com",
        phone: "+54 11 5555-0003",
      },
    ];

    for (const c of clients) {
      const clientPassword = await bcrypt.hash("client123", salt);
      await User.create({
        tenantId: tenant._id,
        name: c.name,
        email: c.email,
        password: clientPassword,
        role: "client",
        phone: c.phone,
        points: Math.floor(Math.random() * 100),
      });
      console.log(`✅ Client created: ${c.email} / client123`);
    }

    // ── 5. Categories ──
    const categories = [
      {
        name: "Sneakers",
        slug: "sneakers",
        description: "The latest sneakers",
        imageUrl: "",
        order: 1,
      },
      {
        name: "Running",
        slug: "running",
        description: "Running shoes",
        imageUrl: "",
        order: 2,
      },
      {
        name: "Casual",
        slug: "casual",
        description: "Everyday comfort",
        imageUrl: "",
        order: 3,
      },
      {
        name: "Boots",
        slug: "boots",
        description: "Durable boots",
        imageUrl: "",
        order: 4,
      },
    ];

    for (const cat of categories) {
      await Category.create({ ...cat, tenantId: tenant._id, isActive: true });
      console.log(`✅ Category created: ${cat.name}`);
    }

    // ── 6. Products with Tags (testing tags filter!) ──
    const products = [
      {
        model: "Air Max 90",
        brand: "Nike",
        category: "Sneakers",
        price: 129.99,
        discount: 15,
        earnedPoints: 13,
        isFeatured: true,
        sizes: [
          { size: "38", stock: 5 },
          { size: "39", stock: 8 },
          { size: "40", stock: 10 },
          { size: "41", stock: 7 },
          { size: "42", stock: 4 },
          { size: "43", stock: 2 },
        ],
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
        ],
        tags: ["dia-del-padre", "nike", "running", "deporte", "premium"]
      },
      {
        model: "Ultraboost 22",
        brand: "Adidas",
        category: "Running",
        price: 179.99,
        discount: 0,
        earnedPoints: 18,
        isFeatured: true,
        sizes: [
          { size: "39", stock: 6 },
          { size: "40", stock: 9 },
          { size: "41", stock: 12 },
          { size: "42", stock: 8 },
          { size: "43", stock: 3 },
        ],
        images: [
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&auto=format&fit=crop",
        ],
        tags: ["dia-del-padre", "adidas", "running", "deporte"]
      },
      {
        model: "Classic Leather",
        brand: "Reebok",
        category: "Casual",
        price: 89.99,
        discount: 20,
        earnedPoints: 9,
        isFeatured: false,
        sizes: [
          { size: "38", stock: 10 },
          { size: "39", stock: 15 },
          { size: "40", stock: 12 },
          { size: "41", stock: 8 },
          { size: "42", stock: 5 },
        ],
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop",
        ],
        tags: ["casual", "reebok", "retro"]
      },
      {
        model: "Old Skool",
        brand: "Vans",
        category: "Casual",
        price: 69.99,
        discount: 0,
        earnedPoints: 7,
        isFeatured: true,
        sizes: [
          { size: "37", stock: 8 },
          { size: "38", stock: 12 },
          { size: "39", stock: 15 },
          { size: "40", stock: 10 },
          { size: "41", stock: 6 },
          { size: "42", stock: 4 },
        ],
        images: [
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&auto=format&fit=crop",
        ],
        tags: ["casual", "vans", "skate", "retro"]
      },
      {
        model: "Gel-Kayano 29",
        brand: "Asics",
        category: "Running",
        price: 159.99,
        discount: 10,
        earnedPoints: 16,
        isFeatured: false,
        sizes: [
          { size: "40", stock: 7 },
          { size: "41", stock: 10 },
          { size: "42", stock: 5 },
          { size: "43", stock: 3 },
        ],
        images: [
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop",
        ],
        tags: ["running", "asics", "deporte"]
      },
      {
        model: "Timberland 6-Inch",
        brand: "Timberland",
        category: "Boots",
        price: 199.99,
        discount: 0,
        earnedPoints: 20,
        isFeatured: true,
        sizes: [
          { size: "40", stock: 4 },
          { size: "41", stock: 6 },
          { size: "42", stock: 8 },
          { size: "43", stock: 5 },
          { size: "44", stock: 2 },
        ],
        images: [
          "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop",
        ],
        tags: ["dia-del-padre", "boots", "timberland", "cuero", "premium"]
      },
      {
        model: "Chuck Taylor All Star",
        brand: "Converse",
        category: "Casual",
        price: 59.99,
        discount: 0,
        earnedPoints: 6,
        isFeatured: false,
        sizes: [
          { size: "36", stock: 10 },
          { size: "37", stock: 15 },
          { size: "38", stock: 20 },
          { size: "39", stock: 18 },
          { size: "40", stock: 12 },
          { size: "41", stock: 8 },
          { size: "42", stock: 5 },
          { size: "43", stock: 3 },
        ],
        images: [
          "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&auto=format&fit=crop",
        ],
        tags: ["casual", "converse", "retro"]
      },
      {
        model: "New Balance 574",
        brand: "New Balance",
        category: "Sneakers",
        price: 99.99,
        discount: 25,
        earnedPoints: 10,
        isFeatured: true,
        sizes: [
          { size: "39", stock: 8 },
          { size: "40", stock: 12 },
          { size: "41", stock: 10 },
          { size: "42", stock: 6 },
          { size: "43", stock: 4 },
        ],
        images: [
          "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop",
        ],
        tags: ["dia-del-padre", "new-balance", "sneakers", "casual"]
      },
    ];

    for (const p of products) {
      const stock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
      await Product.create({ ...p, tenantId: tenant._id, stock });
      console.log(`✅ Product created: ${p.brand} ${p.model}`);
    }

    // ── 7. Coupons ──
    const coupons = [
      {
        code: "WELCOME10",
        discountPercentage: 10,
        pointsRequired: 0,
        isActive: true,
      },
      {
        code: "SAVE20",
        discountPercentage: 20,
        pointsRequired: 50,
        isActive: true,
      },
      {
        code: "FLASH15",
        discountPercentage: 15,
        pointsRequired: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const c of coupons) {
      await Coupon.create({ ...c, tenantId: tenant._id });
      console.log(
        `✅ Coupon created: ${c.code} (${c.discountPercentage}% off)`,
      );
    }

    // ── 8. Reviews ──
    const reviews = [
      {
        clientName: "Ana Martínez",
        clientRole: "Verified Buyer",
        message:
          "Amazing quality! The shoes arrived quickly and fit perfectly. Will definitely buy again.",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
      },
      {
        clientName: "Roberto Sánchez",
        clientRole: "Professional Athlete",
        message:
          "I use these for training every day. Excellent support and durability. Highly recommended!",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
      },
      {
        clientName: "Laura Fernández",
        clientRole: "Fashion Blogger",
        message:
          "The design is stunning and they're super comfortable. Perfect for everyday wear.",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop",
      },
    ];

    for (const r of reviews) {
      await Review.create({ ...r, tenantId: tenant._id });
      console.log(`✅ Review created: ${r.clientName}`);
    }

    // ── Summary ──
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("\n📧 LOGIN CREDENTIALS:");
    console.log("  Super Admin: admin@platform.com / admin123");
    console.log("  Store Admin: admin@mitienda.com   / admin123");
    console.log("  Client:      juan@email.com        / client123");
    console.log("\n🔗 STORE URL: http://localhost:3000");
    console.log("🛠️  ADMIN URL: http://localhost:3000/admin");
    console.log("🏢 SUPER ADMIN URL: http://localhost:3000/super");
    console.log("\n⚠️  Change these passwords in production!\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
