import mongoose from "mongoose";
import { env } from "./environment.js";

export async function connectDB() {
  if (!env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not configured."
    );
  }

  try {
    await mongoose.connect(
      env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      `MongoDB connected: ${mongoose.connection.host}`
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    throw error;
  }
}