import Equipment from "../models/Equipment.js";
import AllocationRequest from "../models/AllocationRequest.js";
import {
  calculateEEI,
  computeFleetCostRange,
} from "../services/eeiCalculator.js";

/* =========================================================
   HELPERS
   ========================================================= */

function calculateUtilization(equipment) {
  const operating = Number(equipment.operatingHoursLast30Days) || 0;
  const idle = Number(equipment.idleHoursLast30Days) || 0;

  const total = operating + idle;

  if (total <= 0) {
    return {
      utilization: 0,
      idle: 0,
    };
  }

  const utilization = Math.round(
    (operating / total) * 100
  );

  return {
    utilization,
    idle: 100 - utilization,
  };
}

/* =========================================================
   GET /api/analytics/dashboard
   ========================================================= */

export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;

    const [
      activeAllocations,
      pendingRequests,
      equipmentList,
      recentRequests,
    ] = await Promise.all([
      AllocationRequest.countDocuments({
        requestedBy: userId,
        status: "active",
      }),

      AllocationRequest.countDocuments({
        requestedBy: userId,
        status: "pending",
      }),

      Equipment.find({}).lean(),

      AllocationRequest.find({
        requestedBy: userId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const fleetCostRange =
      computeFleetCostRange(equipmentList);

    const scores = equipmentList
      .map((equipment) =>
        calculateEEI(equipment, fleetCostRange)?.score
      )
      .filter(
        (score) =>
          Number.isFinite(Number(score))
      )
      .map(Number);

    const avgEEI = scores.length
      ? Math.round(
          (scores.reduce(
            (sum, score) => sum + score,
            0
          ) /
            scores.length) *
            10
        ) / 10
      : null;

    const utilizationByEquipment =
      equipmentList.slice(0, 8).map((equipment) => {
        const { utilization, idle } =
          calculateUtilization(equipment);

        return {
          label: equipment.name,
          utilization,
          idle,
        };
      });

    const recentActivity = recentRequests.map(
      (request) => ({
        _id: request._id,
        message: `Requested ${request.equipmentType} for ${request.projectLocation}.`,
        status: request.status,
        createdAt: request.createdAt,
      })
    );

    return res.json({
      activeAllocations,
      pendingRequests,
      avgEEI,
      utilizationByEquipment,
      recentActivity,
    });
  } catch (err) {
    console.error("getDashboardSummary:", err);

    return res.status(500).json({
      message: "Failed to load dashboard analytics.",
    });
  }
}

/* =========================================================
   GET /api/analytics/admin-summary
   ========================================================= */

export async function getAdminSummary(req, res) {
  try {
    const equipmentList =
      await Equipment.find({}).lean();

    const fleetCostRange =
      computeFleetCostRange(equipmentList);

    const scored = equipmentList.map(
      (equipment) => ({
        ...equipment,
        eeiScore:
          calculateEEI(
            equipment,
            fleetCostRange
          )?.score ?? null,
      })
    );

    const totalEquipment = scored.length;

    const overdueMaintenance =
      scored.filter((equipment) => {
        if (!equipment.lastServiceDate) {
          return true;
        }

        const serviceDate =
          new Date(equipment.lastServiceDate);

        if (
          Number.isNaN(serviceDate.getTime())
        ) {
          return true;
        }

        const daysSince =
          (Date.now() -
            serviceDate.getTime()) /
          (1000 * 60 * 60 * 24);

        const interval =
          Number(
            equipment.maintenanceIntervalDays
          ) || 90;

        return daysSince >= interval;
      }).length;

    const utilizations = scored.map(
      (equipment) =>
        calculateUtilization(equipment)
          .utilization
    );

    const avgUtilization = utilizations.length
      ? Math.round(
          utilizations.reduce(
            (sum, value) => sum + value,
            0
          ) / utilizations.length
        )
      : 0;

    const lowestPerformingEquipment =
      [...scored]
        .filter((equipment) =>
          Number.isFinite(
            Number(equipment.eeiScore)
          )
        )
        .sort(
          (a, b) =>
            a.eeiScore - b.eeiScore
        )
        .slice(0, 10);

    const fleetUtilization =
      scored.slice(0, 10).map(
        (equipment) => {
          const { utilization, idle } =
            calculateUtilization(
              equipment
            );

          return {
            label: equipment.name,
            utilization,
            idle,
          };
        }
      );

    return res.json({
      totalEquipment,
      overdueMaintenance,
      avgUtilization,
      lowestPerformingEquipment,
      fleetUtilization,
    });
  } catch (err) {
    console.error("getAdminSummary:", err);

    return res.status(500).json({
      message: "Failed to load admin analytics.",
    });
  }
}

/* =========================================================
   GET /api/analytics/utilization-trend
   =========================================================
   NOTE:
   This is a current equipment snapshot, not a historical
   week-over-week trend. Real historical trend data requires
   utilization snapshots stored over time.
   ========================================================= */

export async function getUtilizationTrend(req, res) {
  try {
    const equipmentList =
      await Equipment.find({})
        .sort({ name: 1 })
        .limit(8)
        .lean();

    const trend = equipmentList.map(
      (equipment) => {
        const { utilization, idle } =
          calculateUtilization(equipment);

        return {
          label: equipment.name,
          utilization,
          idle,
        };
      }
    );

    return res.json({ trend });
  } catch (err) {
    console.error(
      "getUtilizationTrend:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to load utilization data.",
    });
  }
}

/* =========================================================
   GET /api/analytics/baseline-comparison
   =========================================================
   No fake research numbers.
   ========================================================= */

export async function getBaselineComparison(
  req,
  res
) {
  return res.status(503).json({
    message:
      "Baseline comparison data is not available yet. Run the research evaluation experiments first.",
  });
}

/* =========================================================
   POST /api/analytics/reports
   ========================================================= */

export async function generateReport(
  req,
  res
) {
  const { type, rangeDays } = req.body;

  const allowedTypes = [
    "utilization",
    "maintenance",
    "allocation",
    "cost",
  ];

  const allowedRanges = [30, 90, 365];

  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      message: "Invalid report type.",
    });
  }

  if (!allowedRanges.includes(Number(rangeDays))) {
    return res.status(400).json({
      message: "Invalid report range.",
    });
  }

  return res.status(501).json({
    message:
      "Report generation is not implemented yet.",
  });
}