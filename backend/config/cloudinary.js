// 1. Importar la herramienta de Cloudinary
// (Cloudinary usa una versión específica llamada 'v2')
import { v2 as cloudinary } from 'cloudinary';

// 2. Importar y activar dotenv para que Node pueda leer el archivo .env
import dotenv from 'dotenv';
dotenv.config();

// 3. Configurar Cloudinary con nuestras llaves secretas
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 4. Exportar la herramienta ya configurada
export default cloudinary;