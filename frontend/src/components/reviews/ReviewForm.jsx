import React, { useState } from "react";
import Rating from "./Rating";
import Button from "../common/Button";

/**
 * Review submission form — per the Phase-1 proposal, only
 * verified renters (those with a completed rental history for
 * this equipment) should be allowed to submit. Enforce that
 * check server-side (backend/src/controllers/reviewController.js)
 * — this form assumes it's only rendered for eligible users.
 *
 * Usage:
 *   <ReviewForm equipmentId={equipment._id} onSubmit={handleSubmitReview} loading={submitting} />
 */
export default function ReviewForm({ equipmentId, onSubmit, loading = false }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    onSubmit({ equipmentId, rating, comment });
    setRating(0);
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Leave a review</h3>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-600">Your rating</p>
        <Rating value={rating} onChange={setRating} interactive size="lg" />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was the equipment's condition and performance?"
        rows={3}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <Button type="submit" loading={loading} className="self-end">
        Submit Review
      </Button>
    </form>
  );
}
