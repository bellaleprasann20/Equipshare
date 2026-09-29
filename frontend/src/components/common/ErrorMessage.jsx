import React from "react";

/**
 * Inline error banner — use for API failures (e.g. allocation
 * request failed) or form-level validation summaries.
 *
 * Usage:
 *   {error && <ErrorMessage message={error} onRetry={fetchEquipment} />}
 */
export default function ErrorMessage({ message = "Something went wrong.", onRetry = null }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}
