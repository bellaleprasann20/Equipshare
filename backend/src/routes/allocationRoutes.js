import express from "express";
import {
  requestAllocation,
  getAllocationResults,
  confirmAllocation,
  getAllocationHistory,
} from "../controllers/allocationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// NOTE: /history must come before /:requestId so Express doesn't
// try to treat "history" as a requestId value.
router.get("/history", protect, getAllocationHistory);

router.post("/", protect, requestAllocation); // POST /api/allocate
router.get("/:requestId", protect, getAllocationResults);
router.post("/:requestId/confirm", protect, confirmAllocation);

export default router;