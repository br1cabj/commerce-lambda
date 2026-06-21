import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientRole: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
