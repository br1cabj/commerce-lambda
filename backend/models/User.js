import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: false
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "client"
    },
    phone: {
        type: String,
        required: false
    },
    address: {
        street: { type: String, required: false, trim: true},
        number: { type: String, required: false, trim: true},
        city: { type: String, required: false, trim: true},
        province: { type: String, required: false, trim: true},
        zipCode: { type: String, required: false, trim: true}
    },
    points: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

userSchema.index({ tenantId: 1, email: 1 }, { unique: true, partialFilterExpression: { tenantId: { $exists: true } } });

export default mongoose.model("User", userSchema);
