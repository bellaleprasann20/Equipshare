import React from "react";

/**
 * Shows the factor-by-factor breakdown behind an allocation
 * score — this is what makes the ranking "explainable" instead
 * of a black box, which is exactly what the guide's review
 * asked for (a defensible, transparent multi-factor mechanism).
 *
 * Expected shape of `breakdown` (0-100 per factor, matches
 * what allocationService.js should return per candidate):
 *   { eei: 82, distance: 91, cost: 88, durationFit: 100 }
 *
 * Usage:
 *   <AllocationExplanation breakdown={result.scoreBreakdown} />
 */
const FACTOR_LABELS = {
  eei: "Equipment Efficiency (EEI)",
  distance: "Proximity to project",
  cost: "Transfer cost efficiency",
  durationFit: "Availability duration fit",
};

export default function AllocationExplanation({ breakdown = {} }) {
  const entries = Object.entries(breakdown).filter(([key]) => FACTOR_LABELS[key]);

  if (entries.length === 0) {
    return <p className="text-xs text-gray-400">No breakdown available.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-gray-500">Score breakdown</p>
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="w-40 shrink-0 text-xs text-gray-600">{FACTOR_LABELS[key]}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-medium text-gray-700">
            {Math.round(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
