import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UtilizationChart from "../../components/analytics/UtilizationChart";
import EquipmentTable from "../../components/equipment/EquipmentTable";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAnalytics } from "../../hooks/useAnalytics";

/**
 * Admin-only fleet-wide overview — beyond a single manager's
 * view, this shows the whole fleet's health: lowest-EEI
 * equipment (needs attention), overdue maintenance count, and
 * fleet-wide utilization comparison. Expects useAnalytics() to
 * expose:
 *   getAdminSummary() -> {
 *     totalEquipment, overdueMaintenance, avgUtilization,
 *     lowestPerformingEquipment: [...equipment rows...],
 *     fleetUtilization: [{ label, utilization, idle }]
 *   }
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { getAdminSummary } = useAnalytics();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminSummary()
      .then(setSummary)
      .catch((err) => setError(err?.response?.data?.message || "Failed to load admin dashboard."))
      .finally(() => setLoading(false));
  }, [getAdminSummary]);

  if (loading) return <Loader label="Loading fleet overview..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900">Fleet Overview (Admin)</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Equipment" value={summary?.totalEquipment ?? 0} icon="🏗️" />
        <StatCard
          label="Overdue Maintenance"
          value={summary?.overdueMaintenance ?? 0}
          icon="🔧"
          alert={summary?.overdueMaintenance > 0}
        />
        <StatCard label="Avg. Utilization" value={`${summary?.avgUtilization ?? 0}%`} icon="📊" />
      </div>

      <UtilizationChart data={summary?.fleetUtilization || []} title="Fleet-wide Utilization" />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Lowest Performing Equipment (needs attention)
        </h2>
        <EquipmentTable
          data={summary?.lowestPerformingEquipment || []}
          onRowClick={(eq) => navigate(`/equipment/${eq._id}`)}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, alert = false }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${
        alert ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-lg font-semibold ${alert ? "text-red-700" : "text-gray-900"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
