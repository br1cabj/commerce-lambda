import mongoose from "mongoose";
import dotenv from "dotenv";
import Tenant from "../models/Tenant.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Coupon from "../models/Coupon.js";

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce-platform");
        console.log("Connected to MongoDB");

        const defaultOwner = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
        
        if (!defaultOwner) {
            console.log("No admin user found. Create an admin user first, then run this script.");
            await mongoose.disconnect();
            return;
        }

        let defaultTenant = await Tenant.findOne({ slug: "default-store" });
        
        if (!defaultTenant) {
            defaultTenant = await Tenant.create({
                name: "Default Store",
                slug: "default-store",
                owner: defaultOwner._id,
                theme: {
                    primaryColor: "#000000",
                    secondaryColor: "#333333",
                    accentColor: "#f28c28",
                    logoUrl: "",
                    heroImageUrl: "",
                    heroTitle: "Welcome to our store",
                    heroSubtitle: "The best products at the best price",
                    fontFamily: "Poppins"
                },
                settings: {
                    currency: "USD",
                    language: "en",
                    whatsappNumber: "",
                    email: "",
                    phone: "",
                    address: "",
                    paymentMethods: [
                        { type: "whatsapp", enabled: true, config: {} }
                    ],
                    shippingMethods: [
                        { type: "flat", enabled: true, config: { cost: 0 } }
                    ],
                    features: {
                        loyaltyPoints: false,
                        coupons: true,
                        reviews: true,
                        emailMarketing: false
                    }
                },
                isActive: true,
                plan: "premium"
            });
            console.log(`Tenant created: ${defaultTenant.name} (${defaultTenant.slug})`);
        } else {
            console.log(`Tenant already exists: ${defaultTenant.name}`);
        }

        const collections = [
            { model: User, name: "Users" },
            { model: Product, name: "Products" },
            { model: Order, name: "Orders" },
            { model: Review, name: "Reviews" },
            { model: Coupon, name: "Coupons" }
        ];

        for (const { model, name } of collections) {
            const result = await model.updateMany(
                { tenantId: { $exists: false } },
                { $set: { tenantId: defaultTenant._id } }
            );
            console.log(`${name}: ${result.modifiedCount} documents updated`);
        }

        const hardcodedCategories = ["Category 1", "Category 2", "Category 3"];
        
        for (const [index, catName] of hardcodedCategories.entries()) {
            const existing = await Category.findOne({ tenantId: defaultTenant._id, name: catName });
            if (!existing) {
                await Category.create({
                    tenantId: defaultTenant._id,
                    name: catName,
                    slug: catName.toLowerCase().replace(/\s+/g, '-'),
                    description: `${catName} category`,
                    imageUrl: "",
                    parentId: null,
                    order: index,
                    isActive: true
                });
                console.log(`Category created: ${catName}`);
            }
        }

        console.log("\nMigration completed successfully!");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

migrate();
