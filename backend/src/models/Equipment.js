import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["excavator", "crane", "bulldozer", "loader", "concrete_mixer", "dump_truck"],
    },
    location: { type: String, required: true, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    imageUrl: { type: String, default: "" },

    availability: {
      type: String,
      enum: ["available", "in_use", "sold"],
      default: "available",
    },

    // Commercial prices, in INR
    rentPerDay: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },

    // EEI raw inputs
    operatingCostPerDay: { type: Number, default: 0 },
    purchaseDate: { type: Date },
    operatingHoursLast30Days: { type: Number, default: 0 },
    idleHoursLast30Days: { type: Number, default: 0 },
    totalJobsAssigned: { type: Number, default: 0 },
    breakdownCount: { type: Number, default: 0 },
    lastServiceDate: { type: Date },
    maintenanceIntervalDays: { type: Number, default: 90 },

    // Cached EEI result
    eeiScore: { type: Number, default: null },
    eeiBreakdown: {
      utilization: Number,
      reliability: Number,
      maintenance: Number,
      age: Number,
      cost: Number,
    },
    eeiUpdatedAt: { type: Date },

    reviews: [
      {
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewerName: String,
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

equipmentSchema.virtual("utilizationRate").get(function () {
  const total = this.operatingHoursLast30Days + this.idleHoursLast30Days;
  if (!total) return 0;
  return Math.round((this.operatingHoursLast30Days / total) * 100);
});

equipmentSchema.set("toJSON", { virtuals: true });
equipmentSchema.set("toObject", { virtuals: true });

export default mongoose.model("Equipment", equipmentSchema);