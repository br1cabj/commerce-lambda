import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be alphanumeric with hyphens"]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    theme: {
        primaryColor: { type: String, default: "#000000" },
        secondaryColor: { type: String, default: "#333333" },
        accentColor: { type: String, default: "#f28c28" },
        logoUrl: { type: String, default: "" },
        heroImageUrl: { type: String, default: "" },
        heroTitle: { type: String, default: "Welcome to our store" },
        heroSubtitle: { type: String, default: "The best products at the best price" },
        fontFamily: { type: String, default: "Poppins" }
    },
    settings: {
        currency: { type: String, default: "USD" },
        language: { type: String, default: "en" },
        whatsappNumber: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        paymentMethods: [{
            type: { type: String, enum: ["whatsapp", "mercadopago", "stripe", "transfer"], required: true },
            enabled: { type: Boolean, default: false },
            config: { type: mongoose.Schema.Types.Mixed, default: {} }
        }],
        shippingMethods: [{
            type: { type: String, enum: ["flat", "free", "custom", "local_carrier"], required: true },
            enabled: { type: Boolean, default: false },
            config: { type: mongoose.Schema.Types.Mixed, default: {} }
        }],
        features: {
            loyaltyPoints: { type: Boolean, default: false },
            coupons: { type: Boolean, default: true },
            reviews: { type: Boolean, default: true },
            emailMarketing: { type: Boolean, default: false }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    plan: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free"
    }
}, {
    timestamps: true
});

tenantSchema.index({ slug: 1 });
tenantSchema.index({ isActive: 1 });

export default mongoose.model("Tenant", tenantSchema);
