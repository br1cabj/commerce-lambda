import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // No hay dos cupones con las mismas palabras
        uppercase: true, // Fuerzo a que siempre se guarde en mayúsculas
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1, // El mínimo es de 1%
        max: 100 // El máximo es de 100%(gratis)
    },
    isActive: {
        type: Boolean,
        default: true // Cuando se crea un descuento, por defecto nace encendido.
    },
// Regla de canje del dueño
    pointsRequired: {
        type: Number,
        default: 0 // Si lo dejo en 0 es un cupón normal para todos, pero si le doy un valor, el usuario necesitará gastar esa cantidad de puntos para gastarlos.
    }
}, {
    timestamps: true // Guardo la fecha exacta que se creo el cupón.
});

export default mongoose.model("Coupon", couponSchema);