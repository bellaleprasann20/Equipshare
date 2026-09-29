import mongoose from "mongoose";

/**
 * Maintenance/service log entries per equipment. Feeds two
 * things: the MaintenanceStatus.jsx display (via Equipment's
 * lastServiceDate, kept in sync — see the pre-save hook below),
 * and the maintenance history table on the equipment detail
 * page.
 */
const maintenanceSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    serviceDate: { type: Date, required: true, default: Date.now },
    type: {
      type: String,
      enum: ["routine", "repair", "breakdown_repair", "inspection"],
      default: "routine",
    },
    description: { type: String },
    cost: { type: Number, default: 0 },
    performedBy: { type: String }, // technician/vendor name
  },
  { timestamps: true }
);

// Keep Equipment.lastServiceDate in sync whenever a new
// maintenance record is logged, so eeiCalculator.js always
// reads the latest date without a separate manual update step.
maintenanceSchema.post("save", async function (doc) {
  const Equipment = mongoose.model("Equipment");
  await Equipment.findByIdAndUpdate(doc.equipmentId, { lastServiceDate: doc.serviceDate });
});

export default mongoose.model("Maintenance", maintenanceSchema);