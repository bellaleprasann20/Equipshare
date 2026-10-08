import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
      index: true,
    },

    serviceDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "routine",
        "repair",
        "breakdown_repair",
        "inspection",
      ],
      default: "routine",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    performedBy: {
      type: String,
      trim: true,
      maxlength: 150,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * After creating a maintenance record,
 * synchronize Equipment.lastServiceDate
 * with the latest maintenance record.
 */
maintenanceSchema.post("save", async function () {
  try {
    const Equipment = mongoose.model("Equipment");

    const latestMaintenance = await mongoose
      .model("Maintenance")
      .findOne({
        equipmentId: this.equipmentId,
      })
      .sort({ serviceDate: -1 })
      .select("serviceDate")
      .lean();

    if (latestMaintenance) {
      await Equipment.findByIdAndUpdate(
        this.equipmentId,
        {
          lastServiceDate: latestMaintenance.serviceDate,
        }
      );
    }
  } catch (error) {
    console.error(
      "Failed to synchronize equipment service date:",
      error
    );
  }
});

/**
 * Also synchronize when a maintenance record is deleted
 * using findOneAndDelete().
 */
maintenanceSchema.post(
  "findOneAndDelete",
  async function (deletedDoc) {
    if (!deletedDoc) return;

    try {
      const Equipment = mongoose.model("Equipment");

      const latestMaintenance = await mongoose
        .model("Maintenance")
        .findOne({
          equipmentId: deletedDoc.equipmentId,
        })
        .sort({ serviceDate: -1 })
        .select("serviceDate")
        .lean();

      await Equipment.findByIdAndUpdate(
        deletedDoc.equipmentId,
        {
          lastServiceDate:
            latestMaintenance?.serviceDate || null,
        }
      );
    } catch (error) {
      console.error(
        "Failed to synchronize service date after deletion:",
        error
      );
    }
  }
);

export default mongoose.model(
  "Maintenance",
  maintenanceSchema
);