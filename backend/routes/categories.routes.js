import { Router } from "express";
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} from "../controllers/categories.controllers.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";

const router = Router();

router.use(identifyTenant);

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", verifyToken, isAdminForTenant, createCategory);
router.put("/:id", verifyToken, isAdminForTenant, updateCategory);
router.delete("/:id", verifyToken, isAdminForTenant, deleteCategory);
router.put("/:id/toggle", verifyToken, isAdminForTenant, toggleCategoryStatus);

export default router;
