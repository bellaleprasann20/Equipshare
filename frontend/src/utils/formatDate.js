/**
 * Date formatting helpers used across equipment tables,
 * allocation history, and reviews — keeps date display
 * consistent (en-IN locale) everywhere instead of every
 * component calling `new Date().toLocaleDateString()` with
 * slightly different options.
 */

export function formatDate(dateInput, options = {}) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatDateTime(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Days elapsed since a given date (used by MaintenanceStatus). */
export function daysSince(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/** Converts a Date/ISO string to yyyy-mm-dd for <input type="date"> fields. */
export function toDateInputValue(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
