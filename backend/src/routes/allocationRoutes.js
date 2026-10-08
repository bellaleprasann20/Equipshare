import express from "express";
import mongoose from "mongoose";

import {
  requestAllocation,
  getAllocationResults,
  listPendingAllocations,
  approveAllocation,
  rejectAllocation,
  getAllocationHistory,
} from "../controllers/allocationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
 * Validate MongoDB request IDs before reaching controllers.
 */
router.param("requestId", (req, res, next, requestId) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({
      message: "Invalid allocation request ID.",
    });
  }

  return next();
});

/*
 * Allocation history
 *
 * GET /api/allocations/history
 *
 * Must be before /:requestId.
 */
router.get(
  "/history",
  protect,
  getAllocationHistory
);

/*
 * Admin pending allocation requests
 *
 * GET /api/allocations/admin/pending
 *
 * Must be before /:requestId.
 */
router.get(
  "/admin/pending",
  protect,
  requireAdmin,
  listPendingAllocations
);

/*
 * Create one Smart Allocation requirement.
 *
 * POST /api/allocations
 *
 * Manager only in normal usage.
 */
router.post(
  "/",
  protect,
  requestAllocation
);

/*
 * Get one allocation request and its
 * ranked recommendations.
 *
 * GET /api/allocations/:requestId
 */
router.get(
  "/:requestId",
  protect,
  getAllocationResults
);

/*
 * Admin approves a recommendation.
 *
 * POST /api/allocations/:requestId/approve
 */
router.post(
  "/:requestId/approve",
  protect,
  requireAdmin,
  approveAllocation
);

/*
 * Admin rejects an allocation request.
 *
 * POST /api/allocations/:requestId/reject
 */
router.post(
  "/:requestId/reject",
  protect,
  requireAdmin,
  rejectAllocation
);

export default router;