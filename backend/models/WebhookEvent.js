import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "mercadopago"],
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
      index: { expires: "30d" },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("WebhookEvent", webhookEventSchema);
