import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: "client",
      enum: ["client", "admin", "administrador", "super_admin"],
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      street: { type: String, required: false, trim: true },
      number: { type: String, required: false, trim: true },
      city: { type: String, required: false, trim: true },
      province: { type: String, required: false, trim: true },
      zipCode: { type: String, required: false, trim: true },
    },
    points: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { tenantId: 1, email: 1 },
  { unique: true, partialFilterExpression: { tenantId: { $exists: true } } },
);

export default mongoose.model("User", userSchema);
