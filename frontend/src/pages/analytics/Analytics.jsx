import React, { useEffect, useState } from "react";
import UtilizationChart from "../../components/analytics/UtilizationChart";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAnalytics } from "../../hooks/useAnalytics";

/**
 * Detailed analytics page — utilization trend over time, cost
 * analytics, and allocation-method performance (your method vs
 * baselines). This page doubles as a live view of the same
 * data that goes into the research paper's evaluation section.
 *
 * Expects useAnalytics() to expose:
 *   getUtilizationTrend() -> [{ label, utilization, idle }]  // by week/month
 *   getBaselineComparison() -> [{ label, utilization, idle }] // your method vs baselines
 */
export default function Analytics() {
  const { getUtilizationTrend, getBaselineComparison } = useAnalytics();

  const [trend, setTrend] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getUtilizationTrend(), getBaselineComparison()])
      .then(([trendData, comparisonData]) => {
        setTrend(trendData);
        setComparison(comparisonData);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [getUtilizationTrend, getBaselineComparison]);

  if (loading) return <Loader label="Loading analytics..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>

      <UtilizationChart data={trend} title="Utilization Trend (last 8 weeks)" />

      <UtilizationChart
        data={comparison}
        title="Your Ranking Method vs Baseline Allocation Strategies"
      />
    </div>
  );
}
