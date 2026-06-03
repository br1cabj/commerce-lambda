import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String, // String hace que reciba los datos en cadena de texto
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,  // Hace que no haya personas con el mismo email.
        trim: true // Saca los espacios para que no haya fallas en el email
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "client" // Aca se le asigna a los usuarios el rol de cliente.
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
    // Sistema de puntos de Onda Basquete Club.
    points: {
        type: Number,
        default: 0 // Todos los usuarios arrancan con 0 puntos.
    },
    // Borrado logico
    isDeleted: {
        type: Boolean,
        default: false // Por defecto ningun usuario nace borrado.
    }
}, {
    timestamps: true // Se guarda la fecha exacta que se crea el usuario.
})

export default mongoose.model("User", userSchema);
    
