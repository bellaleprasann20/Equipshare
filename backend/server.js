import express from "express";
import cors from "cors";

import { env } from "./src/config/environment.js";
import { connectDB } from "./src/config/db.js";

import {
  notFound,
  errorHandler,
} from "./src/middleware/errorMiddleware.js";

import { logger } from "./src/utils/logger.js";

import authRoutes from "./src/routes/authRoutes.js";
import equipmentRoutes from "./src/routes/equipmentRoutes.js";
import allocationRoutes from "./src/routes/allocationRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

const app = express();

/* =========================================================
   CORE MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Prevent unnecessarily large JSON requests.
app.use(
  express.json({
    limit: "1mb",
  })
);

/* =========================================================
   DEVELOPMENT REQUEST LOGGING
========================================================= */

if (env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    logger.request(req);
    next();
  });
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/equipment", equipmentRoutes);

app.use("/api/allocate", allocationRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/analytics", analyticsRoutes);

/* =========================================================
   ERROR HANDLING
========================================================= */

// Must come after all routes.
app.use(notFound);

app.use(errorHandler);

/* =========================================================
   SERVER START
========================================================= */

async function start() {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(
        `EquipShare backend running on http://localhost:${env.PORT}`
      );
    });

    /* =====================================================
       GRACEFUL SHUTDOWN
    ===================================================== */

    const shutdown = (signal) => {
      logger.info(
        `${signal} received. Shutting down server...`
      );

      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });

      // Prevent shutdown from hanging forever.
      setTimeout(() => {
        logger.error(
          "Forced shutdown after timeout."
        );

        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error(
      "Failed to start EquipShare backend.",
      {
        message: error.message,
      }
    );

    process.exit(1);
  }
}

start();