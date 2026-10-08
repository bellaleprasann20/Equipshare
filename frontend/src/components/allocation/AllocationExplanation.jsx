import React from "react";

const FACTOR_LABELS = {
  eei: "Equipment Efficiency (EEI)",
  distance: "Proximity to project",
  cost: "Transfer cost efficiency",
  durationFit: "Availability duration fit",
};

function getSafeScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return null;
  }

  return Math.min(100, Math.max(0, score));
}

export default function AllocationExplanation({ breakdown = {} }) {
  const entries = Object.entries(breakdown || {}).filter(
    ([key]) => FACTOR_LABELS[key]
  );

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface/40 p-3">
        <p className="text-xs text-steel-light">
          No score breakdown available for this recommendation.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface/40 p-4">
      <div className="mb-3">
        <p className="font-display text-sm font-semibold text-ink">
          Why this equipment ranked here
        </p>
        <p className="mt-1 text-xs text-steel">
          Each factor is scored from 0–100 by the allocation engine.
        </p>
      </div>

      <div className="space-y-3">
        {entries.map(([key, value]) => {
          const score = getSafeScore(value);

          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-xs text-steel">
                  {FACTOR_LABELS[key]}
                </span>

                <span className="font-mono text-xs font-semibold text-ink">
                  {score === null ? "—" : Math.round(score)}
                </span>
              </div>

              <div
                className="h-1.5 w-full overflow-hidden bg-line"
                role="progressbar"
                aria-label={`${FACTOR_LABELS[key]} score`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score ?? 0}
              >
                {score !== null && (
                  <div
                    className="h-full bg-signal transition-all"
                    style={{ width: `${score}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}