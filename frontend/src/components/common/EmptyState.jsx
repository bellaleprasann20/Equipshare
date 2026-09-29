import React from "react";

/**
 * Shown when a list/table has no data — e.g. no equipment
 * matches the current filters, or no allocation requests yet.
 *
 * Usage:
 *   {equipment.length === 0 ? (
 *     <EmptyState
 *       title="No equipment found"
 *       description="Try adjusting your filters or add new equipment."
 *       actionLabel="Add Equipment"
 *       onAction={() => navigate('/equipment/add')}
 *     />
 *   ) : (
 *     <EquipmentTable data={equipment} />
 *   )}
 */
export default function EmptyState({
  title = "Nothing here yet",
  description = "",
  icon = "📦",
  actionLabel = "",
  onAction = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {description && <p className="max-w-sm text-sm text-gray-500">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
