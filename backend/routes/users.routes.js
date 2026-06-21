import { Router } from "express";
import {
  registerUser,
  loginUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUserProfile,
} from "../controllers/users.controllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import validateSchema, {
  registerSchema,
  loginSchema,
} from "../middleware/validation.js";
import { identifyTenant } from "../middleware/identifyTenant.js";

import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(identifyTenant);

router.post("/register", authLimiter, validateSchema(registerSchema), registerUser);
router.post("/login", authLimiter, validateSchema(loginSchema), loginUser);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/update-password", verifyToken, updatePassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", verifyToken, getUserProfile);

export default router;
