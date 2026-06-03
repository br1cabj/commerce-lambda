// Imports

import { Router } from "express";

import { createCoupon, toggleCoupon, sendPromoEmail, validateCoupon, getAllCoupons, deleteCoupon } from "../controllers/coupons.controllers.js";

import { verifyToken, isAdmin } from "../middleware/verifyToken.js";

const router = Router();

// Ruta privada => solo el admin puede crear el cupon.

router.post("/", verifyToken, isAdmin, createCoupon);

router.get("/", verifyToken, isAdmin, getAllCoupons); // Obtener todos los cupones

router.delete("/:id", verifyToken, isAdmin, deleteCoupon); // Eliminar cupones

// Ruta para activar/desactivar un cupón (usamos PUT porque actualizamos y le pasamos el ID)

router.put("/:id", verifyToken, isAdmin, toggleCoupon);

// Ruta para enviar los correos de promoción

router.post("/send-promo", verifyToken, isAdmin, sendPromoEmail);

// Ruta para los clientes

router.post("/validate", verifyToken, validateCoupon);

export default router;