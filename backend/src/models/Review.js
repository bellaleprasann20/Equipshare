/**
 * NOTE: Reviews are stored as a SUBDOCUMENT ARRAY directly on
 * Equipment (see the `reviews` field in Equipment.js), not as a
 * separate top-level collection — that's why there's no
 * `mongoose.model("Review", ...)` here. This keeps ReviewList.jsx
 * simple (reviews arrive already nested in the equipment object,
 * one query, no join) since review volume per equipment is small.
 *
 * This file just exports the subdocument shape for reuse — e.g.
 * if reviewController.js needs to validate a review's shape
 * before pushing it into Equipment.reviews.
 */
import mongoose from "mongoose";

export const reviewSubSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewerName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});