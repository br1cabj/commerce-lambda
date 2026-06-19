import { Router } from "express";
import {
  getStoreConfig,
  updateStoreConfig,
  updateTheme,
} from "../controllers/tenantConfig.controllers.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";

const router = Router();

router.use(identifyTenant);

router.get("/", getStoreConfig);
router.put("/", verifyToken, isAdminForTenant, updateStoreConfig);
router.put("/theme", verifyToken, isAdminForTenant, updateTheme);

export default router;
