import AllocationRequest from "../models/AllocationRequest.js";
import Equipment from "../models/Equipment.js";
import { getRankedRecommendations } from "../services/allocationService.js";

/**
 * POST /api/allocate
 * Body: { equipmentType, projectLocation, projectCoordinates?,
 *         requiredFrom, requiredTo, maxTransferDistanceKm?, notes? }
 *
 * This is the endpoint that runs the actual ranking algorithm
 * and is the one CreateRequirement.jsx submits to.
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
 * GET /api/allocate/:requestId
 * Re-hydrates the ranked results with full equipment details for
 * display (the ranked snapshot only stores equipmentId + scores).
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
      .filter((r) => r.equipment); // in case equipment was deleted since

    res.json({
      requirement: {
        equipmentType: request.equipmentType,
        projectLocation: request.projectLocation,
        requiredFrom: request.requiredFrom,
        requiredTo: request.requiredTo,
      },
      results,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch allocation results.", error: err.message });
  }
}

/**
 * POST /api/allocate/:requestId/confirm
 * Body: { equipmentId }
 * Confirms the user's chosen equipment (usually the top-ranked
 * one, but they may pick another from the list) and marks that
 * equipment as in_use.
 */
export async function confirmAllocation(req, res) {
  try {
    const { requestId } = req.params;
    const { equipmentId } = req.body;

    const request = await AllocationRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Allocation request not found." });

    const chosen = request.rankedResults.find((r) => r.equipmentId.toString() === equipmentId);
    if (!chosen) {
      return res.status(400).json({ message: "That equipment was not part of this recommendation." });
    }

    request.allocatedEquipmentId = equipmentId;
    request.allocationScore = chosen.allocationScore;
    request.status = "active";
    await request.save();

    await Equipment.findByIdAndUpdate(equipmentId, { availability: "in_use" });

    res.json({ allocation: request });
  } catch (err) {
    res.status(500).json({ message: "Failed to confirm allocation.", error: err.message });
  }
}

/**
 * GET /api/allocate/history?page=&pageSize=
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