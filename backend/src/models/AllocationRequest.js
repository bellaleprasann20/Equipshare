import mongoose from "mongoose";

const rankedResultSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },

    rank: {
      type: Number,
      required: true,
      min: 1,
    },

    allocationScore: {
      type: Number,
      required: true,
      min: 0,
    },

    transferDistanceKm: {
      type: Number,
      required: true,
      min: 0,
    },

    transferCost: {
      type: Number,
      required: true,
      min: 0,
    },

    scoreBreakdown: {
      eei: {
        type: Number,
        min: 0,
      },

      distance: {
        type: Number,
        min: 0,
      },

      cost: {
        type: Number,
        min: 0,
      },

      durationFit: {
        type: Number,
        min: 0,
      },
    },
  },
  { _id: false }
);

const allocationRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    equipmentType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
    },

    projectLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    projectCoordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },

      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
    },

    requiredFrom: {
      type: Date,
      required: true,
    },

    requiredTo: {
      type: Date,
      required: true,
    },

    maxTransferDistanceKm: {
      type: Number,
      min: 0,
      max: 10000,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    rankedResults: {
      type: [rankedResultSchema],
      default: [],
    },

    allocatedEquipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
    },

    allocationScore: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "completed",
        "cancelled",
        "rejected",
      ],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Prevent multiple active allocation requirements
 * for the same project.
 *
 * A project can have:
 *   pending  -> one request
 *   active   -> one request
 *
 * Once completed/cancelled/rejected, a new requirement
 * can be created for the project.
 */
allocationRequestSchema.index(
  { projectId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["pending", "active"],
      },
    },
  }
);

allocationRequestSchema.pre("validate", function (next) {
  if (this.requiredFrom && this.requiredTo) {
    if (this.requiredTo < this.requiredFrom) {
      return next(
        new Error("Required end date must be after the start date.")
      );
    }
  }

  next();
});

export default mongoose.model(
  "AllocationRequest",
  allocationRequestSchema
);