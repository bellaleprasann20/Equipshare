import React, { useState } from "react";
import EEIBadge from "../equipment/EEIBadge";
import AllocationExplanation from "./AllocationExplanation";
import Button from "../common/Button";

/**
 * Card for ONE ranked recommendation, shown in the results list
 * after a RequirementForm submission. Wraps equipment info +
 * its allocation score + a toggle to see WHY it ranked here.
 *
 * Expected shape of `result` (one item from the backend's
 * ranked array — see allocationService.js contract):
 *   {
 *     rank: 1,
 *     equipment: { _id, name, type, location, eeiScore, imageUrl, ... },
 *     allocationScore: 87.4,        // 0-100, final ranking score
 *     transferDistanceKm: 12.5,
 *     transferCost: 4200,
 *     scoreBreakdown: {             // what fed into allocationScore
 *       eei: 82,
 *       distance: 91,
 *       cost: 88,
 *       durationFit: 100
 *     }
 *   }
 *
 * Usage:
 *   {results.map((r) => <RecommendationCard key={r.equipment._id} result={r} onSelect={handleAllocate} />)}
 */
export default function RecommendationCard({ result, onSelect }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { rank, equipment, allocationScore, transferDistanceKm, transferCost, scoreBreakdown } =
    result;

  const isTopPick = rank === 1;

  return (
    <div
      className={[
        "rounded-lg border bg-white p-4 shadow-sm",
        isTopPick ? "border-blue-400 ring-1 ring-blue-100" : "border-gray-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              isTopPick ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600",
            ].join(" ")}
          >
            #{rank}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {equipment.name}
              {isTopPick && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Best Match
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500">
              {equipment.type} · 📍 {equipment.location}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">{allocationScore.toFixed(1)}</p>
          <p className="text-xs text-gray-400">Allocation Score</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span>EEI: <EEIBadge score={equipment.eeiScore} showLabel={false} /></span>
        <span>🚚 {transferDistanceKm} km</span>
        <span>💰 ₹{transferCost.toLocaleString("en-IN")}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setShowExplanation((v) => !v)}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          {showExplanation ? "Hide details" : "Why this ranking?"}
        </button>
        <Button size="sm" onClick={() => onSelect?.(result)}>
          Allocate this equipment
        </Button>
      </div>

      {showExplanation && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <AllocationExplanation breakdown={scoreBreakdown} />
        </div>
      )}
    </div>
  );
}
