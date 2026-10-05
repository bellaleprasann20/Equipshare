import AllocationRequest from "../models/AllocationRequest.js";
import Equipment from "../models/Equipment.js";
import { getRankedRecommendations } from "../services/allocationService.js";

/**
 * POST /api/allocate — any logged-in user (PM or admin).
 * Just computes and stores a ranked shortlist. Does NOT reserve
 * anything — reservation only happens when an admin approves.
 */
export async function requestAllocation(req, res) {
  try {
    const requirement = req.body;
    const results = await getRankedRecommendations(requirement);

    const allocationRequest = await AllocationRequest.create({
      requestedBy: req.user.id,
      equipmentType: requirement.equipmentType,
      projectLocation: requirement.projectLocation,
      projectCoordinates: requirement.projectCoordinates,
      requiredFrom: requirement.requiredFrom,
      requiredTo: requirement.requiredTo,
      maxTransferDistanceKm: requirement.maxTransferDistanceKm,
      notes: requirement.notes,
      rankedResults: results.map((r) => ({
        equipmentId: r.equipment._id,
        rank: r.rank,
        allocationScore: r.allocationScore,
        transferDistanceKm: r.transferDistanceKm,
        transferCost: r.transferCost,
        scoreBreakdown: r.scoreBreakdown,
      })),
    });

    res.status(201).json({ requestId: allocationRequest._id, results });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate recommendations.", error: err.message });
  }
}

/**
 * GET /api/allocate/:requestId — view-only. Used by both the PM
 * who submitted it (to see status) and by the admin approval page.
 */
export async function getAllocationResults(req, res) {
  try {
    const request = await AllocationRequest.findById(req.params.requestId).lean();
    if (!request) return res.status(404).json({ message: "Allocation request not found." });

    const equipmentIds = request.rankedResults.map((r) => r.equipmentId);
    const equipmentDocs = await Equipment.find({ _id: { $in: equipmentIds } }).lean();
    const equipmentMap = Object.fromEntries(equipmentDocs.map((eq) => [eq._id.toString(), eq]));

    const results = request.rankedResults
      .map((r) => ({
        rank: r.rank,
        equipment: equipmentMap[r.equipmentId.toString()],
        allocationScore: r.allocationScore,
        transferDistanceKm: r.transferDistanceKm,
        transferCost: r.transferCost,
        scoreBreakdown: r.scoreBreakdown,
      }))
      .filter((r) => r.equipment);

    res.json({
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
    res.status(500).json({ message: "Failed to fetch allocation results.", error: err.message });
  }
}

/**
 * GET /api/allocate/admin/pending — admin only. Every pending
 * request across every project manager, with full ranked results,
 * for the Approvals page.
 */
export async function listPendingAllocations(req, res) {
  try {
    const requests = await AllocationRequest.find({ status: "pending" })
      .populate("requestedBy", "name companyName")
      .sort({ createdAt: 1 })
      .lean();

    const allEquipmentIds = requests.flatMap((r) => r.rankedResults.map((x) => x.equipmentId));
    const equipmentDocs = await Equipment.find({ _id: { $in: allEquipmentIds } }).lean();
    const equipmentMap = Object.fromEntries(equipmentDocs.map((eq) => [eq._id.toString(), eq]));

    const items = requests.map((r) => ({
      _id: r._id,
      requestedBy: r.requestedBy,
      equipmentType: r.equipmentType,
      projectLocation: r.projectLocation,
      requiredFrom: r.requiredFrom,
      requiredTo: r.requiredTo,
      createdAt: r.createdAt,
      rankedResults: r.rankedResults
        .map((x) => ({
          equipmentId: x.equipmentId,
          rank: x.rank,
          allocationScore: x.allocationScore,
          equipment: equipmentMap[x.equipmentId.toString()],
        }))
        .filter((x) => x.equipment),
    }));

    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: "Failed to load pending requests.", error: err.message });
  }
}

/**
 * POST /api/allocate/:requestId/approve — admin only.
 * Body: { equipmentId } — which ranked candidate to actually
 * allocate (admin can pick any from the ranked list, not just #1).
 * This is the only place equipment gets reserved for allocation.
 */
export async function approveAllocation(req, res) {
  try {
    const { requestId } = req.params;
    const { equipmentId } = req.body;

    const request = await AllocationRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Allocation request not found." });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request has already been reviewed." });
    }

    const chosen = request.rankedResults.find((r) => r.equipmentId.toString() === equipmentId);
    if (!chosen) {
      return res.status(400).json({ message: "That equipment was not part of this request's ranking." });
    }

    const reserved = await Equipment.findOneAndUpdate(
      { _id: equipmentId, availability: "available" },
      { availability: "in_use" }
    );
    if (!reserved) {
      return res.status(409).json({ message: "That machine is no longer available." });
    }

    request.allocatedEquipmentId = equipmentId;
    request.allocationScore = chosen.allocationScore;
    request.status = "active";
    await request.save();

    res.json({ allocation: request });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve allocation.", error: err.message });
  }
}

/**
 * POST /api/allocate/:requestId/reject — admin only.
 */
export async function rejectAllocation(req, res) {
  try {
    const request = await AllocationRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Allocation request not found." });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request has already been reviewed." });
    }

    request.status = "rejected";
    await request.save();

    res.json({ allocation: request });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject allocation.", error: err.message });
  }
}

/**
 * GET /api/allocate/history?page=&pageSize= — the requesting
 * user's own history (PM sees their own; admin could reuse this
 * per-user too, but the Approvals page is admin's real view).
 */
export async function getAllocationHistory(req, res) {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const query = { requestedBy: req.user.id };

    const [requests, totalCount] = await Promise.all([
      AllocationRequest.find(query)
        .populate("allocatedEquipmentId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize)),
      AllocationRequest.countDocuments(query),
    ]);

    const items = requests.map((r) => ({
      _id: r._id,
      equipmentType: r.equipmentType,
      projectLocation: r.projectLocation,
      allocatedEquipmentName: r.allocatedEquipmentId?.name || null,
      allocationScore: r.allocationScore,
      status: r.status,
      createdAt: r.createdAt,
    }));

    res.json({ items, totalCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch allocation history.", error: err.message });
  }
}