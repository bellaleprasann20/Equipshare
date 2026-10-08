import express from "express";
import mongoose from "mongoose";

import {
  listEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  submitReview,
  canReview,
} from "../controllers/equipmentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
 * Validate equipment IDs before controllers execute.
 */
router.param("id", (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid equipment ID.",
    });
  }

  return next();
});

/*
 * List available equipment.
 *
 * GET /api/equipment
 *
 * Any authenticated manager/admin can view equipment.
 */
router.get(
  "/",
  protect,
  listEquipment
);

/*
 * Get equipment details.
 *
 * GET /api/equipment/:id
 */
router.get(
  "/:id",
  protect,
  getEquipmentById
);

/*
 * Admin creates equipment.
 *
 * POST /api/equipment
 */
router.post(
  "/",
  protect,
  requireAdmin,
  createEquipment
);

/*
 * Admin updates equipment.
 *
 * PUT /api/equipment/:id
 */
router.put(
  "/:id",
  protect,
  requireAdmin,
  updateEquipment
);

/*
 * Admin deletes equipment.
 *
 * DELETE /api/equipment/:id
 */
router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteEquipment
);

/*
 * Authenticated user submits a review.
 *
 * The controller should verify:
 * - user has completed rental/allocation
 * - user is allowed to review this equipment
 * - user has not already reviewed it
 */
router.post(
  "/:id/reviews",
  protect,
  submitReview
);

/*
 * Check whether current user can review equipment.
 */
router.get(
  "/:id/can-review",
  protect,
  canReview
);

export default router;