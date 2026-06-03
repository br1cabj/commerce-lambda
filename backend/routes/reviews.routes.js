import { Router } from "express";
import { getAllReviews, createReview, deleteReview } from "../controllers/reviews.controllers.js";
import { verifyToken, isAdmin } from "../middleware/verifyToken.js";

const router = Router();

// Ruta pública para que cualquiera pueda leer las reseñas en el inicio
router.get('/', getAllReviews);

// Rutas privadas para que solo el Admin pueda crearlas o borrarlas
router.post('/', verifyToken, isAdmin, createReview);
router.delete('/:id', verifyToken, isAdmin, deleteReview);

export default router;