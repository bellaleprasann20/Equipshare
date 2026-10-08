import api from "./api";

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
  return data?.trend || [];
}

export async function fetchBaselineComparison() {
  const { data } = await api.get("/analytics/baseline-comparison");
  return data?.comparison || [];
}

export async function requestReport({ type, rangeDays }) {
  const { data } = await api.post("/analytics/reports", {
    type,
    rangeDays: Number(rangeDays),
  });

  if (!data?.downloadUrl) {
    throw new Error("Report was generated but no download link was returned.");
  }

  return data;
}