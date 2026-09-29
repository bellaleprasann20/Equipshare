import { useCallback } from "react";
import {
  requestRecommendations,
  fetchRecommendationsByRequestId,
  confirmAllocationRequest,
  fetchAllocationHistory,
} from "../services/allocationService";

/**
 * Hook wrapping the allocation API — used by CreateRequirement,
 * Recommendations, AllocationHistory pages.
 *
 * Usage:
 *   const { getRecommendations, getResultsByRequestId,
 *           confirmAllocation, fetchHistory } = useAllocation();
 */
export function useAllocation() {
  const getRecommendations = useCallback((requirement) => {
    return requestRecommendations(requirement);
  }, []);

  const getResultsByRequestId = useCallback((requestId) => {
    return fetchRecommendationsByRequestId(requestId);
  }, []);

  const confirmAllocation = useCallback(({ requestId, equipmentId }) => {
    return confirmAllocationRequest({ requestId, equipmentId });
  }, []);

  const fetchHistory = useCallback(({ page, pageSize }) => {
    return fetchAllocationHistory({ page, pageSize });
  }, []);

  return { getRecommendations, getResultsByRequestId, confirmAllocation, fetchHistory };
}
