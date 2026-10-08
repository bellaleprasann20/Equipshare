import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/environment.js";

/**
 * Authentication middleware
 *
 * Verifies:
 * 1. Authorization header exists
 * 2. Header uses Bearer authentication
 * 3. JWT is valid and not expired
 * 4. User still exists in the database
 *
 * Adds a minimal user object to req.user.
 */
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Not authorized. Authentication required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Invalid authentication format.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. No token provided.",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        message: "Not authorized. Invalid token.",
      });
    }

    // Verify that the account still exists.
    const user = await User.findById(decoded.id)
      .select("_id name role")
      .lean();

    if (!user) {
      return res.status(401).json({
        message: "Not authorized. User account no longer exists.",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
    };

    return next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (
      err?.name === "JsonWebTokenError" ||
      err?.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Not authorized. Invalid token.",
      });
    }

    console.error("Authentication middleware error:", err);

    return res.status(500).json({
      message: "Authentication service temporarily unavailable.",
    });
  }
}

/**
 * Handles unknown routes.
 *
 * Mount AFTER all application routes.
 */
export function notFound(req, res, next) {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;

  return next(error);
}

/**
 * Centralized error handler.
 *
 * Mount LAST in server.js.
 *
 * Production responses intentionally avoid exposing:
 * - stack traces
 * - MongoDB errors
 * - filesystem paths
 * - internal implementation details
 */
export function errorHandler(err, req, res, next) {
  const statusCode =
    Number.isInteger(err?.statusCode) && err.statusCode >= 400
      ? err.statusCode
      : res.statusCode >= 400
        ? res.statusCode
        : 500;

  console.error("Server error:", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err?.message,
    stack: err?.stack,
  });

  const response = {
    message:
      statusCode >= 500
        ? "Something went wrong on the server."
        : err?.message || "Request failed.",
  };

  // Stack traces are useful during development only.
  if (env.NODE_ENV !== "production") {
    response.stack = err?.stack;
  }

  return res.status(statusCode).json(response);
}

/**
 * Admin-only middleware.
 *
 * Must run AFTER protect().
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "This action requires admin access.",
    });
  }

  return next();
}

/**
 * Generic role-based authorization middleware.
 *
 * Example:
 * requireRole("admin", "manager")
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized.",
      });
    }

    if (allowedRoles.length === 0) {
      return res.status(500).json({
        message: "Role configuration error.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have access to this action.",
      });
    }

    return next();
  };
}