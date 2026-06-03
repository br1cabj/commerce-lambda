// Imports

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    // Quien hizo la compra?(usuario)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Que se compro?(orden de compra).
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, min: 1},
            price: { type: Number, required: true}
        }
    ],
    // A donde se envia el paquete.
    shippingAddress: {
        street: { type: String, required: true },
        number: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
        zipCode: { type: String, required: true}
    },
    // Datos del Correo Argentino(Envio y Seguimiento)
    shippingCost: {
        type: Number,
        required: true,
        default: 0 // Lo que cuesta el envio.
    },
    trackingCode: {
        type: String,
        default: "" // Aqui se va a copiar el codigo de Correo Argentino cuando despache el producto.
    },
    // Total de cuanto se pago (productos + envios + descuentos)
    totalAmount: {
        type: Number,
        required: true
    },
    // Estado visual de la compra.
    status: {
        type: String,
        enum: ["Pendiente", "En Preparación", "Enviado", "Entregado", "Cancelado"],
        default: "Pendiente"
    }
}, {
    timestamps: true
});

export default mongoose.model("Order", orderSchema);