import { Router } from "express";
import {
  createCoupon,
  toggleCoupon,
  sendPromoEmail,
  validateCoupon,
  getAllCoupons,
  deleteCoupon,
} from "../controllers/coupons.controllers.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";

const router = Router();

router.use(identifyTenant);

router.post("/", verifyToken, isAdminForTenant, createCoupon);
router.get("/", verifyToken, isAdminForTenant, getAllCoupons);
router.delete("/:id", verifyToken, isAdminForTenant, deleteCoupon);
router.put("/:id", verifyToken, isAdminForTenant, toggleCoupon);
router.post("/send-promo", verifyToken, isAdminForTenant, sendPromoEmail);
router.post("/validate", verifyToken, validateCoupon);

export default router;
