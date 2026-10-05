import mongoose from "mongoose";

const allocationRequestSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    equipmentType: { type: String, required: true },
    projectLocation: { type: String, required: true },
    projectCoordinates: { lat: { type: Number }, lng: { type: Number } },
    requiredFrom: { type: Date, required: true },
    requiredTo: { type: Date, required: true },
    maxTransferDistanceKm: { type: Number },
    notes: { type: String },

    rankedResults: [
      {
        equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" },
        rank: Number,
        allocationScore: Number,
        transferDistanceKm: Number,
        transferCost: Number,
        scoreBreakdown: { eei: Number, distance: Number, cost: Number, durationFit: Number },
      },
    ],

    allocatedEquipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" },
    allocationScore: { type: Number },

    // pending: awaiting admin review. active: admin approved, equipment reserved.
    // rejected: admin declined. completed/cancelled: later lifecycle states.
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AllocationRequest", allocationRequestSchema);