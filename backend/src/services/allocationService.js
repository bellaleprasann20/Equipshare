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
 * Allocation Ranking Engine
 * =========================
 *
 * AllocationScore =
 *
 *   EEI                  × 0.40
 *   ProximityScore       × 0.25
 *   CostScore            × 0.20
 *   DurationFitScore     × 0.15
 *
 * Every component is normalized to 0-100.
 *
 * The result is intentionally interpretable so the frontend
 * can display the score breakdown to the user/admin.
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
 * Return ranked equipment recommendations for a project requirement.
 *
 * @param {Object} requirement
 *
 * Required:
 * - projectId
 * - equipmentType
 * - projectLocation
 * - requiredFrom
 * - requiredTo
 *
 * Optional:
 * - projectCoordinates
 * - maxTransferDistanceKm
 *
 * @returns {Promise<Array>}
 */
export async function getRankedRecommendations(requirement) {
  const {
    equipmentType,
    projectLocation,
    projectCoordinates,
    requiredFrom,
    requiredTo,
    maxTransferDistanceKm,
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

  /*
   * Fetch currently available equipment.
   *
   * Equipment marked in_use or sold is immediately excluded.
   */
  const candidates = await Equipment.find({
    type: normalizedType,
    availability: "available",
  })
    .lean();

  if (candidates.length === 0) {
    return [];
  }

  /*
   * An equipment item's availability flag alone is not enough
   * for future-date allocation.
   *
   * Example:
   *
   * Equipment A = available now
   * Active allocation = Oct 10 → Oct 20
   * New request = Oct 15 → Oct 18
   *
   * Equipment A must NOT be recommended.
   *
   * We therefore find active allocations overlapping the
   * requested period.
   */
  const candidateIds = candidates.map(
    (equipment) => equipment._id
  );

  const activeAllocations = await AllocationRequest.find({
    status: "active",
    allocatedEquipmentId: {
      $in: candidateIds,
    },

    /*
     * Date overlap:
     *
     * existing.start <= requested.end
     * AND
     * existing.end >= requested.start
     */
    requiredFrom: {
      $lte: to,
    },
    requiredTo: {
      $gte: from,
    },
  })
    .select(
      "allocatedEquipmentId requiredFrom requiredTo"
    )
    .lean();

  const blockedEquipmentIds = new Set(
    activeAllocations
      .map((allocation) =>
        allocation.allocatedEquipmentId?.toString()
      )
      .filter(Boolean)
  );

  /*
   * Cost normalization requires the complete candidate fleet
   * so each equipment item is evaluated against the same range.
   */
  const fleetCostRange =
    computeFleetCostRange(candidates);

  const scored = candidates
    .map((equipment) => {
      /*
       * Exclude equipment already committed to an overlapping
       * active allocation.
       */
      if (
        blockedEquipmentIds.has(
          equipment._id.toString()
        )
      ) {
        return null;
      }

      // ---------------------------------------------------------
      // Distance
      // ---------------------------------------------------------

      const distanceKm = resolveDistanceKm(
        equipment,
        projectLocation,
        projectCoordinates
      );

      /*
       * Important:
       *
       * 0 is a valid distance.
       *
       * Therefore we explicitly check !== null instead of
       * using a truthy check.
       */
      if (
        distanceLimit !== null &&
        distanceKm > distanceLimit
      ) {
        return null;
      }

      const transferCost = estimateTransferCost(
        distanceKm,
        normalizedType
      );

      // ---------------------------------------------------------
      // EEI
      // ---------------------------------------------------------

      const {
        score: eeiScore,
        breakdown: eeiBreakdown,
      } = calculateEEI(
        equipment,
        fleetCostRange
      );

      // ---------------------------------------------------------
      // Allocation sub-scores
      // ---------------------------------------------------------

      const proximityScore = clamp(
        100 -
          (distanceKm /
            MAX_REASONABLE_DISTANCE_KM) *
            100,
        0,
        100
      );

      /*
       * The allocation cost component reuses the EEI cost
       * normalization so the model remains consistent.
       */
      const costScore = clamp(
        Number(eeiBreakdown.cost) || 0,
        0,
        100
      );

      /*
       * Duration fit is now based on actual overlapping
       * active allocations instead of simply checking
       * availability.
       */
      const durationFitScore =
        computeDurationFitScore(
          equipment,
          blockedEquipmentIds
        );

      // ---------------------------------------------------------
      // Final weighted score
      // ---------------------------------------------------------

      const allocationScore =
        eeiScore * ALLOCATION_WEIGHTS.eei +
        proximityScore *
          ALLOCATION_WEIGHTS.proximity +
        costScore * ALLOCATION_WEIGHTS.cost +
        durationFitScore *
          ALLOCATION_WEIGHTS.durationFit;

      return {
        equipment: {
          ...equipment,

          /*
           * This is freshly calculated for the current ranking.
           *
           * We intentionally do not blindly trust the cached
           * equipment.eeiScore because raw equipment metrics
           * may have changed since the cache was generated.
           */
          eeiScore,
          eeiBreakdown,
        },

        allocationScore:
          roundToOneDecimal(allocationScore),

        transferDistanceKm:
          roundToOneDecimal(distanceKm),

        transferCost,

        scoreBreakdown: {
          eei: roundToOneDecimal(eeiScore),

          distance:
            roundToOneDecimal(proximityScore),

          cost:
            roundToOneDecimal(costScore),

          durationFit:
            roundToOneDecimal(durationFitScore),
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      /*
       * Primary:
       * higher allocation score first.
       *
       * Secondary:
       * lower transfer distance first.
       *
       * This gives deterministic ordering when two scores
       * are equal.
       */
      if (
        b.allocationScore !==
        a.allocationScore
      ) {
        return (
          b.allocationScore -
          a.allocationScore
        );
      }

      return (
        a.transferDistanceKm -
        b.transferDistanceKm
      );
    })
    .map((result, index) => ({
      rank: index + 1,
      ...result,
    }));

  return scored;
}

/**
 * Duration fit score.
 *
 * The candidate list has already excluded equipment with
 * overlapping active allocations, so an available candidate
 * receives 100.
 *
 * Kept as a separate function because this is the natural
 * extension point for more sophisticated calendar scoring.
 */
function computeDurationFitScore(
  equipment,
  blockedEquipmentIds
) {
  if (
    !equipment?._id ||
    blockedEquipmentIds.has(
      equipment._id.toString()
    )
  ) {
    return 0;
  }

  if (equipment.availability !== "available") {
    return 0;
  }

  return 100;
}

/**
 * Resolve equipment-to-project distance.
 *
 * Priority:
 *
 * 1. GPS coordinates
 * 2. Same textual location → 5 km
 * 3. Different/unknown textual location → 40 km
 *
 * The fallback values are documented assumptions for the
 * current MVP and should be replaced with real routing data
 * when available.
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
    const distance =
      calculateDistanceKm(
        equipment.coordinates,
        projectCoordinates
      );

    if (distance !== null) {
      return distance;
    }
  }

  const equipmentLocation =
    equipment.location
      ?.trim()
      .toLowerCase();

  const requestedLocation =
    projectLocation
      ?.trim()
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
 * Keep values inside a defined range.
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