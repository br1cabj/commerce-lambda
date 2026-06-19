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

const router = Router();

router.use(identifyTenant);

router.post("/register", validateSchema(registerSchema), registerUser);
router.post("/login", validateSchema(loginSchema), loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/update-password", verifyToken, updatePassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", verifyToken, getUserProfile);

export default router;
