import { Router } from "express";
import {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  toggleTenantStatus,
  deleteTenant,
  getPlatformAnalytics,
} from "../controllers/superAdmin.controllers.js";
import { isSuperAdmin } from "../middleware/tenantAuth.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.use(verifyToken);
router.use(isSuperAdmin);

router.get("/tenants", getAllTenants);
router.get("/analytics", getPlatformAnalytics);
router.get("/tenants/:id", getTenantById);
router.post("/tenants", createTenant);
router.put("/tenants/:id", updateTenant);
router.put("/tenants/:id/toggle-status", toggleTenantStatus);
router.delete("/tenants/:id", deleteTenant);

export default router;
