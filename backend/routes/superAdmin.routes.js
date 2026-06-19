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
import { verifyToken, isSuperAdmin } from "../middleware/tenantAuth.js";

const router = Router();

router.use(verifyToken);
router.use(isSuperAdmin);

router.get("/", getAllTenants);
router.get("/analytics", getPlatformAnalytics);
router.get("/:id", getTenantById);
router.post("/", createTenant);
router.put("/:id", updateTenant);
router.put("/:id/toggle-status", toggleTenantStatus);
router.delete("/:id", deleteTenant);

export default router;
