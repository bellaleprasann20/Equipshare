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

/*
 * Manager dashboard analytics.
 *
 * GET /api/analytics/dashboard
 */
router.get(
  "/dashboard",
  protect,
  getDashboardSummary
);

/*
 * Admin-only fleet analytics.
 *
 * GET /api/analytics/admin-summary
 */
router.get(
  "/admin-summary",
  protect,
  requireAdmin,
  getAdminSummary
);

/*
 * Current fleet utilization data.
 *
 * GET /api/analytics/utilization-trend
 */
router.get(
  "/utilization-trend",
  protect,
  getUtilizationTrend
);

/*
 * Allocation strategy comparison.
 *
 * GET /api/analytics/baseline-comparison
 */
router.get(
  "/baseline-comparison",
  protect,
  getBaselineComparison
);

/*
 * Report generation is an admin-only operation.
 *
 * POST /api/analytics/reports
 */
router.post(
  "/reports",
  protect,
  requireAdmin,
  generateReport
);

export default router;