import { useCallback } from "react";
import {
  fetchDashboardSummary,
  fetchAdminSummary,
  fetchUtilizationTrend,
  fetchBaselineComparison,
  requestReport,
} from "../services/analyticsService";

/**
 * Hook wrapping analyticsService — used by Dashboard,
 * AdminDashboard, Analytics, and Reports pages.
 *
 * Usage:
 *   const { getDashboardSummary, getAdminSummary, getUtilizationTrend,
 *           getBaselineComparison, generateReport } = useAnalytics();
 */
export function useAnalytics() {
  const getDashboardSummary = useCallback(() => fetchDashboardSummary(), []);

  const getAdminSummary = useCallback(() => fetchAdminSummary(), []);

  const getUtilizationTrend = useCallback(() => fetchUtilizationTrend(), []);

  const getBaselineComparison = useCallback(() => fetchBaselineComparison(), []);

  const generateReport = useCallback(({ type, rangeDays }) => {
    return requestReport({ type, rangeDays });
  }, []);

  return {
    getDashboardSummary,
    getAdminSummary,
    getUtilizationTrend,
    getBaselineComparison,
    generateReport,
  };
}
