/**
 * Lightweight validation helpers.
 *
 * No Joi/Zod dependency is required for the current project scope.
 * These helpers are mainly used by controllers to reject malformed
 * input before it reaches the database.
 */

const VALID_EQUIPMENT_TYPES = [
  "excavator",
  "crane",
  "bulldozer",
  "loader",
  "concrete_mixer",
  "dump_truck",
];

export function isValidEmail(email) {
  return (
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

export function isNonEmptyString(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function isValidObjectId(value) {
  return (
    typeof value === "string" &&
    /^[a-fA-F0-9]{24}$/.test(value)
  );
}

export function isValidDate(value) {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

export function isValidDateRange(fromDate, toDate) {
  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    return false;
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  return to >= from;
}

export function isValidEquipmentType(type) {
  if (typeof type !== "string") {
    return false;
  }

  return VALID_EQUIPMENT_TYPES.includes(
    type.trim().toLowerCase()
  );
}

export function normalizeEquipmentType(type) {
  if (typeof type !== "string") {
    return "";
  }

  return type.trim().toLowerCase();
}

export function isValidNumber(value) {
  return (
    value !== null &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

export function isNonNegativeNumber(value) {
  return (
    isValidNumber(value) &&
    Number(value) >= 0
  );
}

export function isValidLatitude(latitude) {
  return (
    isValidNumber(latitude) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90
  );
}

export function isValidLongitude(longitude) {
  return (
    isValidNumber(longitude) &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180
  );
}

/**
 * Validates coordinates.
 *
 * Coordinates are optional for the allocation requirement.
 * If coordinates are supplied, both lat and lng must be valid.
 */
export function isValidCoordinates(coordinates) {
  if (coordinates === undefined || coordinates === null) {
    return true;
  }

  if (typeof coordinates !== "object") {
    return false;
  }

  return (
    isValidLatitude(coordinates.lat) &&
    isValidLongitude(coordinates.lng)
  );
}

/**
 * Validates an allocation requirement payload.
 *
 * Returns an array of error messages.
 * Empty array means the payload is valid.
 */
export function validateAllocationRequest(body = {}) {
  const errors = [];

  const equipmentType = normalizeEquipmentType(
    body.equipmentType
  );

  if (!isValidEquipmentType(equipmentType)) {
    errors.push(
      "A valid equipmentType is required."
    );
  }

  if (!isValidObjectId(body.projectId)) {
    errors.push(
      "A valid projectId is required."
    );
  }

  if (!isNonEmptyString(body.projectLocation)) {
    errors.push(
      "projectLocation is required."
    );
  } else if (body.projectLocation.trim().length > 200) {
    errors.push(
      "projectLocation must not exceed 200 characters."
    );
  }

  if (!body.requiredFrom || !body.requiredTo) {
    errors.push(
      "requiredFrom and requiredTo dates are required."
    );
  } else if (
    !isValidDateRange(
      body.requiredFrom,
      body.requiredTo
    )
  ) {
    errors.push(
      "requiredTo must be on or after requiredFrom."
    );
  }

  if (
    body.maxTransferDistanceKm !== undefined &&
    body.maxTransferDistanceKm !== null &&
    body.maxTransferDistanceKm !== ""
  ) {
    if (
      !isNonNegativeNumber(
        body.maxTransferDistanceKm
      )
    ) {
      errors.push(
        "maxTransferDistanceKm must be a non-negative number."
      );
    }
  }

  if (
    body.projectCoordinates !== undefined &&
    body.projectCoordinates !== null
  ) {
    if (
      !isValidCoordinates(
        body.projectCoordinates
      )
    ) {
      errors.push(
        "projectCoordinates must contain valid latitude and longitude values."
      );
    }
  }

  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== "string") {
      errors.push("notes must be a string.");
    } else if (body.notes.trim().length > 1000) {
      errors.push(
        "notes must not exceed 1000 characters."
      );
    }
  }

  return errors;
}

export { VALID_EQUIPMENT_TYPES };