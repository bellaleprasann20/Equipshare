import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
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

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "active",
        "completed",
        "on_hold",
      ],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.pre("validate", function (next) {
  if (
    this.startDate &&
    this.endDate &&
    this.endDate < this.startDate
  ) {
    return next(
      new Error("Project end date must be after start date.")
    );
  }

  next();
});

projectSchema.index({
  managerId: 1,
  status: 1,
});

export default mongoose.model(
  "Project",
  projectSchema
);