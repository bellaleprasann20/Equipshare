import api from "./api";

/**
 * Analytics-related API calls. Matches routes expected in
 * backend/src/routes/analyticsRoutes.js:
 *   GET /analytics/dashboard        -> manager dashboard summary
 *   GET /analytics/admin-summary    -> fleet-wide admin summary
 *   GET /analytics/utilization-trend
 *   GET /analytics/baseline-comparison
 *   POST /analytics/reports         { type, rangeDays } -> { downloadUrl }
 */
export async function fetchDashboardSummary() {
  const { data } = await api.get("/analytics/dashboard");
  return data;
}

export async function fetchAdminSummary() {
  const { data } = await api.get("/analytics/admin-summary");
  return data;
}

export async function fetchUtilizationTrend() {
  const { data } = await api.get("/analytics/utilization-trend");
  return data.trend;
}

export async function fetchBaselineComparison() {
  const { data } = await api.get("/analytics/baseline-comparison");
  return data.comparison;
}

export async function requestReport({ type, rangeDays }) {
  const { data } = await api.post("/analytics/reports", { type, rangeDays });
  return data; // { downloadUrl }
}
