import Project from "../models/Project.js";
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

    // 1. Find projects belonging to this manager
    const projects = await Project.find({
      managerId: userId,
    })
      .select("_id name location")
      .lean();

    const projectIds = projects.map((project) => project._id);

    if (projectIds.length === 0) {
      return res.json({
        activeAllocations: 0,
        pendingRequests: 0,
        avgEEI: null,
        utilizationByEquipment: [],
        recentActivity: [],
      });
    }

    // 2. Fetch manager-specific allocation requests
    const [activeRequests, pendingRequests, recentRequests] =
      await Promise.all([
        AllocationRequest.find({
          projectId: { $in: projectIds },
          status: "active",
          allocatedEquipmentId: { $ne: null },
        })
          .populate(
            "allocatedEquipmentId",
            "name type operatingHoursLast30Days idleHoursLast30Days"
          )
          .lean(),

        AllocationRequest.countDocuments({
          projectId: { $in: projectIds },
          status: "pending",
        }),

        AllocationRequest.find({
          projectId: { $in: projectIds },
        })
          .populate(
            "allocatedEquipmentId",
            "name type"
          )
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    // 3. Collect assigned equipment
    const equipmentIds = [
      ...new Set(
        activeRequests
          .map((request) =>
            request.allocatedEquipmentId?._id?.toString()
          )
          .filter(Boolean)
      ),
    ];

    const equipmentList = equipmentIds.length
      ? await Equipment.find({
          _id: { $in: equipmentIds },
        }).lean()
      : [];

    // 4. Calculate average EEI for assigned fleet
    const fleetCostRange =
      computeFleetCostRange(equipmentList);

    const scores = equipmentList
      .map((equipment) =>
        calculateEEI(equipment, fleetCostRange)?.score
      )
      .filter((score) => Number.isFinite(Number(score)))
      .map(Number);

    const avgEEI = scores.length
      ? Math.round(
          (scores.reduce((sum, score) => sum + score, 0) /
            scores.length) * 10
        ) / 10
      : null;

    // 5. Calculate equipment utilization
    const utilizationByEquipment = equipmentList.map(
      (equipment) => {
        const operatingHours =
          Number(equipment.operatingHoursLast30Days) || 0;

        const idleHours =
          Number(equipment.idleHoursLast30Days) || 0;

        const totalHours = operatingHours + idleHours;

        const utilization = totalHours > 0
          ? Math.round((operatingHours / totalHours) * 100)
          : 0;

        return {
          _id: equipment._id,
          equipmentId: equipment._id,
          name: equipment.name,
          type: equipment.type,
          operatingHours,
          idleHours,
          utilization,
        };
      }
    );

    // 6. Build recent activity
    const recentActivity = recentRequests.map((request) => {
      const equipmentName =
        request.allocatedEquipmentId?.name;

      let message;

      if (request.status === "pending") {
        message =
          `Requested ${request.equipmentType} for ${request.projectLocation} — awaiting admin approval.`;
      } else if (request.status === "active") {
        message =
          `Approved ${request.equipmentType} allocation for ${request.projectLocation}` +
          (equipmentName ? ` — ${equipmentName}.` : ".");
      } else {
        message =
          `${request.equipmentType} request for ${request.projectLocation} — ${request.status}.`;
      }

      return {
        _id: request._id,
        message,
        status: request.status,
        equipmentType: request.equipmentType,
        equipmentName: equipmentName || null,
        createdAt: request.createdAt,
      };
    });

    return res.json({
      activeAllocations: activeRequests.length,
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