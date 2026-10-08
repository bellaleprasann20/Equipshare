import React from "react";

function getBand(score) {
  if (score >= 80) {
    return {
      label: "Excellent",
      text: "text-emerald-400",
      bar: "bg-emerald-400",
    };
  }

  if (score >= 60) {
    return {
      label: "Good",
      text: "text-sky-400",
      bar: "bg-sky-400",
    };
  }

  if (score >= 40) {
    return {
      label: "Fair",
      text: "text-amber-400",
      bar: "bg-amber-400",
    };
  }

  return {
    label: "Poor",
    text: "text-red-400",
    bar: "bg-red-400",
  };
}

export default function EEIBadge({ score, showLabel = true }) {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
        <span className="h-1.5 w-8 bg-zinc-800" />
        <span className="font-mono">—</span>
        {showLabel && <span>No score</span>}
      </span>
    );
  }

  const safeScore = Math.min(100, Math.max(0, numericScore));
  const roundedScore = Math.round(safeScore);
  const { label, text, bar } = getBand(safeScore);

  return (
    <span
      className="inline-flex items-center gap-2"
      title={`Equipment Efficiency Index: ${roundedScore}/100`}
    >
      <span
        className="relative h-1.5 w-10 overflow-hidden bg-zinc-800"
        aria-hidden="true"
      >
        <span
          className={`absolute inset-y-0 left-0 ${bar} transition-all`}
          style={{ width: `${safeScore}%` }}
        />
      </span>

      <span className={`font-mono text-sm font-semibold ${text}`}>
        {roundedScore}
      </span>

      {showLabel && (
        <span className="text-xs text-zinc-500">
          {label}
        </span>
      )}
    </span>
  );
}