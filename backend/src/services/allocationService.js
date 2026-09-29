import Equipment from "../models/Equipment.js";
import { calculateEEI, computeFleetCostRange } from "./eeiCalculator.js";
import { calculateDistanceKm, estimateTransferCost } from "./distanceCostUtil.js";

/**
 * Allocation Ranking Engine (Weighted-Sum Multi-Criteria Model)
 * ===============================================================
 * This answers the guide's review gap #2/#3: instead of filtering
 * equipment and letting the user pick manually, this ranks every
 * available candidate by a weighted combination of:
 *
 *   AllocationScore = a*EEI + b*ProximityScore + c*CostScore + d*DurationFitScore
 *
 * Each sub-score is normalized to 0-100 before weighting, matching
 * the same pattern as eeiCalculator.js — interpretable weights,
 * transparent breakdown (this breakdown is exactly what
 * AllocationExplanation.jsx on the frontend renders).
 *
 * NOTE on naming: this file is backend/src/services/allocationService.js.
 * There is a SEPARATE, differently-scoped frontend/src/services/
 * allocationService.js that only makes HTTP calls — don't confuse
 * the two. This file has the actual ranking math.
 */

const ALLOCATION_WEIGHTS = {
  eei: 0.4,
  proximity: 0.25,
  cost: 0.2,
  durationFit: 0.15,
};

// Used when coordinates aren't available for a location (MVP
// fallback — see distanceCostUtil.js header comment). Same-text
// location match scores as "close"; otherwise a default distance
// is assumed. Documented assumption for the dataset writeup.
const FALLBACK_SAME_LOCATION_KM = 5;
const FALLBACK_DIFFERENT_LOCATION_KM = 40;
const MAX_REASONABLE_DISTANCE_KM = 200; // used to normalize proximity score

/**
 * Ranks all available equipment of the requested type against a
 * project's requirement. This is the function called by
 * allocationController.js for POST /api/allocate.
 *
 * @param {Object} requirement
 *   equipmentType, projectLocation, projectCoordinates (optional
 *   { lat, lng }), requiredFrom, requiredTo, maxTransferDistanceKm
 * @returns {Promise<Array>} ranked array matching the frontend's
 *   expected shape (see frontend RecommendationCard.jsx header
 *   comment for the exact contract):
 *   [{ rank, equipment, allocationScore, transferDistanceKm,
 *      transferCost, scoreBreakdown }]
 */
export async function getRankedRecommendations(requirement) {
  const { equipmentType, projectLocation, projectCoordinates, requiredFrom, requiredTo, maxTransferDistanceKm } =
    requirement;

  const candidates = await Equipment.find({
    type: equipmentType,
    availability: "available",
  }).lean();

  if (candidates.length === 0) return [];

  const fleetCostRange = computeFleetCostRange(candidates);

  const scored = candidates
    .map((equipment) => {
      // --- Distance ---
      const distanceKm = resolveDistanceKm(equipment, projectLocation, projectCoordinates);

      if (maxTransferDistanceKm && distanceKm > maxTransferDistanceKm) {
        return null; // outside the requester's acceptable range — excluded, not just ranked low
      }

      const transferCost = estimateTransferCost(distanceKm, equipmentType);

      // --- EEI (reused, not recomputed from scratch if already cached recently) ---
      const { score: eeiScore, breakdown: eeiBreakdown } = calculateEEI(equipment, fleetCostRange);

      // --- Sub-scores for the allocation formula (0-100 each) ---
      const proximityScore = clamp(100 - (distanceKm / MAX_REASONABLE_DISTANCE_KM) * 100, 0, 100);
      const costScore = eeiBreakdown.cost; // reuse the same cost normalization as EEI
      const durationFitScore = computeDurationFitScore(equipment, requiredFrom, requiredTo);

      const allocationScore =
        eeiScore * ALLOCATION_WEIGHTS.eei +
        proximityScore * ALLOCATION_WEIGHTS.proximity +
        costScore * ALLOCATION_WEIGHTS.cost +
        durationFitScore * ALLOCATION_WEIGHTS.durationFit;

      return {
        equipment: { ...equipment, eeiScore }, // attach freshly computed EEI for display
        allocationScore: Math.round(allocationScore * 10) / 10,
        transferDistanceKm: distanceKm,
        transferCost,
        scoreBreakdown: {
          eei: eeiScore,
          distance: Math.round(proximityScore * 10) / 10,
          cost: Math.round(costScore * 10) / 10,
          durationFit: Math.round(durationFitScore * 10) / 10,
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.allocationScore - a.allocationScore)
    .map((result, index) => ({ rank: index + 1, ...result }));

  return scored;
}

/**
 * Duration fit: 100 if the equipment has no conflicting active
 * allocation in the requested window, scaled down based on how
 * much overlap exists with its current commitments. For an MCA
 * MVP, this checks the equipment's `availability` flag as a
 * simple proxy — full calendar-overlap checking against
 * AllocationRequest records is a documented extension point
 * (see research/methodology/allocation-methodology.md).
 */
function computeDurationFitScore(equipment, requiredFrom, requiredTo) {
  if (equipment.availability !== "available") return 0;
  return 100;
}

function resolveDistanceKm(equipment, projectLocation, projectCoordinates) {
  if (projectCoordinates && equipment.coordinates?.lat != null) {
    const distance = calculateDistanceKm(equipment.coordinates, projectCoordinates);
    if (distance != null) return distance;
  }

  // Fallback: no coordinates available on one or both sides —
  // use a coarse same-location-text heuristic instead.
  const sameLocation =
    equipment.location?.trim().toLowerCase() === projectLocation?.trim().toLowerCase();
  return sameLocation ? FALLBACK_SAME_LOCATION_KM : FALLBACK_DIFFERENT_LOCATION_KM;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
