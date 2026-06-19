import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    },
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    isActive: {
        type: Boolean,
        default: true
    },
    pointsRequired: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export default mongoose.model("Coupon", couponSchema);
