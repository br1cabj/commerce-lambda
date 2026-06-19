import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
  toggleFeatured,
} from "../controllers/products.controllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";

const router = Router();

router.use(identifyTenant);

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", verifyToken, isAdminForTenant, createProduct);
router.delete("/:id", verifyToken, isAdminForTenant, deleteProduct);
router.put("/:id", verifyToken, isAdminForTenant, updateProduct);
router.put("/:id/feature", verifyToken, isAdminForTenant, toggleFeatured);

export default router;
