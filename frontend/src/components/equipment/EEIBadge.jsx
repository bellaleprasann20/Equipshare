import React from "react";

/**
 * EEI score, styled like a spec-sheet readout (monospace number,
 * small band label) rather than a generic colored pill — this is
 * the single most-seen element in the app, worth being deliberate
 * about instead of defaulting to a rounded-full badge.
 */
function getBand(score) {
  if (score >= 80) return { label: "Excellent", color: "text-green-700", bar: "bg-green-600" };
  if (score >= 60) return { label: "Good", color: "text-blueprint", bar: "bg-blueprint" };
  if (score >= 40) return { label: "Fair", color: "text-caution", bar: "bg-caution" };
  return { label: "Poor", color: "text-red-700", bar: "bg-red-600" };
}

export default function EEIBadge({ score, showLabel = true }) {
  if (score === null || score === undefined) {
    return <span className="font-mono text-sm text-steel-light">— N/A</span>;
  }

  const { label, color, bar } = getBand(score);

  return (
    <span className="inline-flex items-center gap-2" title={`Equipment Efficiency Index: ${score}/100`}>
      <span className="relative h-1.5 w-8 bg-line">
        <span
          className={`absolute inset-y-0 left-0 ${bar}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </span>
      <span className={`font-mono text-sm font-semibold ${color}`}>{Math.round(score)}</span>
      {showLabel && <span className="text-xs text-steel">{label}</span>}
    </span>
  );
}
