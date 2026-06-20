import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug debe ser alfanumerico con guiones",
      ],
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    backgroundColor: {
      type: String,
      default: "",
    },
    displayStyle: {
      type: String,
      enum: ["image", "icon", "gradient"],
      default: "image",
    },
    showOnHome: {
      type: Boolean,
      default: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
categorySchema.index({ tenantId: 1, isActive: 1 });

export default mongoose.model("Category", categorySchema);
