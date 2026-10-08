import React, { useMemo, useState } from "react";
import EEIBadge from "./EEIBadge";
import MaintenanceStatus from "./MaintenanceStatus";
import EmptyState from "../common/EmptyState";

function getAvailability(availability) {
  if (availability === "available") {
    return {
      label: "Available",
      dot: "bg-emerald-400",
      text: "text-emerald-400",
    };
  }

  if (availability === "reserved") {
    return {
      label: "Reserved",
      dot: "bg-amber-400",
      text: "text-amber-400",
    };
  }

  return {
    label: "In use",
    dot: "bg-zinc-500",
    text: "text-zinc-400",
  };
}

export default function EquipmentTable({
  data = [],
  onRowClick,
}) {
  const [sortKey, setSortKey] = useState("eeiScore");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((current) =>
        current === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortKey(key);
    setSortDir("desc");
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a?.[sortKey];
      const bVal = b?.[sortKey];

      if (aVal === null || aVal === undefined) {
        return 1;
      }

      if (bVal === null || bVal === undefined) {
        return -1;
      }

      if (typeof aVal === "string") {
        const comparison = aVal.localeCompare(
          String(bVal),
          undefined,
          { sensitivity: "base" }
        );

        return sortDir === "asc"
          ? comparison
          : -comparison;
      }

      const comparison = Number(aVal) - Number(bVal);

      return sortDir === "asc"
        ? comparison
        : -comparison;
    });
  }, [data, sortKey, sortDir]);

  if (!data.length) {
    return (
      <EmptyState
        title="No equipment found"
        description="There are no equipment records matching the current view."
      />
    );
  }

  const columns = [
    { key: "name", label: "Equipment" },
    { key: "type", label: "Type" },
    { key: "location", label: "Location" },
    { key: "availability", label: "Status" },
    { key: "eeiScore", label: "EEI" },
    {
      key: "maintenance",
      label: "Maintenance",
      sortable: false,
    },
  ];

  return (
    <div className="overflow-hidden border border-zinc-800 bg-[#1c1c1f]">
      <div className="overflow-x-auto">
        <table className="min-w-[850px] w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-[#19191c]">
            <tr>
              {columns.map((column) => {
                const sortable = column.sortable !== false;

                return (
                  <th
                    key={column.key}
                    scope="col"
                    onClick={() =>
                      sortable && handleSort(column.key)
                    }
                    className={`px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ${
                      sortable
                        ? "cursor-pointer select-none hover:text-zinc-300"
                        : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {column.label}

                      {sortable && sortKey === column.key && (
                        <span className="text-violet-400">
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800">
            {sorted.map((equipment) => {
              const status = getAvailability(
                equipment?.availability
              );

              const clickable = Boolean(onRowClick);

              return (
                <tr
                  key={equipment?._id}
                  onClick={() =>
                    onRowClick?.(equipment)
                  }
                  className={`group transition-colors ${
                    clickable
                      ? "cursor-pointer hover:bg-white/[0.025]"
                      : ""
                  }`}
                >
                  {/* Equipment */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-800 bg-[#161618] font-display text-sm font-bold text-zinc-600">
                        {equipment?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "E"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {equipment?.name || "Unnamed equipment"}
                        </p>

                        {equipment?.model && (
                          <p className="mt-0.5 truncate text-xs text-zinc-600">
                            {equipment.model}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4 text-zinc-400">
                    {equipment?.type || "—"}
                  </td>

                  {/* Location */}
                  <td className="px-5 py-4 text-zinc-400">
                    {equipment?.location || "—"}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-2 text-xs font-medium ${status.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </td>

                  {/* EEI */}
                  <td className="px-5 py-4">
                    <EEIBadge
                      score={equipment?.eeiScore}
                      showLabel
                    />
                  </td>

                  {/* Maintenance */}
                  <td className="px-5 py-4">
                    <MaintenanceStatus
                      lastServiceDate={
                        equipment?.lastServiceDate
                      }
                      recommendedIntervalDays={
                        equipment?.maintenanceIntervalDays || 90
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-zinc-800 bg-[#19191c] px-5 py-3">
        <p className="text-xs text-zinc-600">
          {data.length} equipment{" "}
          {data.length === 1 ? "record" : "records"}
        </p>
      </div>
    </div>
  );
}