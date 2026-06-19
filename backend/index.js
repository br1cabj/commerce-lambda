import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import homeRoutes from './routes/home.routes.js';
import productsRoutes from './routes/products.routes.js';
import fileUpload from 'express-fileupload';
import { connectDB } from './config/db.js';
import usersRoutes from "./routes/users.routes.js";
import "./config/mailer.js";
import couponsRoutes from './routes/coupons.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import cors from "cors";
import reviewsRoutes from './routes/reviews.routes.js';
import errorHandler from './middleware/errorHandler.js';
import superAdminRoutes from './routes/superAdmin.routes.js';
import tenantConfigRoutes from './routes/tenantConfig.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import paymentsRoutes from './routes/payments.routes.js';

const app = express();

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again in 15 minutes."
});
app.use('/api/', limiter);

const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

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
app.use('/api/shipping', shippingRoutes);
app.use('/api/store', tenantConfigRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/super', superAdminRoutes);
app.use('/api/payments', paymentsRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3001;

connectDB();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
