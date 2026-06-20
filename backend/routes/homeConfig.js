import express from "express";
import {
  getHomeConfig,
  updateHomeConfig,
  updateHeroSlides,
  updateBanners,
  updateTrustSignals,
  updateSections,
  updateTranslations,
} from "../controllers/homeConfigController.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";

const router = express.Router();

router.use(identifyTenant);

router.get("/", getHomeConfig);

router.put("/", verifyToken, isAdminForTenant, updateHomeConfig);
router.put("/hero-slides", verifyToken, isAdminForTenant, updateHeroSlides);
router.put("/banners", verifyToken, isAdminForTenant, updateBanners);
router.put("/trust-signals", verifyToken, isAdminForTenant, updateTrustSignals);
router.put("/sections", verifyToken, isAdminForTenant, updateSections);
router.put("/translations", verifyToken, isAdminForTenant, updateTranslations);

export default router;
