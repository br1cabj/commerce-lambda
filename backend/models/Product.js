import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    // Separo los productos en secciones
    category: { 
        type: String, 
        enum: ['Zapatillas', 'Indumentaria', 'Accesorios'], 
        default: 'Zapatillas',
        required: true
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true },
    price: { type: Number, required: true },
    
    sizes: [{
        size: { type: String, required: true }, // Cambiado a String para soportar S, M, L o "Único"
        stock: { type: Number, required: true, min: 0 }
    }],
    
    stock: { type: Number, default: 0 },
    images: [{ type: String, required: true }],
    discount: { type: Number, default: 0 },
    earnedPoints: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true 
});

export default mongoose.model("Product", productSchema);