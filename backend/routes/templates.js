import express from "express";
import {
  getTemplates,
  getTemplate,
  applyTemplate,
} from "../controllers/templateController.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";

const router = express.Router();

router.use(identifyTenant);

router.get("/", getTemplates);
router.get("/:templateId", getTemplate);
router.post("/apply", verifyToken, isAdminForTenant, applyTemplate);

export default router;
