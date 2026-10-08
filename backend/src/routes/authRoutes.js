import express from "express";

import {
  register,
  login,
  getCurrentUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * Public registration.
 *
 * IMPORTANT:
 * authController must always create a manager.
 * It must never trust req.body.role.
 */
router.post(
  "/register",
  register
);

/*
 * Public login.
 */
router.post(
  "/login",
  login
);

/*
 * Get currently authenticated user.
 */
router.get(
  "/me",
  protect,
  getCurrentUser
);

export default router;