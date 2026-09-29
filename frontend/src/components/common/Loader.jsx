import React from "react";

/**
 * Loading spinner. Use `fullScreen` for page-level loads,
 * or drop it inline inside a card/table while data fetches.
 *
 * Usage:
 *   {loading ? <Loader /> : <EquipmentTable data={equipment} />}
 *   <Loader fullScreen label="Loading recommendations..." />
 */
export default function Loader({ size = "md", label = "", fullScreen = false }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <span
        className={[
          "animate-spin rounded-full border-blue-600 border-t-transparent",
          sizeClasses[size] || sizeClasses.md,
        ].join(" ")}
        role="status"
        aria-label="Loading"
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>;
}
