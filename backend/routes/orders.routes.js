import { Router } from "express";
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder } from "../controllers/orders.controllers.js";
import { verifyToken, isAdmin } from "../middleware/verifyToken.js";

const router = Router();

// Ruta PRIVADA para clientes: Tienen que tener la pulsera (estar logueados) para comprar

router.post("/", verifyToken, createOrder);

// Historial del cliente

router.get("/my-orders", verifyToken, getMyOrders);

// Panel del administrador

router.get("/all", verifyToken, isAdmin, getAllOrders);

router.put("/update-status/:id", verifyToken, isAdmin, updateOrderStatus);

// Eliminar orden del pedido.

router.delete("/:id", verifyToken, isAdmin, deleteOrder);

export default router;