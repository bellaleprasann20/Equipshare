import React from "react";

/**
 * Shows whether equipment is due for maintenance, based on
 * days since last service vs. the recommended interval.
 * This is one of the raw inputs that feeds the EEI formula
 * (see backend/src/services/eeiCalculator.js) — this component
 * just displays it.
 *
 * Usage:
 *   <MaintenanceStatus
 *     lastServiceDate="2026-06-01"
 *     recommendedIntervalDays={90}
 *   />
 */
function getStatus(lastServiceDate, recommendedIntervalDays) {
  if (!lastServiceDate) {
    return { label: "No record", classes: "bg-gray-100 text-gray-500" };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastServiceDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const ratio = daysSince / recommendedIntervalDays;

  if (ratio >= 1) {
    return { label: `Overdue (${daysSince}d)`, classes: "bg-red-100 text-red-700" };
  }
  if (ratio >= 0.75) {
    return { label: `Due soon (${daysSince}d)`, classes: "bg-yellow-100 text-yellow-700" };
  }
  return { label: `OK (${daysSince}d ago)`, classes: "bg-green-100 text-green-700" };
}

export default function MaintenanceStatus({ lastServiceDate, recommendedIntervalDays = 90 }) {
  const { label, classes } = getStatus(lastServiceDate, recommendedIntervalDays);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
