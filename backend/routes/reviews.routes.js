import { Router } from "express";
import {
  getAllReviews,
  createReview,
  deleteReview,
} from "../controllers/reviews.controllers.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";

const router = Router();

router.use(identifyTenant);

router.get("/", getAllReviews);
router.post("/", verifyToken, isAdminForTenant, createReview);
router.delete("/:id", verifyToken, isAdminForTenant, deleteReview);

export default router;
