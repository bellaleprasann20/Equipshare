import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "excavator",
        "crane",
        "bulldozer",
        "loader",
        "concrete_mixer",
        "dump_truck",
      ],
      lowercase: true,
      index: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    coordinates: {
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

    imageUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    availability: {
      type: String,
      enum: ["available", "in_use", "sold"],
      default: "available",
      index: true,
    },

    // Commercial prices in INR
    rentPerDay: {
      type: Number,
      default: 0,
      min: 0,
    },

    salePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // EEI raw inputs
    operatingCostPerDay: {
      type: Number,
      default: 0,
      min: 0,
    },

    purchaseDate: {
      type: Date,
    },

    operatingHoursLast30Days: {
      type: Number,
      default: 0,
      min: 0,
    },

    idleHoursLast30Days: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalJobsAssigned: {
      type: Number,
      default: 0,
      min: 0,
    },

    breakdownCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastServiceDate: {
      type: Date,
    },

    maintenanceIntervalDays: {
      type: Number,
      default: 90,
      min: 1,
      max: 3650,
    },

    // Cached EEI result
    eeiScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    eeiBreakdown: {
      utilization: {
        type: Number,
        min: 0,
        max: 100,
      },

      reliability: {
        type: Number,
        min: 0,
        max: 100,
      },

      maintenance: {
        type: Number,
        min: 0,
        max: 100,
      },

      age: {
        type: Number,
        min: 0,
        max: 100,
      },

      cost: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    eeiUpdatedAt: {
      type: Date,
    },

    reviews: [
      {
        reviewerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        reviewerName: {
          type: String,
          trim: true,
          maxlength: 100,
        },

        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },

        comment: {
          type: String,
          trim: true,
          maxlength: 1000,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Current utilization percentage.
 */
equipmentSchema.virtual("utilizationRate").get(function () {
  const operating = Math.max(
    0,
    this.operatingHoursLast30Days || 0
  );

  const idle = Math.max(
    0,
    this.idleHoursLast30Days || 0
  );

  const total = operating + idle;

  if (total === 0) {
    return 0;
  }

  return Math.round((operating / total) * 100);
});

equipmentSchema.set("toJSON", {
  virtuals: true,
});

equipmentSchema.set("toObject", {
  virtuals: true,
});

export default mongoose.model("Equipment", equipmentSchema);