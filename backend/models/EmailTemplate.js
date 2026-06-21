import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    trigger: {
      type: String,
      enum: ["ORDER_CONFIRMED", "ORDER_SHIPPED", "WELCOME_USER", "PASSWORD_RESET"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      default: "Notification from our store",
    },
    bodyHtml: {
      type: String,
      required: true,
      default: "<h1>Hello!</h1><p>You have a new notification.</p>",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure only one trigger type per tenant
emailTemplateSchema.index({ tenantId: 1, trigger: 1 }, { unique: true });

export default mongoose.model("EmailTemplate", emailTemplateSchema);
