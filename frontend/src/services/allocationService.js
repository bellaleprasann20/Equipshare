import api from "./api";

/**
 * Frontend allocation API calls. Matches routes expected in
 * backend/src/routes/allocationRoutes.js:
 *   POST /allocate                     { equipmentType, projectLocation, requiredFrom,
 *                                         requiredTo, maxTransferDistanceKm, notes }
 *                                       -> { requestId, results }
 *   GET  /allocate/:requestId          -> { requirement, results }
 *   POST /allocate/:requestId/confirm  { equipmentId } -> AllocationRecord
 *   GET  /allocate/history             ?page=&pageSize= -> { items, totalCount }
 *
 * NOTE: this file only calls the API — the actual EEI +
 * ranking math lives in backend/src/services/allocationService.js
 * (same name, different layer — don't confuse the two).
 */
export async function requestRecommendations(requirement) {
  const { data } = await api.post("/allocate", requirement);
  return data; // { requestId, results }
}

export async function fetchRecommendationsByRequestId(requestId) {
  const { data } = await api.get(`/allocate/${requestId}`);
  return data; // { requirement, results }
}

export async function confirmAllocationRequest({ requestId, equipmentId }) {
  const { data } = await api.post(`/allocate/${requestId}/confirm`, { equipmentId });
  return data.allocation;
}

export async function fetchAllocationHistory({ page = 1, pageSize = 10 }) {
  const { data } = await api.get("/allocate/history", { params: { page, pageSize } });
  return data; // { items, totalCount }
}
