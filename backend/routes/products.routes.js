// Imports

import { Router } from "express";

import { getAllProducts, getProductById, createProduct, deleteProduct, updateProduct, toggleFeatured } from "../controllers/products.controllers.js";

import { verifyToken, isAdmin } from "../middleware/verifyToken.js";

// Constantes

const router = Router();

router.get('/', getAllProducts); // Agarro todos los productos 

router.get('/:id', getProductById); // Busco los productos por el id

// Rutas privadas

router.post('/', verifyToken, isAdmin, createProduct); // Ruta de los nuevos productos creados

router.delete('/:id', verifyToken, isAdmin, deleteProduct); // Ruta de la funcion para borrar productos

router.put('/:id', verifyToken, isAdmin, updateProduct); // Ruta de la funcion para actualizar los productos

router.put('/:id/feature', verifyToken, isAdmin, toggleFeatured); // Ruta de la funcion para los destacados de la pagina de inicio.



export default router;