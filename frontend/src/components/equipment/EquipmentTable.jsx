import React, { useState } from "react";
import EEIBadge from "./EEIBadge";
import MaintenanceStatus from "./MaintenanceStatus";
import EmptyState from "../common/EmptyState";

/**
 * Tabular list of equipment — used on the main Equipment List
 * page (admin-facing, denser than the card grid). Supports
 * click-to-sort on EEI score, useful for admins scanning for
 * underperforming machines.
 *
 * Usage:
 *   <EquipmentTable data={equipmentList} onRowClick={(eq) => navigate(`/equipment/${eq._id}`)} />
 */
export default function EquipmentTable({ data = [], onRowClick }) {
  const [sortKey, setSortKey] = useState("eeiScore");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    if (typeof aVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  if (data.length === 0) {
    return <EmptyState title="No equipment found" description="Try adjusting your filters." />;
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "location", label: "Location" },
    { key: "availability", label: "Status" },
    { key: "eeiScore", label: "EEI Score" },
    { key: "maintenance", label: "Maintenance", sortable: false },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`px-4 py-2 text-left font-medium text-gray-600 ${
                  col.sortable !== false ? "cursor-pointer select-none hover:text-gray-900" : ""
                }`}
              >
                {col.label}
                {sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {sorted.map((eq) => (
            <tr
              key={eq._id}
              onClick={() => onRowClick?.(eq)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="px-4 py-2 font-medium text-gray-900">{eq.name}</td>
              <td className="px-4 py-2 text-gray-600">{eq.type}</td>
              <td className="px-4 py-2 text-gray-600">{eq.location}</td>
              <td className="px-4 py-2">
                <span
                  className={
                    eq.availability === "available"
                      ? "font-medium text-green-600"
                      : "text-gray-400"
                  }
                >
                  {eq.availability === "available" ? "Available" : "In use"}
                </span>
              </td>
              <td className="px-4 py-2">
                <EEIBadge score={eq.eeiScore} showLabel={false} />
              </td>
              <td className="px-4 py-2">
                <MaintenanceStatus
                  lastServiceDate={eq.lastServiceDate}
                  recommendedIntervalDays={eq.maintenanceIntervalDays || 90}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
