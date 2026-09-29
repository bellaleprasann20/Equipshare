import React from "react";

/**
 * Star rating — works as both a read-only display (in review
 * lists) and an interactive input (in the review form).
 *
 * Usage (read-only):
 *   <Rating value={4} />
 *
 * Usage (interactive):
 *   <Rating value={rating} onChange={setRating} interactive />
 */
export default function Rating({ value = 0, onChange, interactive = false, max = 5, size = "md" }) {
  const sizeClasses = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

  return (
    <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : "img"} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={[
              sizeClasses[size] || sizeClasses.md,
              filled ? "text-yellow-400" : "text-gray-300",
              interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default",
            ].join(" ")}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
