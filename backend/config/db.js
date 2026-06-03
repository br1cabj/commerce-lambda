import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Aviso a mongoose que se conecte usando la llave oculta en el .env
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Base de datos conectada con éxito a Onda Basquete!");
    }catch (error) {
        console.log("Error al conectar a la base de datos:", error);
    }
};