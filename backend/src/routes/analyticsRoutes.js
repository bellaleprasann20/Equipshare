import express from "express";
import {
  getDashboardSummary,
  getAdminSummary,
  getUtilizationTrend,
  getBaselineComparison,
  generateReport,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardSummary);
router.get("/admin-summary", protect, requireAdmin, getAdminSummary);
router.get("/utilization-trend", protect, getUtilizationTrend);
router.get("/baseline-comparison", protect, getBaselineComparison);
router.post("/reports", protect, requireAdmin, generateReport);

export default router;