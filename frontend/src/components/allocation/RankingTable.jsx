import React from "react";
import EEIBadge from "../equipment/EEIBadge";
import EmptyState from "../common/EmptyState";

function getEquipmentType(equipment) {
  return equipment?.type || equipment?.category || "—";
}

function getEquipmentLocation(equipment) {
  return (
    equipment?.location ||
    equipment?.currentLocation?.siteName ||
    "—"
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

export default function RankingTable({ results = [], onSelect }) {
  if (!Array.isArray(results) || results.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Submit a requirement to see ranked equipment matches."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="min-w-full text-sm">
        <thead className="border-b border-line bg-paper">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel">
              Rank
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel">
              Equipment
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel">
              Location
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel">
              EEI
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel">
              Distance
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel">
              Transfer Cost
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel">
              Score
            </th>

            {onSelect && (
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel">
                Action
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-line">
          {results.map((result, index) => {
            const equipment = result?.equipment || {};
            const rank = result?.rank ?? index + 1;

            const isTopPick = rank === 1;

            return (
              <tr
                key={equipment._id || `recommendation-${index}`}
                className={
                  isTopPick
                    ? "bg-signal/5"
                    : "transition-colors hover:bg-paper/50"
                }
              >
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex h-7 w-7 items-center justify-center",
                      "font-mono text-xs font-bold",
                      isTopPick
                        ? "bg-signal text-white"
                        : "bg-paper text-steel",
                    ].join(" ")}
                  >
                    {rank}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="font-display text-sm font-semibold text-ink">
                    {equipment.name || "Unnamed equipment"}
                  </div>

                  <div className="mt-0.5 text-xs text-steel">
                    {getEquipmentType(equipment)}
                  </div>
                </td>

                <td className="px-4 py-3 text-xs text-steel">
                  {getEquipmentLocation(equipment)}
                </td>

                <td className="px-4 py-3">
                  <EEIBadge
                    score={equipment.eeiScore}
                    showLabel={false}
                  />
                </td>

                <td className="px-4 py-3 font-mono text-xs text-steel">
                  {formatNumber(result?.transferDistanceKm)} km
                </td>

                <td className="px-4 py-3 font-mono text-xs text-steel">
                  {formatCurrency(result?.transferCost)}
                </td>

                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-semibold text-ink">
                    {formatNumber(result?.allocationScore)}
                  </span>
                </td>

                {onSelect && (
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelect(result)}
                      className="border border-signal px-3 py-1.5 text-xs font-semibold text-signal transition-colors hover:bg-signal hover:text-white"
                    >
                      Allocate
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}