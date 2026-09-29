import { useCallback, useState } from "react";
import {
  fetchEquipmentList,
  fetchEquipmentById,
  createEquipmentRequest,
  updateEquipmentRequest,
  deleteEquipmentRequest,
  submitReviewRequest,
  checkCanReview,
} from "../services/equipmentService";

/**
 * Hook wrapping equipmentService — used by EquipmentList,
 * EquipmentDetails, AddEquipment, EditEquipment pages.
 *
 * `canReview` is a lightweight local cache so EquipmentDetails
 * doesn't need to re-fetch on every render — call
 * `checkReviewEligibility(id)` once when the page loads, then
 * read `canReview(id)` synchronously in the render.
 *
 * Usage:
 *   const { fetchEquipment, getById, createEquipment,
 *           updateEquipment, deleteEquipment, submitReview,
 *           checkReviewEligibility, canReview } = useEquipment();
 */
export function useEquipment() {
  const [reviewEligibility, setReviewEligibility] = useState({});

  const fetchEquipment = useCallback(({ filters, page, pageSize }) => {
    return fetchEquipmentList({ filters, page, pageSize });
  }, []);

  const getById = useCallback((id) => fetchEquipmentById(id), []);

  const createEquipment = useCallback((payload) => createEquipmentRequest(payload), []);

  const updateEquipment = useCallback((id, payload) => updateEquipmentRequest(id, payload), []);

  const deleteEquipment = useCallback((id) => deleteEquipmentRequest(id), []);

  const submitReview = useCallback((payload) => submitReviewRequest(payload), []);

  const checkReviewEligibility = useCallback(async (id) => {
    const eligible = await checkCanReview(id);
    setReviewEligibility((prev) => ({ ...prev, [id]: eligible }));
    return eligible;
  }, []);

  const canReview = useCallback((id) => !!reviewEligibility[id], [reviewEligibility]);

  return {
    fetchEquipment,
    getById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    submitReview,
    checkReviewEligibility,
    canReview,
  };
}
