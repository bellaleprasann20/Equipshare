
import express from "express";
import mongoose from "mongoose";

import {
  createProject,
  listMyProjects,
  getProjectById,
  updateProject,
  completeProject,
  deleteProject,
} from "../controllers/projectController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.param("id", (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid project ID.",
    });
  }

  return next();
});

/*
 * Create a project.
 *
 * POST /api/projects
 */
router.post(
  "/",
  protect,
  createProject
);

/*
 * List projects belonging to the
 * currently authenticated manager.
 *
 * GET /api/projects
 */
router.get(
  "/",
  protect,
  listMyProjects
);

/*
 * Get one project.
 *
 * GET /api/projects/:id
 */
router.get(
  "/:id",
  protect,
  getProjectById
);

/*
 * Complete a project and release its equipment.
 *
 * PATCH /api/projects/:id/complete
 */
router.patch(
  "/:id/complete",
  protect,
  completeProject
);

/*
 * Update project details.
 *
 * PUT /api/projects/:id
 */
router.put(
  "/:id",
  protect,
  updateProject
);

/*
 * Delete a project.
 *
 * DELETE /api/projects/:id
 */
router.delete(
  "/:id",
  protect,
  deleteProject
);

export default router;
