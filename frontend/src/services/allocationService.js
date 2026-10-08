import api from "./api";

export async function requestRecommendations(requirement) {
  const { data } = await api.post(
    "/allocate",
    requirement
  );

  return data;
}

export async function fetchRecommendationsByRequestId(
  requestId
) {
  const { data } = await api.get(
    `/allocate/${requestId}`
  );

  return data;
}

export async function fetchAllocationHistory({
  page = 1,
  pageSize = 10,
}) {
  const { data } = await api.get(
    "/allocate/history",
    {
      params: {
        page,
        pageSize,
      },
    }
  );

  return data;
}

// Admin-only
export async function fetchPendingAllocations() {
  const { data } = await api.get(
    "/allocate/admin/pending"
  );

  return data.items;
}

export async function approveAllocationRequest({
  requestId,
  equipmentId,
}) {
  const { data } = await api.post(
    `/allocate/${requestId}/approve`,
    { equipmentId }
  );

  return data.allocation;
}

export async function rejectAllocationRequest(
  requestId
) {
  const { data } = await api.post(
    `/allocate/${requestId}/reject`
  );

  return data.allocation;
}