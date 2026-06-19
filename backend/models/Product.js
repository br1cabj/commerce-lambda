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
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },

    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true, min: 0 },
      },
    ],

    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String, required: true }],
    discount: { type: Number, default: 0, min: 0, max: 100 },
    earnedPoints: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ tenantId: 1, isDeleted: 1 });
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, isFeatured: 1 });

export default mongoose.model("Product", productSchema);
