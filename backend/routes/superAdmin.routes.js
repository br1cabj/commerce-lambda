import { Router } from "express";
import {
    createTenant,
    getAllTenants,
    getTenantById,
    updateTenant,
    toggleTenantStatus,
    deleteTenant,
    getPlatformAnalytics
} from "../controllers/superAdmin.controllers.js";
import { verifyToken, isAdmin } from "../middleware/verifyToken.js";

const router = Router();

router.get("/", verifyToken, isAdmin, getAllTenants);
router.get("/analytics", verifyToken, isAdmin, getPlatformAnalytics);
router.get("/:id", verifyToken, isAdmin, getTenantById);
router.post("/", verifyToken, isAdmin, createTenant);
router.put("/:id", verifyToken, isAdmin, updateTenant);
router.put("/:id/toggle-status", verifyToken, isAdmin, toggleTenantStatus);
router.delete("/:id", verifyToken, isAdmin, deleteTenant);

export default router;
