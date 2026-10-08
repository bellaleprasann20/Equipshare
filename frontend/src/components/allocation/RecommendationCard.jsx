import React, { useState } from "react";
import EEIBadge from "../equipment/EEIBadge";
import AllocationExplanation from "./AllocationExplanation";
import Button from "../common/Button";

function getEquipmentType(equipment) {
  return equipment?.type || equipment?.category || "Equipment";
}

function getEquipmentLocation(equipment) {
  return (
    equipment?.location ||
    equipment?.currentLocation?.siteName ||
    "Location not specified"
  );
}

function formatNumber(value, digits = 1) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(digits);
}

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

export default function RecommendationCard({ result, onSelect }) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!result) {
    return null;
  }

  const {
    rank,
    equipment = {},
    allocationScore,
    transferDistanceKm,
    transferCost,
    scoreBreakdown,
  } = result;

  const isTopPick = Number(rank) === 1;

  return (
    <article
      className={[
        "border bg-surface p-4 transition-colors",
        isTopPick
          ? "border-signal/60 ring-1 ring-signal/20"
          : "border-line hover:border-ink/20",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center",
              "font-mono text-sm font-bold",
              isTopPick
                ? "bg-signal text-white"
                : "bg-paper text-steel",
            ].join(" ")}
            aria-label={`Rank ${rank}`}
          >
            #{rank ?? "—"}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-display text-sm font-semibold text-ink">
                {equipment.name || "Unnamed equipment"}
              </h3>

              {isTopPick && (
                <span className="border border-signal/30 bg-signal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-signal">
                  Best Match
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-steel">
              {getEquipmentType(equipment)}
            </p>

            <p className="mt-0.5 text-xs text-steel-light">
              {getEquipmentLocation(equipment)}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-xl font-bold text-ink">
            {formatNumber(allocationScore)}
          </p>

          <p className="text-[10px] uppercase tracking-wide text-steel-light">
            Allocation Score
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-1 gap-2 border-y border-line py-3 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-steel-light">
            EEI
          </p>

          <div className="mt-1">
            <EEIBadge
              score={equipment.eeiScore}
              showLabel={false}
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-steel-light">
            Transfer Distance
          </p>

          <p className="mt-1 font-mono text-sm text-ink">
            {formatNumber(transferDistanceKm)} km
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-steel-light">
            Transfer Cost
          </p>

          <p className="mt-1 font-mono text-sm text-ink">
            {formatCurrency(transferCost)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setShowExplanation((current) => !current)}
          className="text-left text-xs font-semibold text-signal hover:underline"
          aria-expanded={showExplanation}
        >
          {showExplanation
            ? "Hide ranking explanation"
            : "Why this ranking?"}
        </button>

        {onSelect && (
          <Button
            type="button"
            size="sm"
            onClick={() => onSelect(result)}
          >
            Allocate this equipment
          </Button>
        )}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-4 border-t border-line pt-4">
          <AllocationExplanation
            breakdown={scoreBreakdown}
          />
        </div>
      )}
    </article>
  );
}