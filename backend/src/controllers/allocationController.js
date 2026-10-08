import mongoose from "mongoose";
import AllocationRequest from "../models/AllocationRequest.js";
import Equipment from "../models/Equipment.js";
import { getRankedRecommendations } from "../services/allocationService.js";

/* =========================================================
   HELPERS
   ========================================================= */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function getUserId(req) {
  return req.user?.id || req.user?._id;
}

/* =========================================================
   POST /api/allocate
   Logged-in project manager
   ========================================================= */

export async function requestAllocation(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const {
      equipmentType,
      projectLocation,
      projectCoordinates,
      requiredFrom,
      requiredTo,
      maxTransferDistanceKm,
      notes,
    } = req.body;

    if (!equipmentType || !projectLocation || !requiredFrom || !requiredTo) {
      return res.status(400).json({
        message:
          "Equipment type, project location, start date and end date are required.",
      });
    }

    const startDate = new Date(requiredFrom);
    const endDate = new Date(requiredTo);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid allocation dates.",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        message: "Required end date must be after the start date.",
      });
    }

    if (
      maxTransferDistanceKm !== undefined &&
      maxTransferDistanceKm !== null &&
      maxTransferDistanceKm !== ""
    ) {
      const distance = Number(maxTransferDistanceKm);

      if (!Number.isFinite(distance) || distance <= 0) {
        return res.status(400).json({
          message: "Maximum transfer distance must be greater than zero.",
        });
      }
    }

    if (notes && String(notes).length > 1000) {
      return res.status(400).json({
        message: "Notes cannot exceed 1000 characters.",
      });
    }

    /*
     * One active/pending allocation at a time for the same user.
     *
     * This prevents repeatedly submitting the same project request.
     * True "one requirement per project" enforcement requires a
     * projectId in AllocationRequest.
     */
    const existingRequest = await AllocationRequest.findOne({
      requestedBy: userId,
      status: { $in: ["pending", "active"] },
    }).lean();

    if (existingRequest) {
      return res.status(409).json({
        message:
          "You already have an active allocation request. Please wait for it to be reviewed before creating another one.",
        requestId: existingRequest._id,
      });
    }

    const requirement = {
      equipmentType: String(equipmentType).trim(),
      projectLocation: String(projectLocation).trim(),
      projectCoordinates,
      requiredFrom: startDate,
      requiredTo: endDate,
      maxTransferDistanceKm:
        maxTransferDistanceKm === "" ||
        maxTransferDistanceKm === undefined ||
        maxTransferDistanceKm === null
          ? null
          : Number(maxTransferDistanceKm),
      notes: notes ? String(notes).trim() : "",
    };

    const results = await getRankedRecommendations(requirement);

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({
        message:
          "No suitable equipment was found for the submitted requirement.",
      });
    }

    const allocationRequest = await AllocationRequest.create({
      requestedBy: userId,
      equipmentType: requirement.equipmentType,
      projectLocation: requirement.projectLocation,
      projectCoordinates: requirement.projectCoordinates,
      requiredFrom: requirement.requiredFrom,
      requiredTo: requirement.requiredTo,
      maxTransferDistanceKm: requirement.maxTransferDistanceKm,
      notes: requirement.notes,

      rankedResults: results.map((result) => ({
        equipmentId: result.equipment._id,
        rank: result.rank,
        allocationScore: result.allocationScore,
        transferDistanceKm: result.transferDistanceKm,
        transferCost: result.transferCost,
        scoreBreakdown: result.scoreBreakdown,
      })),
    });

    return res.status(201).json({
      requestId: allocationRequest._id,
      results,
    });
  } catch (err) {
    console.error("requestAllocation:", err);

    return res.status(500).json({
      message: "Failed to generate recommendations.",
    });
  }
}

/* =========================================================
   GET /api/allocate/:requestId
   Request owner OR admin
   ========================================================= */

export async function getAllocationResults(req, res) {
  try {
    const { requestId } = req.params;
    const userId = getUserId(req);

    if (!isValidObjectId(requestId)) {
      return res.status(400).json({
        message: "Invalid allocation request ID.",
      });
    }

    const request = await AllocationRequest.findById(requestId).lean();

    if (!request) {
      return res.status(404).json({
        message: "Allocation request not found.",
      });
    }

    const isOwner =
      request.requestedBy?.toString() === String(userId);

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to view this allocation request.",
      });
    }

    const equipmentIds = (request.rankedResults || []).map(
      (result) => result.equipmentId
    );

    const equipmentDocs = await Equipment.find({
      _id: { $in: equipmentIds },
    }).lean();

    const equipmentMap = Object.fromEntries(
      equipmentDocs.map((equipment) => [
        equipment._id.toString(),
        equipment,
      ])
    );

    const results = (request.rankedResults || [])
      .map((result) => ({
        rank: result.rank,
        equipment: equipmentMap[result.equipmentId.toString()],
        allocationScore: result.allocationScore,
        transferDistanceKm: result.transferDistanceKm,
        transferCost: result.transferCost,
        scoreBreakdown: result.scoreBreakdown,
      }))
      .filter((result) => result.equipment);

    return res.json({
      request: {
        _id: request._id,
        equipmentType: request.equipmentType,
        projectLocation: request.projectLocation,
        requiredFrom: request.requiredFrom,
        requiredTo: request.requiredTo,
        status: request.status,
      },
      requirement: {
        equipmentType: request.equipmentType,
        projectLocation: request.projectLocation,
        requiredFrom: request.requiredFrom,
        requiredTo: request.requiredTo,
      },
      status: request.status,
      results,
    });
  } catch (err) {
    console.error("getAllocationResults:", err);

    return res.status(500).json({
      message: "Failed to fetch allocation results.",
    });
  }
}

/* =========================================================
   GET /api/allocate/admin/pending
   Admin only
   ========================================================= */

export async function listPendingAllocations(req, res) {
  try {
    const requests = await AllocationRequest.find({
      status: "pending",
    })
      .populate("requestedBy", "name companyName")
      .sort({ createdAt: 1 })
      .lean();

    const equipmentIds = requests.flatMap((request) =>
      (request.rankedResults || []).map(
        (result) => result.equipmentId
      )
    );

    const equipmentDocs = await Equipment.find({
      _id: { $in: equipmentIds },
    }).lean();

    const equipmentMap = Object.fromEntries(
      equipmentDocs.map((equipment) => [
        equipment._id.toString(),
        equipment,
      ])
    );

    const items = requests.map((request) => ({
      _id: request._id,
      requestedBy: request.requestedBy,
      equipmentType: request.equipmentType,
      projectLocation: request.projectLocation,
      requiredFrom: request.requiredFrom,
      requiredTo: request.requiredTo,
      createdAt: request.createdAt,

      rankedResults: (request.rankedResults || [])
        .map((result) => ({
          equipmentId: result.equipmentId,
          rank: result.rank,
          allocationScore: result.allocationScore,
          transferDistanceKm: result.transferDistanceKm,
          transferCost: result.transferCost,
          scoreBreakdown: result.scoreBreakdown,
          equipment:
            equipmentMap[result.equipmentId.toString()],
        }))
        .filter((result) => result.equipment),
    }));

    return res.json({ items });
  } catch (err) {
    console.error("listPendingAllocations:", err);

    return res.status(500).json({
      message: "Failed to load pending allocation requests.",
    });
  }
}

/* =========================================================
   POST /api/allocate/:requestId/approve
   Admin only
   ========================================================= */

export async function approveAllocation(req, res) {
  try {
    const { requestId } = req.params;
    const { equipmentId } = req.body;

    if (!isValidObjectId(requestId)) {
      return res.status(400).json({
        message: "Invalid allocation request ID.",
      });
    }

    if (!isValidObjectId(equipmentId)) {
      return res.status(400).json({
        message: "Invalid equipment ID.",
      });
    }

    const request = await AllocationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Allocation request not found.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This request has already been reviewed.",
      });
    }

    const chosen = request.rankedResults.find(
      (result) =>
        result.equipmentId.toString() ===
        equipmentId.toString()
    );

    if (!chosen) {
      return res.status(400).json({
        message:
          "The selected equipment was not part of this allocation request.",
      });
    }

    /*
     * Atomic availability check.
     *
     * Two admins cannot successfully reserve the same machine
     * because only one update can change "available".
     */
    const reserved = await Equipment.findOneAndUpdate(
      {
        _id: equipmentId,
        availability: "available",
      },
      {
        $set: {
          availability: "in_use",
        },
      },
      {
        new: true,
      }
    );

    if (!reserved) {
      return res.status(409).json({
        message:
          "That machine is no longer available. Please choose another ranked machine.",
      });
    }

    request.allocatedEquipmentId = equipmentId;
    request.allocationScore = chosen.allocationScore;
    request.status = "active";

    await request.save();

    return res.json({
      message: "Allocation approved successfully.",
      allocation: request,
    });
  } catch (err) {
    console.error("approveAllocation:", err);

    return res.status(500).json({
      message: "Failed to approve allocation.",
    });
  }
}

/* =========================================================
   POST /api/allocate/:requestId/reject
   Admin only
   ========================================================= */

export async function rejectAllocation(req, res) {
  try {
    const { requestId } = req.params;

    if (!isValidObjectId(requestId)) {
      return res.status(400).json({
        message: "Invalid allocation request ID.",
      });
    }

    const request = await AllocationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Allocation request not found.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This request has already been reviewed.",
      });
    }

    request.status = "rejected";
    await request.save();

    return res.json({
      message: "Allocation request rejected.",
      allocation: request,
    });
  } catch (err) {
    console.error("rejectAllocation:", err);

    return res.status(500).json({
      message: "Failed to reject allocation.",
    });
  }
}

/* =========================================================
   GET /api/allocate/history
   Current user's allocation history
   ========================================================= */

export async function getAllocationHistory(req, res) {
  try {
    const userId = getUserId(req);

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const pageSize = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(req.query.pageSize, 10) || 10
      )
    );

    const skip = (page - 1) * pageSize;

    const query = {
      requestedBy: userId,
    };

    const [requests, totalCount] = await Promise.all([
      AllocationRequest.find(query)
        .populate(
          "allocatedEquipmentId",
          "name type availability currentLocation"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      AllocationRequest.countDocuments(query),
    ]);

    const items = requests.map((request) => ({
      _id: request._id,

      equipmentType: request.equipmentType,

      projectLocation: request.projectLocation,

      requiredFrom: request.requiredFrom,

      requiredTo: request.requiredTo,

      allocatedEquipmentId:
        request.allocatedEquipmentId?._id || null,

      allocatedEquipmentName:
        request.allocatedEquipmentId?.name || null,

      allocatedEquipment:
        request.allocatedEquipmentId || null,

      allocationScore:
        request.allocationScore ?? null,

      status: request.status,

      createdAt: request.createdAt,
    }));

    return res.json({
      items,
      totalCount,
      page,
      pageSize,
      totalPages: Math.max(
        1,
        Math.ceil(totalCount / pageSize)
      ),
    });
  } catch (err) {
    console.error("getAllocationHistory:", err);

    return res.status(500).json({
      message: "Failed to fetch allocation history.",
    });
  }
}