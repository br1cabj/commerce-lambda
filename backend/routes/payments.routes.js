import { Router } from "express";
import { createMercadoPagoPreference, handleMercadoPagoWebhook } from "../controllers/mercadopago.controllers.js";
import { createStripeSession, handleStripeWebhook } from "../controllers/stripe.controllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { identifyTenant } from "../middleware/identifyTenant.js";

const router = Router();

router.use(identifyTenant);

router.post("/mercadopago/create-preference", verifyToken, createMercadoPagoPreference);
router.post("/stripe/create-session", verifyToken, createStripeSession);

export { handleMercadoPagoWebhook, handleStripeWebhook };
export default router;
