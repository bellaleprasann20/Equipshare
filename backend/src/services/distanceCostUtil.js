const EARTH_RADIUS_KM = 6371;

/**
 * Distance and transfer-cost helpers.
 *
 * Used by allocationService.js.
 *
 * Distance uses the Haversine formula.
 * It represents straight-line geographic distance,
 * not actual road distance.
 */

/**
 * Calculate straight-line distance between two coordinates.
 *
 * @param {{lat: number, lng: number}} coordsA
 * @param {{lat: number, lng: number}} coordsB
 *
 * @returns {number|null}
 */
export function calculateDistanceKm(
  coordsA,
  coordsB
) {
  if (
    !isValidCoordinates(coordsA) ||
    !isValidCoordinates(coordsB)
  ) {
    return null;
  }

  const dLat = toRadians(
    coordsB.lat - coordsA.lat
  );

  const dLng = toRadians(
    coordsB.lng - coordsA.lng
  );

  const lat1 = toRadians(coordsA.lat);
  const lat2 = toRadians(coordsB.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  /*
   * Haversine formula.
   */
  let a =
    sinLat ** 2 +
    sinLng ** 2 *
      Math.cos(lat1) *
      Math.cos(lat2);

  /*
   * Floating-point calculations can theoretically produce
   * values slightly above 1.
   *
   * Clamp it so Math.sqrt(1 - a) never receives a negative
   * value because of floating-point precision.
   */
  a = Math.min(1, Math.max(0, a));

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return roundToOneDecimal(
    EARTH_RADIUS_KM * c
  );
}

/**
 * Estimate equipment transfer cost.
 *
 * Formula:
 *
 * Base loading/unloading cost
 * +
 * distance × equipment-specific rate
 *
 * These rates are currently assumptions for the MVP.
 */
const COST_PER_KM_BY_TYPE = Object.freeze({
  excavator: 120,
  crane: 180,
  bulldozer: 150,
  loader: 100,
  concrete_mixer: 80,
  dump_truck: 90,
});

const BASE_TRANSFER_COST = 2000;

/**
 * @param {number|null} distanceKm
 * @param {string} equipmentType
 *
 * @returns {number|null}
 */
export function estimateTransferCost(
  distanceKm,
  equipmentType
) {
  if (
    distanceKm === null ||
    distanceKm === undefined
  ) {
    return null;
  }

  const distance = Number(distanceKm);

  if (!Number.isFinite(distance) || distance < 0) {
    return null;
  }

  const normalizedType = String(
    equipmentType || ""
  )
    .trim()
    .toLowerCase();

  const rate =
    COST_PER_KM_BY_TYPE[normalizedType] ??
    100;

  return Math.round(
    BASE_TRANSFER_COST +
      distance * rate
  );
}

/**
 * Validate geographic coordinates.
 */
function isValidCoordinates(coords) {
  if (!coords) {
    return false;
  }

  const lat = Number(coords.lat);
  const lng = Number(coords.lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return false;
  }

  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Convert degrees to radians.
 */
function toRadians(degrees) {
  return (
    (degrees * Math.PI) /
    180
  );
}

/**
 * Round distance/cost calculations consistently.
 */
function roundToOneDecimal(value) {
  return (
    Math.round(value * 10) / 10
  );
}