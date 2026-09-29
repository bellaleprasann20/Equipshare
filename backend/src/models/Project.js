import mongoose from "mongoose";

/**
 * A construction project/site — the "requester" side of the
 * allocation flow. A project manager (User with role "manager")
 * creates a Project, then raises AllocationRequests against it.
 */
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "completed", "on_hold"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);