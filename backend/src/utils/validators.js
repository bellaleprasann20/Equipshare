/**
 * Small validation helpers for controllers. Kept lightweight
 * (no Joi/Zod dependency) since the validation needs here are
 * simple — mainly used by allocationController.js and
 * equipmentController.js to reject obviously malformed requests
 * before they hit the database.
 */

export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidDateRange(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return false;
  return to >= from;
}

const VALID_EQUIPMENT_TYPES = [
  "excavator",
  "crane",
  "bulldozer",
  "loader",
  "concrete_mixer",
  "dump_truck",
];

export function isValidEquipmentType(type) {
  return VALID_EQUIPMENT_TYPES.includes(type);
}

/**
 * Validates an allocation requirement payload (POST /api/allocate).
 * Returns an array of error messages — empty array means valid.
 */
export function validateAllocationRequest(body) {
  const errors = [];

  if (!isValidEquipmentType(body.equipmentType)) {
    errors.push("A valid equipmentType is required.");
  }
  if (!isNonEmptyString(body.projectLocation)) {
    errors.push("projectLocation is required.");
  }
  if (!body.requiredFrom || !body.requiredTo) {
    errors.push("requiredFrom and requiredTo dates are required.");
  } else if (!isValidDateRange(body.requiredFrom, body.requiredTo)) {
    errors.push("requiredTo must be on or after requiredFrom.");
  }

  return errors;
}
