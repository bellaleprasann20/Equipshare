import express from "express";
import {
  createOrder,
  listMyOrders,
  listAllOrders,
  approveOrder,
  rejectOrder,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/admin", protect, requireAdmin, listAllOrders);

router.post("/", protect, createOrder);
router.get("/", protect, listMyOrders);
router.post("/:id/approve", protect, requireAdmin, approveOrder);
router.post("/:id/reject", protect, requireAdmin, rejectOrder);
router.post("/:id/cancel", protect, cancelOrder);

export default router;