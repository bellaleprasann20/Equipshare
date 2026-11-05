
import mongoose from "mongoose";
import Project from "../models/Project.js";
import AllocationRequest from "../models/AllocationRequest.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const getProjectFilter = (req) => {
  if (req.user.role === "admin") return {};
  return { managerId: req.user.id };
};

/**
 * POST /api/projects
 * Create a project owned by the authenticated user.
 */
export async function createProject(req, res) {
  try {
    const {
      name,
      location,
      coordinates,
      startDate,
      endDate,
    } = req.body;

    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({
        message: "Project name and location are required.",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      location: location.trim(),
      coordinates,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      managerId: req.user.id,
    });

    return res.status(201).json({ project });
  } catch (err) {
    return res.status(400).json({
      message: "Failed to create project.",
      error: err.message,
    });
  }
}

/**
 * GET /api/projects
 * Managers see their own projects.
 * Admins can see all projects.
 */
export async function listMyProjects(req, res) {
  try {
    const projects = await Project.find(getProjectFilter(req))
      .populate("managerId", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      count: projects.length,
      projects,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch projects.",
      error: err.message,
    });
  }
}

/**
 * GET /api/projects/:id
 */
export async function getProjectById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findOne({
      _id: id,
      ...getProjectFilter(req),
    }).populate("managerId", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    return res.json({ project });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch project.",
      error: err.message,
    });
  }
}

/**
 * PUT /api/projects/:id
 * Only project details can be updated.
 * Ownership cannot be changed through this endpoint.
 */
export async function updateProject(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const allowedFields = [
      "name",
      "location",
      "coordinates",
      "startDate",
      "endDate",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid project fields provided.",
      });
    }

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        message: "Project name cannot be empty.",
      });
    }

    if (
      updates.location !== undefined &&
      (typeof updates.location !== "string" || !updates.location.trim())
    ) {
      return res.status(400).json({
        message: "Project location cannot be empty.",
      });
    }

    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    if (updates.location !== undefined) {
      updates.location = updates.location.trim();
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: id,
        ...getProjectFilter(req),
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("managerId", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    return res.json({ project });
  } catch (err) {
    return res.status(400).json({
      message: "Failed to update project.",
      error: err.message,
    });
  }
}

/**
 * DELETE /api/projects/:id
 * Projects with pending or active allocations cannot be deleted.
 */
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findOne({
      _id: id,
      ...getProjectFilter(req),
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const hasActiveAllocation = await AllocationRequest.exists({
      projectId: project._id,
      status: { $in: ["pending", "active"] },
    });

    if (hasActiveAllocation) {
      return res.status(409).json({
        message: "Cannot delete a project with pending or active allocation requests.",
      });
    }

    await Project.deleteOne({ _id: project._id });

    return res.status(200).json({
      message: "Project deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete project.",
      error: err.message,
    });
  }
}
