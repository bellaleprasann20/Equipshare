import express from "express";
import { createOrder, listMyOrders, cancelOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, listMyOrders);
router.post("/:id/cancel", protect, cancelOrder);

export default router;