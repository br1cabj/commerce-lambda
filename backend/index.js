// Imports de archivos
import express from 'express';
import homeRoutes from './routes/home.routes.js';
import productsRoutes from './routes/products.routes.js';
import fileUpload from 'express-fileupload';
import { connectDB } from './config/db.js';
import usersRoutes from "./routes/users.routes.js";
import "./config/mailer.js";
import couponsRoutes from './routes/coupons.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import shippingRoutes from './routes/shipping.routes.js'; // NUEVA IMPORTACIÓN
import cors from "cors";
import reviewsRoutes from './routes/reviews.routes.js';

// Constantes
const app = express();

app.use(cors()); // Esto permite que el Frontend se conecte sin bloqueos
app.use(express.json());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/'
}));

app.use('/', homeRoutes);
app.use('/api/products', productsRoutes);
app.use("/api/users", usersRoutes);
app.use('/api/orders', ordersRoutes); 
app.use('/api/coupons', couponsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Calculador de envíos
app.use('/api/shipping', shippingRoutes);

const port = 3001;

// Evento de app
connectDB();

app.listen(port, () => {
    console.log("Servidor de Onda Basquete encendido en el puerto 3001");
});