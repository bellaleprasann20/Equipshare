/**
 * Distance and transfer-cost helpers, used by allocationService.js
 * to score how practical it is to move a piece of equipment to
 * the requesting project's site.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — straight-line distance in km between two
 * lat/lng points. Good enough for ranking purposes; doesn't need
 * real road-routing for an MCA-scope project (documented as a
 * simplifying assumption in research/dataset/dataset-documentation.md).
 */
export function calculateDistanceKm(coordsA, coordsB) {
  if (!coordsA || !coordsB || coordsA.lat == null || coordsB.lat == null) {
    return null; // unknown — caller should handle (see allocationService.js)
  }

  const dLat = toRadians(coordsB.lat - coordsA.lat);
  const dLng = toRadians(coordsB.lng - coordsA.lng);
  const lat1 = toRadians(coordsA.lat);
  const lat2 = toRadians(coordsB.lat);

  const a =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimated transfer cost — flat rate per km, configurable per
 * equipment type (heavier equipment costs more to move). Rates
 * are a documented assumption (see dataset-documentation.md);
 * replace with real logistics-partner rates if/when available.
 */
const COST_PER_KM_BY_TYPE = {
  excavator: 120,
  crane: 180,
  bulldozer: 150,
  loader: 100,
  concrete_mixer: 80,
  dump_truck: 90,
};

const BASE_TRANSFER_COST = 2000; // flat loading/unloading cost, ₹

export function estimateTransferCost(distanceKm, equipmentType) {
  if (distanceKm == null) return null;
  const rate = COST_PER_KM_BY_TYPE[equipmentType] ?? 100;
  return Math.round(BASE_TRANSFER_COST + distanceKm * rate);
}
