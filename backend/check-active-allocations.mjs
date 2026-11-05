import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "./src/models/Project.js";
import AllocationRequest from "./src/models/AllocationRequest.js";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI);

  const items = await AllocationRequest.find({
    status: { $in: ["pending", "active"] }
  })
    .populate("projectId", "name location")
    .select("projectId requestedBy equipmentType projectLocation status createdAt")
    .lean();

  console.log(JSON.stringify(items, null, 2));
} catch (error) {
  console.error(error);
} finally {
  await mongoose.disconnect();
}
