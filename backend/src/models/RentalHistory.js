import mongoose from "mongoose";

/**
 * Completed rental/usage records — one entry per allocation
 * once it finishes. Two jobs:
 *   1. Feeds utilization stats (operatingHoursLast30Days etc. on
 *      Equipment) via a recompute job/script.
 *   2. Gates review eligibility — reviewController.js checks
 *      "does this user have a completed RentalHistory entry for
 *      this equipment?" before allowing a review (per the
 *      Phase-1 proposal's verified-renter-only requirement).
 */
const rentalHistorySchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    allocationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AllocationRequest",
    },
    rentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    operatingHours: { type: Number, default: 0 },
    idleHours: { type: Number, default: 0 },
    hadBreakdown: { type: Boolean, default: false },

    totalCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["ongoing", "completed", "cancelled"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("RentalHistory", rentalHistorySchema);