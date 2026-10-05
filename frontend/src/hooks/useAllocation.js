import { useCallback } from "react";
import {
  requestRecommendations,
  fetchRecommendationsByRequestId,
  fetchAllocationHistory,
  fetchPendingAllocations,
  approveAllocationRequest,
  rejectAllocationRequest,
} from "../services/allocationService";

export function useAllocation() {
  const getRecommendations = useCallback((requirement) => requestRecommendations(requirement), []);
  const getResultsByRequestId = useCallback((requestId) => fetchRecommendationsByRequestId(requestId), []);
  const fetchHistory = useCallback(({ page, pageSize }) => fetchAllocationHistory({ page, pageSize }), []);

  const getPendingAllocations = useCallback(() => fetchPendingAllocations(), []);
  const approveAllocation = useCallback(
    ({ requestId, equipmentId }) => approveAllocationRequest({ requestId, equipmentId }),
    []
  );
  const rejectAllocation = useCallback((requestId) => rejectAllocationRequest(requestId), []);

  return {
    getRecommendations,
    getResultsByRequestId,
    fetchHistory,
    getPendingAllocations,
    approveAllocation,
    rejectAllocation,
  };
}