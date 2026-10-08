import express from "express";
import mongoose from "mongoose";

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

/*
 * Validate order IDs before reaching controllers.
 */
router.param("id", (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid order ID.",
    });
  }

  return next();
});

/*
 * Admin: view all orders.
 *
 * GET /api/orders/admin
 *
 * IMPORTANT:
 * Must be before /:id routes.
 */
router.get(
  "/admin",
  protect,
  requireAdmin,
  listAllOrders
);

/*
 * Create an order.
 *
 * POST /api/orders
 */
router.post(
  "/",
  protect,
  createOrder
);

/*
 * Current user's orders.
 *
 * GET /api/orders
 */
router.get(
  "/",
  protect,
  listMyOrders
);

/*
 * Admin approves an order.
 *
 * POST /api/orders/:id/approve
 */
router.post(
  "/:id/approve",
  protect,
  requireAdmin,
  approveOrder
);

/*
 * Admin rejects an order.
 *
 * POST /api/orders/:id/reject
 */
router.post(
  "/:id/reject",
  protect,
  requireAdmin,
  rejectOrder
);

/*
 * User cancels their own order.
 *
 * Admin can also cancel if the controller explicitly
 * allows it.
 */
router.post(
  "/:id/cancel",
  protect,
  cancelOrder
);

export default router;