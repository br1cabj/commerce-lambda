import { Router } from "express";
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder } from "../controllers/orders.controllers.js";
import { verifyToken, isAdmin } from "../middleware/verifyToken.js";
import { identifyTenant } from "../middleware/identifyTenant.js";
import { isAdminForTenant } from "../middleware/tenantAuth.js";

const router = Router();

router.use(identifyTenant);

router.post("/", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getMyOrders);
router.get("/all", verifyToken, isAdminForTenant, getAllOrders);
router.put("/update-status/:id", verifyToken, isAdminForTenant, updateOrderStatus);
router.delete("/:id", verifyToken, isAdminForTenant, deleteOrder);

export default router;
