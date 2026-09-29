import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/environment.js";

/**
 * Verifies the JWT sent in the Authorization header
 * ("Bearer <token>"), and attaches the decoded user to
 * req.user for downstream controllers/middleware to use.
 *
 * Every protected route imports this as `protect` — see
 * authRoutes.js, equipmentRoutes.js, allocationRoutes.js,
 * analyticsRoutes.js.
 */
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Confirm the user still exists (handles the case where a
    // valid token was issued but the account was since deleted)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized. User no longer exists." });
    }

    req.user = { id: user._id.toString(), name: user.name, role: user.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Not authorized. Invalid token." });
  }
}
