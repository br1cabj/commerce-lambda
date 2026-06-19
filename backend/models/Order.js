import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      number: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    trackingCode: {
      type: String,
      default: "",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: null,
    },
    discountApplied: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "Pendiente",
        "En Preparación",
        "Enviado",
        "Entregado",
        "Cancelado",
      ],
      default: "Pendiente",
    },
    paymentMethod: {
      type: String,
      default: "whatsapp",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed", "refunded"],
      default: "pending",
    },
    externalReference: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ tenantId: 1, user: 1 });
orderSchema.index({ tenantId: 1, status: 1 });
orderSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
