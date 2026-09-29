import api from "./api";

/**
 * Equipment-related API calls. Matches routes expected in
 * backend/src/routes/equipmentRoutes.js:
 *   GET    /equipment              ?search=&type=&location=&availability=&page=&pageSize=
 *   GET    /equipment/:id
 *   POST   /equipment
 *   PUT    /equipment/:id
 *   DELETE /equipment/:id
 *   POST   /equipment/:id/reviews
 *   GET    /equipment/:id/can-review
 */
export async function fetchEquipmentList({ filters = {}, page = 1, pageSize = 10 }) {
  const { data } = await api.get("/equipment", {
    params: { ...filters, page, pageSize },
  });
  return data; // { items, totalCount }
}

export async function fetchEquipmentById(id) {
  const { data } = await api.get(`/equipment/${id}`);
  return data.equipment;
}

export async function createEquipmentRequest(payload) {
  const { data } = await api.post("/equipment", payload);
  return data.equipment;
}

export async function updateEquipmentRequest(id, payload) {
  const { data } = await api.put(`/equipment/${id}`, payload);
  return data.equipment;
}

export async function deleteEquipmentRequest(id) {
  await api.delete(`/equipment/${id}`);
}

export async function submitReviewRequest(payload) {
  const { data } = await api.post(`/equipment/${payload.equipmentId}/reviews`, payload);
  return data.equipment; // updated equipment with new review included
}

export async function checkCanReview(equipmentId) {
  const { data } = await api.get(`/equipment/${equipmentId}/can-review`);
  return data.canReview; // boolean
}
