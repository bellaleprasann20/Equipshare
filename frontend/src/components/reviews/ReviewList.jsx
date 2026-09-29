import React from "react";
import Rating from "./Rating";
import EmptyState from "../common/EmptyState";

/**
 * List of past reviews for one piece of equipment. Shown on
 * the EquipmentDetails page, below the ReviewForm (if the
 * current user is eligible to also leave one).
 *
 * Expected shape of `reviews`:
 *   [{ _id, reviewerName, rating, comment, createdAt }, ...]
 *
 * Usage:
 *   <ReviewList reviews={equipment.reviews} />
 */
export default function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="This equipment hasn't been reviewed by any verified renters yet."
        icon="⭐"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div key={review._id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{review.reviewerName}</span>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="mt-1">
            <Rating value={review.rating} size="sm" />
          </div>
          {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}
