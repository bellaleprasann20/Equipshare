import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas (or local MongoDB during dev, if
 * MONGO_URI points to localhost). Called once from server.js
 * on startup.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set. Add it to your .env file.");
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
