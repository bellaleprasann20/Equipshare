import mongoose from "mongoose";

const rentalHistorySchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
      index: true,
    },

    allocationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AllocationRequest",
      index: true,
    },

    rentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    operatingHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    idleHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    hadBreakdown: {
      type: Boolean,
      default: false,
    },

    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "ongoing",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

rentalHistorySchema.pre("validate", function (next) {
  if (
    this.startDate &&
    this.endDate &&
    this.endDate < this.startDate
  ) {
    return next(
      new Error("Rental end date must be after start date.")
    );
  }

  next();
});

rentalHistorySchema.index({
  rentedBy: 1,
  equipmentId: 1,
  status: 1,
});

rentalHistorySchema.index({
  projectId: 1,
  status: 1,
});

export default mongoose.model(
  "RentalHistory",
  rentalHistorySchema
);