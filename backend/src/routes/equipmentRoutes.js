import express from "express";
import {
  listEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  submitReview,
  canReview,
} from "../controllers/equipmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All equipment routes require login; create/update/delete are admin-only
router.get("/", protect, listEquipment);
router.get("/:id", protect, getEquipmentById);
router.post("/", protect, requireAdmin, createEquipment);
router.put("/:id", protect, requireAdmin, updateEquipment);
router.delete("/:id", protect, requireAdmin, deleteEquipment);

router.post("/:id/reviews", protect, submitReview);
router.get("/:id/can-review", protect, canReview);

export default router;