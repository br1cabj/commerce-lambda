import { Router } from "express";
import { calculateShipping } from "../controllers/shipping.controllers.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// Ruta donde el checkout preguntará el precio del envío.

router.post("/calculate", verifyToken, calculateShipping);

export default router;