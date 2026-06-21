import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import homeRoutes from "./routes/home.routes.js";
import productsRoutes from "./routes/products.routes.js";
import fileUpload from "express-fileupload";
import { connectDB } from "./config/db.js";
import usersRoutes from "./routes/users.routes.js";
import "./config/mailer.js";
import couponsRoutes from "./routes/coupons.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import shippingRoutes from "./routes/shipping.routes.js";
import cors from "cors";
import reviewsRoutes from "./routes/reviews.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import superAdminRoutes from "./routes/superAdmin.routes.js";
import tenantConfigRoutes from "./routes/tenantConfig.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import homeConfigRoutes from "./routes/homeConfig.js";
import templateRoutes from "./routes/templates.js";
import emailsRoutes from "./routes/emails.js";
import paymentsRoutes, {
  handleStripeWebhook,
  handleMercadoPagoWebhook,
} from "./routes/payments.routes.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

const corsOrigin = process.env.FRONTEND_URL || false;
if (!corsOrigin) {
  console.warn(
    "WARNING: FRONTEND_URL is not set. CORS will allow all origins. This is NOT safe for production.",
  );
}

const corsOptions = {
  origin: corsOrigin || true,
  credentials: !!corsOrigin,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again in 15 minutes.",
});
app.use("/api/", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts, please try again in 15 minutes.",
});

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users/forgot-password", authLimiter);

const tmpDir = os.tmpdir();

app.post(
  "/api/payments/webhook/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);
app.post(
  "/api/payments/webhook/mercadopago",
  express.json(),
  handleMercadoPagoWebhook,
);

app.use(express.json({ limit: "10mb" }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: tmpDir,
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: true,
  }),
);

app.use("/", homeRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/store", tenantConfigRoutes);
app.use("/api/store/home-config", homeConfigRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/super", superAdminRoutes);
app.use("/api/emails", emailsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const port = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        console.log("HTTP server closed.");
        try {
          await mongoose.disconnect();
          console.log("Database connection closed.");
        } catch (err) {
          console.error("Error closing database connection:", err);
        }
        process.exit(0);
      });

      setTimeout(() => {
        console.error("Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
