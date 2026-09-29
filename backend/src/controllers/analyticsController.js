import Equipment from "../models/Equipment.js";
import AllocationRequest from "../models/AllocationRequest.js";
import { calculateEEI, computeFleetCostRange } from "../services/eeiCalculator.js";

/**
 * GET /api/analytics/dashboard
 */
export async function getDashboardSummary(req, res) {
  try {
    const [activeAllocations, pendingRequests, equipmentList] = await Promise.all([
      AllocationRequest.countDocuments({ requestedBy: req.user.id, status: "active" }),
      AllocationRequest.countDocuments({ requestedBy: req.user.id, status: "pending" }),
      Equipment.find({}).lean(),
    ]);

    const fleetCostRange = computeFleetCostRange(equipmentList);
    const scores = equipmentList.map((eq) => calculateEEI(eq, fleetCostRange).score);
    const avgEEI = scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null;

    const utilizationByEquipment = equipmentList.slice(0, 8).map((eq) => {
      const total = (eq.operatingHoursLast30Days || 0) + (eq.idleHoursLast30Days || 0);
      const utilization = total ? Math.round((eq.operatingHoursLast30Days / total) * 100) : 0;
      return { label: eq.name, utilization, idle: 100 - utilization };
    });

    const recentRequests = await AllocationRequest.find({ requestedBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const recentActivity = recentRequests.map((r) => ({
      _id: r._id,
      message: `Requested ${r.equipmentType} for ${r.projectLocation} (${r.status})`,
      createdAt: r.createdAt,
    }));

    res.json({ activeAllocations, pendingRequests, avgEEI, utilizationByEquipment, recentActivity });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard.", error: err.message });
  }
}

/**
 * GET /api/analytics/admin-summary
 */
export async function getAdminSummary(req, res) {
  try {
    const equipmentList = await Equipment.find({}).lean();
    const fleetCostRange = computeFleetCostRange(equipmentList);

    const scored = equipmentList.map((eq) => ({
      ...eq,
      eeiScore: calculateEEI(eq, fleetCostRange).score,
    }));

    const totalEquipment = scored.length;

    const overdueMaintenance = scored.filter((eq) => {
      if (!eq.lastServiceDate) return true;
      const daysSince = (Date.now() - new Date(eq.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= (eq.maintenanceIntervalDays || 90);
    }).length;

    const utilizations = scored.map((eq) => {
      const total = (eq.operatingHoursLast30Days || 0) + (eq.idleHoursLast30Days || 0);
      return total ? (eq.operatingHoursLast30Days / total) * 100 : 0;
    });
    const avgUtilization = utilizations.length
      ? Math.round(utilizations.reduce((a, b) => a + b, 0) / utilizations.length)
      : 0;

    const lowestPerformingEquipment = [...scored]
      .sort((a, b) => a.eeiScore - b.eeiScore)
      .slice(0, 10);

    const fleetUtilization = scored.slice(0, 10).map((eq) => {
      const total = (eq.operatingHoursLast30Days || 0) + (eq.idleHoursLast30Days || 0);
      const utilization = total ? Math.round((eq.operatingHoursLast30Days / total) * 100) : 0;
      return { label: eq.name, utilization, idle: 100 - utilization };
    });

    res.json({ totalEquipment, overdueMaintenance, avgUtilization, lowestPerformingEquipment, fleetUtilization });
  } catch (err) {
    res.status(500).json({ message: "Failed to load admin summary.", error: err.message });
  }
}

/**
 * GET /api/analytics/utilization-trend
 * MVP note: real week-over-week trend needs historical snapshots
 * (a scheduled job saving daily/weekly utilization). Without that
 * table yet, this returns the current snapshot only. Documented
 * as a known simplification for the paper's evaluation section —
 * research/algorithms/baselines/ should use real experiment runs
 * instead of this live endpoint for the actual paper results.
 */
export async function getUtilizationTrend(req, res) {
  try {
    const equipmentList = await Equipment.find({}).limit(8).lean();
    const trend = equipmentList.map((eq) => {
      const total = (eq.operatingHoursLast30Days || 0) + (eq.idleHoursLast30Days || 0);
      const utilization = total ? Math.round((eq.operatingHoursLast30Days / total) * 100) : 0;
      return { label: eq.name, utilization, idle: 100 - utilization };
    });
    res.json({ trend });
  } catch (err) {
    res.status(500).json({ message: "Failed to load utilization trend.", error: err.message });
  }
}

/**
 * GET /api/analytics/baseline-comparison
 * Placeholder until research/evaluation/run_experiments.js
 * produces real baseline-vs-proposed numbers — returns a
 * static illustrative comparison so the UI has something to
 * render. Replace with real experiment output before writing
 * the paper's results section.
 */
export async function getBaselineComparison(req, res) {
  res.json({
    comparison: [
      { label: "First Available", utilization: 52, idle: 48 },
      { label: "Nearest Equipment", utilization: 61, idle: 39 },
      { label: "Highest EEI Only", utilization: 68, idle: 32 },
      { label: "Proposed (Multi-Factor)", utilization: 79, idle: 21 },
    ],
  });
}

/**
 * POST /api/analytics/reports
 * Body: { type, rangeDays }
 * MVP: not generating real files yet — returns a placeholder.
 * A real implementation would generate a CSV/PDF and either
 * stream it or upload to S3 and return a signed URL.
 */
export async function generateReport(req, res) {
  res.status(501).json({ message: "Report generation is not implemented yet." });
}