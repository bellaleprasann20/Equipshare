import express from "express";
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

// Specific paths before the :requestId wildcard, or Express will
// try to treat "history"/"admin" as a requestId value.
router.get("/history", protect, getAllocationHistory);
router.get("/admin/pending", protect, requireAdmin, listPendingAllocations);

router.post("/", protect, requestAllocation);
router.get("/:requestId", protect, getAllocationResults);
router.post("/:requestId/approve", protect, requireAdmin, approveAllocation);
router.post("/:requestId/reject", protect, requireAdmin, rejectAllocation);

export default router;