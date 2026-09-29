import express from "express";
import cors from "cors";
import { env } from "./src/config/environment.js";
import { connectDB } from "./src/config/db.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import { logger } from "./src/utils/logger.js";

import authRoutes from "./src/routes/authRoutes.js";
import equipmentRoutes from "./src/routes/equipmentRoutes.js";
import allocationRoutes from "./src/routes/allocationRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

const app = express();

// --- Core middleware ---
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Log every request in non-production environments
if (env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    logger.request(req);
    next();
  });
}

// --- Health check (useful to confirm the server is up before
//     testing anything else, and for a deployment platform's
//     uptime check if you deploy this later) ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/allocate", allocationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

// --- Error handling (must be mounted last) ---
app.use(notFound);
app.use(errorHandler);

// --- Start ---
async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`EquipShare backend running on http://localhost:${env.PORT}`);
  });
}

start();
