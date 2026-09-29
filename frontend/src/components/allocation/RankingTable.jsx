import React from "react";
import EEIBadge from "../equipment/EEIBadge";
import EmptyState from "../common/EmptyState";

/**
 * Dense table view of the full ranked candidate list — an
 * alternative to the RecommendationCard list, useful when an
 * admin wants to scan many candidates at once rather than
 * scroll through cards.
 *
 * Expected shape of `results`: array of the same shape used
 * by RecommendationCard (see that file's header comment).
 *
 * Usage:
 *   <RankingTable results={results} onSelect={handleAllocate} />
 */
export default function RankingTable({ results = [], onSelect }) {
  if (results.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Submit a requirement to see ranked equipment matches."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Rank</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Equipment</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Location</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">EEI</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Distance</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Transfer Cost</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Score</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {results.map((r) => (
            <tr key={r.equipment._id} className={r.rank === 1 ? "bg-blue-50/50" : ""}>
              <td className="px-4 py-2 font-semibold text-gray-700">#{r.rank}</td>
              <td className="px-4 py-2">
                <div className="font-medium text-gray-900">{r.equipment.name}</div>
                <div className="text-xs text-gray-400">{r.equipment.type}</div>
              </td>
              <td className="px-4 py-2 text-gray-600">{r.equipment.location}</td>
              <td className="px-4 py-2">
                <EEIBadge score={r.equipment.eeiScore} showLabel={false} />
              </td>
              <td className="px-4 py-2 text-gray-600">{r.transferDistanceKm} km</td>
              <td className="px-4 py-2 text-gray-600">
                ₹{r.transferCost.toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-2 font-semibold text-gray-900">
                {r.allocationScore.toFixed(1)}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onSelect?.(r)}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Allocate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
