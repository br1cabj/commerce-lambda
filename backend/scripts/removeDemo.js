import mongoose from "mongoose";
import "dotenv/config";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

async function removeDemo() {
  try {
    console.log("🗑️  Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to database");

    const tenant = await Tenant.findOne({ slug: "demo" });

    if (!tenant) {
      console.log("⚠️  Demo tenant not found. Nothing to remove.");
      process.exit(0);
    }

    console.log(`\n📋 Found demo tenant: ${tenant.name}`);
    console.log("   Deleting associated data...\n");

    // Delete all associated data
    const usersResult = await User.deleteMany({ tenantId: tenant._id });
    console.log(`   ✅ Deleted ${usersResult.deletedCount} users`);

    const categoriesResult = await Category.deleteMany({
      tenantId: tenant._id,
    });
    console.log(`   ✅ Deleted ${categoriesResult.deletedCount} categories`);

    const productsResult = await Product.deleteMany({ tenantId: tenant._id });
    console.log(`   ✅ Deleted ${productsResult.deletedCount} products`);

    const reviewsResult = await Review.deleteMany({ tenantId: tenant._id });
    console.log(`   ✅ Deleted ${reviewsResult.deletedCount} reviews`);

    // Delete tenant
    await Tenant.deleteOne({ _id: tenant._id });
    console.log(`   ✅ Deleted tenant: ${tenant.name}`);

    console.log("\n🎉 Demo data removed successfully!");
    console.log(
      "\n💡 The demo tenant and all its data have been completely removed.",
    );
    console.log(
      "   You can run 'npm run seed:demo' again if you need it back.",
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error removing demo data:", error);
    process.exit(1);
  }
}

removeDemo();
