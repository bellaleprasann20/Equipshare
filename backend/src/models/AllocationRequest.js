import mongoose from "mongoose";

/**
 * One equipment requirement raised by a project. This is what
 * RequirementForm.jsx submits (POST /api/allocate), what
 * allocationService.js ranks candidates against, and what
 * AllocationHistory.jsx reads back. rankedResults is a
 * point-in-time snapshot of the ranking at request time — kept
 * even if equipment EEI scores later change, so history stays
 * accurate to what was actually recommended.
 */
const allocationRequestSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    equipmentType: { type: String, required: true },
    projectLocation: { type: String, required: true },
    projectCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    requiredFrom: { type: Date, required: true },
    requiredTo: { type: Date, required: true },
    maxTransferDistanceKm: { type: Number },
    notes: { type: String },

    // Snapshot of allocationService.js output at request time
    rankedResults: [
      {
        equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" },
        rank: Number,
        allocationScore: Number,
        transferDistanceKm: Number,
        transferCost: Number,
        scoreBreakdown: {
          eei: Number,
          distance: Number,
          cost: Number,
          durationFit: Number,
        },
      },
    ],

    allocatedEquipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" },
    allocationScore: { type: Number }, // score of the equipment actually chosen

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AllocationRequest", allocationRequestSchema);