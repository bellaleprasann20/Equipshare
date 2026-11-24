import Equipment from "../models/Equipment.js";
import RentalHistory from "../models/RentalHistory.js";
import { calculateEEI, computeFleetCostRange } from "../services/eeiCalculator.js";

/**
 * GET /api/equipment?search=&type=&location=&availability=&page=&pageSize=
 */
export async function listEquipment(req, res) {
  try {
    const { search = "", type, location, availability, page = 1, pageSize = 10 } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: "i" };
    if (availability) query.availability = availability;

    const skip = (Number(page) - 1) * Number(pageSize);

    const [items, totalCount] = await Promise.all([
      Equipment.find(query).skip(skip).limit(Number(pageSize)).sort({ createdAt: -1 }),
      Equipment.countDocuments(query),
    ]);

    // Attach live EEI scores (cheap enough to compute on read for
    // this project's scale — see note in server.js about a
    // scheduled recompute job for a larger fleet)
    const allForCostRange = await Equipment.find({}).lean();
    const fleetCostRange = computeFleetCostRange(allForCostRange);
    const itemsWithEEI = items.map((eq) => {
      const { score } = calculateEEI(eq, fleetCostRange);
      return { ...eq.toObject(), eeiScore: score };
    });

    res.json({ items: itemsWithEEI, totalCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch equipment.", error: err.message });
  }
}

/**
 * GET /api/equipment/:id
 */
export async function getEquipmentById(req, res) {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found." });

    const allForCostRange = await Equipment.find({}).lean();
    const fleetCostRange = computeFleetCostRange(allForCostRange);
    const { score, breakdown } = calculateEEI(equipment, fleetCostRange);

    res.json({ equipment: { ...equipment.toObject(), eeiScore: score, eeiBreakdown: breakdown } });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch equipment.", error: err.message });
  }
}

/**
 * POST /api/equipment  (admin only — see roleMiddleware)
 */
export async function createEquipment(req, res) {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json({ equipment });
  } catch (err) {
    res.status(400).json({ message: "Failed to create equipment.", error: err.message });
  }
}

/**
 * PUT /api/equipment/:id  (admin only)
 */
export async function updateEquipment(req, res) {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!equipment) return res.status(404).json({ message: "Equipment not found." });
    res.json({ equipment });
  } catch (err) {
    res.status(400).json({ message: "Failed to update equipment.", error: err.message });
  }
}

/**
 * DELETE /api/equipment/:id  (admin only)
 */
export async function deleteEquipment(req, res) {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found." });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete equipment.", error: err.message });
  }
}

/**
 * POST /api/equipment/:id/reviews
 * Body: { rating, comment }
 * Guarded by the same eligibility check as GET can-review below —
 * only users with a completed RentalHistory entry for this
 * equipment may review it (Phase-1 proposal requirement).
 */
export async function submitReview(req, res) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const hasRented = await RentalHistory.exists({
      equipmentId: id,
      rentedBy: req.user.id,
      status: "completed",
    });
    if (!hasRented) {
      return res.status(403).json({ message: "Only verified renters can review this equipment." });
    }

    const equipment = await Equipment.findById(id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found." });

    equipment.reviews.push({
      reviewerId: req.user.id,
      reviewerName: req.user.name,
      rating,
      comment,
    });
    await equipment.save();

    res.status(201).json({ equipment });
  } catch (err) {
    res.status(400).json({ message: "Failed to submit review.", error: err.message });
  }
}

/**
 * GET /api/equipment/:id/can-review
 */
export async function canReview(req, res) {
  try {
    const hasRented = await RentalHistory.exists({
      equipmentId: req.params.id,
      rentedBy: req.user.id,
      status: "completed",
    });
    res.json({ canReview: !!hasRented });
  } catch (err) {
    res.status(500).json({ message: "Failed to check review eligibility.", error: err.message });
  }
}