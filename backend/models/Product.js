import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    sku: { type: String, trim: true },
    slug: { type: String, lowercase: true, trim: true, sparse: true },
    description: { type: String, default: "" },
    packageData: {
      weight: { type: Number, default: 0 },
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 }
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },

    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true, min: 0 },
        price: { type: Number, min: 0 },
        sku: { type: String, trim: true },
        imageUrl: { type: String },
      },
    ],

    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    earnedPoints: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ tenantId: 1, isDeleted: 1 });
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, isFeatured: 1 });
productSchema.index({ tenantId: 1, slug: 1 });
productSchema.index({ tenantId: 1, brand: 1, model: 1 });
productSchema.index({ tenantId: 1, brand: "text", model: "text", category: "text", description: "text" });

export default mongoose.model("Product", productSchema);
