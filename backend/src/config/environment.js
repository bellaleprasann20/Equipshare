/**
 * Centralizes environment variable access — everywhere else in
 * the backend imports from here instead of reading process.env
 * directly, so there's exactly one place that knows what's
 * required and what the defaults are.
 *
 * Requires a .env file in backend/ with at least:
 *   MONGO_URI=mongodb+srv://...
 *   JWT_SECRET=some-long-random-string
 */
import dotenv from "dotenv";
dotenv.config();

const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Check your .env file.`
    );
  }
}

validateEnv();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
