
import mongoose from "mongoose";

import Project from "../models/Project.js";
import AllocationRequest from "../models/AllocationRequest.js";
import Equipment from "../models/Equipment.js";
import Order from "../models/Order.js";

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
 * Update project details.
 * Status cannot be changed through this endpoint.
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
 * PATCH /api/projects/:id/complete
 *
 * Complete a project:
 * 1. Complete active allocations.
 * 2. Cancel pending allocation requests.
 * 3. Release allocated equipment.
 * 4. Preserve sold equipment.
 * 5. Protect equipment used by other active allocations
 *    or approved orders.
 */
export async function completeProject(req, res) {
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

    if (project.status === "completed") {
      return res.json({
        message: "Project is already completed.",
        project,
      });
    }

    // Find active allocations belonging to this project.
    const activeRequests = await AllocationRequest.find({
      projectId: project._id,
      status: "active",
      allocatedEquipmentId: { $ne: null },
    })
      .select("_id allocatedEquipmentId")
      .lean();

    const equipmentIds = [
      ...new Set(
        activeRequests.map((request) =>
          request.allocatedEquipmentId.toString()
        )
      ),
    ];

    // Complete active allocation requests.
    await AllocationRequest.updateMany(
      {
        projectId: project._id,
        status: "active",
      },
      {
        $set: { status: "completed" },
      }
    );

    // Cancel pending requests for this project.
    await AllocationRequest.updateMany(
      {
        projectId: project._id,
        status: "pending",
      },
      {
        $set: { status: "cancelled" },
      }
    );

    if (equipmentIds.length > 0) {
      // Find equipment used by other active allocations.
      const otherActiveEquipment =
        await AllocationRequest.distinct(
          "allocatedEquipmentId",
          {
            allocatedEquipmentId: { $in: equipmentIds },
            status: "active",
          }
        );

      // Find equipment included in approved orders.
      const approvedOrders = await Order.find({
        status: "approved",
        "items.equipmentId": { $in: equipmentIds },
      })
        .select("items.equipmentId")
        .lean();

      const protectedIds = new Set([
        ...otherActiveEquipment.map(String),

        ...approvedOrders.flatMap((order) =>
          order.items
            .filter((item) =>
              equipmentIds.includes(
                item.equipmentId.toString()
              )
            )
            .map((item) => item.equipmentId.toString())
        ),
      ]);

      const releasableIds = equipmentIds.filter(
        (equipmentId) => !protectedIds.has(equipmentId)
      );

      // Release only equipment currently marked in_use.
      // Sold equipment remains sold.
      if (releasableIds.length > 0) {
        await Equipment.updateMany(
          {
            _id: { $in: releasableIds },
            availability: "in_use",
          },
          {
            $set: { availability: "available" },
          }
        );
      }
    }

    // Mark project completed.
    project.status = "completed";
    await project.save();

    return res.json({
      message: "Project completed and equipment released successfully.",
      project,
      completedAllocations: activeRequests.length,
    });
  } catch (err) {
    console.error("completeProject:", err);

    return res.status(500).json({
      message: "Failed to complete project.",
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
        message:
          "Cannot delete a project with pending or active allocation requests.",
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
