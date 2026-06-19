import { Router } from "express";
import { calculateShipping } from "../controllers/shipping.controllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { identifyTenant } from "../middleware/identifyTenant.js";

const router = Router();

router.use(identifyTenant);

router.post("/calculate", verifyToken, calculateShipping);

export default router;
