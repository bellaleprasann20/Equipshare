
import Equipment from "../models/Equipment.js";
import AllocationRequest from "../models/AllocationRequest.js";

import {
  calculateEEI,
  computeFleetCostRange,
} from "./eeiCalculator.js";

import {
  calculateDistanceKm,
  estimateTransferCost,
} from "./distanceCostUtil.js";

/**
 * Smart Allocation Ranking Engine
 *
 * AllocationScore =
 *   EEI            * 0.40
 *   Proximity      * 0.25
 *   Cost           * 0.20
 *   Duration Fit   * 0.15
 */

const ALLOCATION_WEIGHTS = Object.freeze({
  eei: 0.4,
  proximity: 0.25,
  cost: 0.2,
  durationFit: 0.15,
});

const FALLBACK_SAME_LOCATION_KM = 5;
const FALLBACK_DIFFERENT_LOCATION_KM = 40;
const MAX_REASONABLE_DISTANCE_KM = 200;

/**
 * Escape special regex characters.
 */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Return ranked equipment recommendations.
 */
export async function getRankedRecommendations(requirement) {
  const {
    equipmentType,
    projectLocation,
    projectCoordinates,
    requiredFrom,
    requiredTo,
    maxTransferDistanceKm,
    minEeiScore,
  } = requirement;

  const normalizedType = String(equipmentType || "")
    .trim()
    .toLowerCase();

  if (!normalizedType) {
    throw new Error("Equipment type is required.");
  }

  if (!projectLocation?.trim()) {
    throw new Error("Project location is required.");
  }

  const from = new Date(requiredFrom);
  const to = new Date(requiredTo);

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime())
  ) {
    throw new Error("Invalid allocation dates.");
  }

  if (to < from) {
    throw new Error(
      "Required end date must be after the start date."
    );
  }

  const distanceLimit =
    maxTransferDistanceKm === undefined ||
    maxTransferDistanceKm === null ||
    maxTransferDistanceKm === ""
      ? null
      : Number(maxTransferDistanceKm);

  if (
    distanceLimit !== null &&
    (!Number.isFinite(distanceLimit) || distanceLimit < 0)
  ) {
    throw new Error(
      "Maximum transfer distance must be a valid non-negative number."
    );
  }

  const minimumEeiScore =
    minEeiScore === undefined ||
    minEeiScore === null ||
    minEeiScore === ""
      ? null
      : Number(minEeiScore);

  if (
    minimumEeiScore !== null &&
    (!Number.isFinite(minimumEeiScore) ||
      minimumEeiScore < 0 ||
      minimumEeiScore > 100)
  ) {
    throw new Error(
      "Minimum EEI score must be between 0 and 100."
    );
  }

  // ---------------------------------------------------------
  // 1. Find matching available equipment.
  // Case-insensitive and whitespace-tolerant matching.
  // ---------------------------------------------------------

  const candidates = await Equipment.find({
    type: {
      $regex: `^\\s*${escapeRegex(normalizedType)}\\s*$`,
      $options: "i",
    },
    availability: {
      $regex: "^\\s*available\\s*$",
      $options: "i",
    },
  }).lean();

  if (candidates.length === 0) {
    console.warn("SMART ALLOCATION: No available candidates", {
      requestedType: normalizedType,
      availableTypes: await Equipment.distinct("type"),
      availabilityValues: await Equipment.distinct("availability"),
    });

    return [];
  }

  // ---------------------------------------------------------
  // 2. Exclude equipment with overlapping active allocations.
  // ---------------------------------------------------------

  const candidateIds = candidates.map(
    (equipment) => equipment._id
  );

  const activeAllocations = await AllocationRequest.find({
    status: "active",
    allocatedEquipmentId: {
      $in: candidateIds,
    },
    requiredFrom: {
      $lte: to,
    },
    requiredTo: {
      $gte: from,
    },
  })
    .select("allocatedEquipmentId requiredFrom requiredTo")
    .lean();

  const blockedEquipmentIds = new Set(
    activeAllocations
      .map((allocation) =>
        allocation.allocatedEquipmentId?.toString()
      )
      .filter(Boolean)
  );

  // ---------------------------------------------------------
  // 3. Calculate common fleet cost normalization range.
  // ---------------------------------------------------------

  const fleetCostRange = computeFleetCostRange(candidates);

  let blockedCount = 0;
  let distanceExcludedCount = 0;
  let eeiExcludedCount = 0;

  // ---------------------------------------------------------
  // 4. Calculate equipment scores.
  // ---------------------------------------------------------

  const scored = candidates
    .map((equipment) => {
      const equipmentId = equipment._id.toString();

      // Exclude already allocated equipment.
      if (blockedEquipmentIds.has(equipmentId)) {
        blockedCount++;
        return null;
      }

      // Calculate transfer distance.
      const distanceKm = resolveDistanceKm(
        equipment,
        projectLocation,
        projectCoordinates
      );

      // Apply optional distance limit.
      if (
        distanceLimit !== null &&
        distanceKm > distanceLimit
      ) {
        distanceExcludedCount++;
        return null;
      }

      // Calculate transfer cost.
      const transferCost = estimateTransferCost(
        distanceKm,
        normalizedType
      );

      // Calculate Equipment Efficiency Index.
      const {
        score: eeiScore,
        breakdown: eeiBreakdown,
      } = calculateEEI(equipment, fleetCostRange);

      // Apply optional minimum EEI filter.
      if (
        minimumEeiScore !== null &&
        eeiScore < minimumEeiScore
      ) {
        eeiExcludedCount++;
        return null;
      }

      // -------------------------------------------------------
      // Allocation sub-scores.
      // -------------------------------------------------------

      const proximityScore = clamp(
        100 -
          (distanceKm / MAX_REASONABLE_DISTANCE_KM) * 100,
        0,
        100
      );

      const costScore = clamp(
        Number(eeiBreakdown.cost) || 0,
        0,
        100
      );

      const durationFitScore = computeDurationFitScore(
        equipment,
        blockedEquipmentIds
      );

      // -------------------------------------------------------
      // Final weighted allocation score.
      // -------------------------------------------------------

      const allocationScore =
        eeiScore * ALLOCATION_WEIGHTS.eei +
        proximityScore * ALLOCATION_WEIGHTS.proximity +
        costScore * ALLOCATION_WEIGHTS.cost +
        durationFitScore * ALLOCATION_WEIGHTS.durationFit;

      return {
        equipment: {
          ...equipment,
          eeiScore,
          eeiBreakdown,
        },

        allocationScore: roundToOneDecimal(allocationScore),

        transferDistanceKm: roundToOneDecimal(distanceKm),

        transferCost,

        scoreBreakdown: {
          eei: roundToOneDecimal(eeiScore),
          distance: roundToOneDecimal(proximityScore),
          cost: roundToOneDecimal(costScore),
          durationFit: roundToOneDecimal(durationFitScore),
        },
      };
    })
    .filter(Boolean);

  // ---------------------------------------------------------
  // 5. Log exclusion details when no recommendation survives.
  // ---------------------------------------------------------

  if (scored.length === 0) {
    console.warn("SMART ALLOCATION: All candidates excluded", {
      requestedType: normalizedType,
      totalCandidates: candidates.length,
      overlappingAllocations: blockedCount,
      distanceExcluded: distanceExcludedCount,
      minimumEeiExcluded: eeiExcludedCount,
      distanceLimit,
      minimumEeiScore,
      requestedFrom: from,
      requestedTo: to,
    });
  }

  // ---------------------------------------------------------
  // 6. Rank recommendations.
  // ---------------------------------------------------------

  scored.sort((a, b) => {
    if (b.allocationScore !== a.allocationScore) {
      return b.allocationScore - a.allocationScore;
    }

    return a.transferDistanceKm - b.transferDistanceKm;
  });

  return scored.map((result, index) => ({
    rank: index + 1,
    ...result,
  }));
}

/**
 * Calculate duration fit.
 *
 * Candidates with overlapping active allocations have
 * already been excluded.
 */
function computeDurationFitScore(
  equipment,
  blockedEquipmentIds
) {
  if (
    !equipment?._id ||
    blockedEquipmentIds.has(equipment._id.toString())
  ) {
    return 0;
  }

  if (
    String(equipment.availability || "").toLowerCase().trim() !==
    "available"
  ) {
    return 0;
  }

  return 100;
}

/**
 * Resolve equipment-to-project distance.
 *
 * Priority:
 * 1. Coordinates.
 * 2. Same textual location.
 * 3. Different textual location.
 */
function resolveDistanceKm(
  equipment,
  projectLocation,
  projectCoordinates
) {
  if (
    projectCoordinates &&
    equipment.coordinates
  ) {
    const distance = calculateDistanceKm(
      equipment.coordinates,
      projectCoordinates
    );

    if (distance !== null) {
      return distance;
    }
  }

  const equipmentLocation = String(
    equipment.location || ""
  )
    .trim()
    .toLowerCase();

  const requestedLocation = String(
    projectLocation || ""
  )
    .trim()
    .toLowerCase();

  const sameLocation =
    Boolean(equipmentLocation) &&
    Boolean(requestedLocation) &&
    equipmentLocation === requestedLocation;

  return sameLocation
    ? FALLBACK_SAME_LOCATION_KM
    : FALLBACK_DIFFERENT_LOCATION_KM;
}

/**
 * Keep scores within their valid range.
 */
function clamp(value, min, max) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, numericValue)
  );
}

/**
 * Round to one decimal place.
 */
function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}
