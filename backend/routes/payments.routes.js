import { Router } from "express";
import { createMercadoPagoPreference, handleMercadoPagoWebhook } from "../controllers/mercadopago.controllers.js";
import { createStripeSession, handleStripeWebhook } from "../controllers/stripe.controllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { identifyTenant } from "../middleware/identifyTenant.js";

const router = Router();

router.use(identifyTenant);

// MercadoPago
router.post("/mercadopago/create-preference", verifyToken, createMercadoPagoPreference);
router.post("/webhook/mercadopago", handleMercadoPagoWebhook);

// Stripe
router.post("/stripe/create-session", verifyToken, createStripeSession);
router.post("/webhook/stripe", handleStripeWebhook);

export default router;
