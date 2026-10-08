import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UtilizationChart from "../../components/analytics/UtilizationChart";
import EquipmentTable from "../../components/equipment/EquipmentTable";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import { useAnalytics } from "../../hooks/useAnalytics";

function Icon({ type }) {
  const icons = {
    equipment: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="M7 5V3h10v2M7 10h10M7 14h6" />
      </>
    ),
    maintenance: (
      <>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17a2 2 0 0 0 2.8 2.8l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2.8-2.8 2.7-2.7Z" />
      </>
    ),
    utilization: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[type]}
    </svg>
  );
}

function StatCard({ label, value, description, alert, icon }) {
  return (
    <div
      className={[
        "border p-5 transition-colors",
        alert
          ? "border-red-900/50 bg-red-950/20"
          : "border-[#2a2a2d] bg-[#1c1c1f]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {label}
          </p>

          <p
            className={[
              "mt-3 font-mono text-3xl font-semibold",
              alert ? "text-red-400" : "text-white",
            ].join(" ")}
          >
            {value}
          </p>
        </div>

        <span
          className={[
            "flex h-10 w-10 items-center justify-center",
            alert
              ? "bg-red-500/10 text-red-400"
              : "bg-[#8b5cf6]/10 text-[#a78bfa]",
          ].join(" ")}
        >
          <Icon type={icon} />
        </span>
      </div>

      {description && (
        <p className="mt-3 text-xs leading-5 text-gray-500">{description}</p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { getAdminSummary } = useAnalytics();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getAdminSummary()
      .then((data) => {
        if (mounted) {
          setSummary(data);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load admin dashboard."
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [getAdminSummary]);

  if (loading) {
    return <Loader label="Loading fleet overview..." />;
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const totalEquipment = summary?.totalEquipment ?? 0;
  const overdueMaintenance = summary?.overdueMaintenance ?? 0;
  const avgUtilization = summary?.avgUtilization ?? 0;
  const lowestPerformingEquipment =
    summary?.lowestPerformingEquipment || [];
  const fleetUtilization = summary?.fleetUtilization || [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 border-b border-[#2a2a2d] pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
            Administration
          </p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Fleet Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Monitor fleet health, equipment utilization, and maintenance
            performance across the entire EquipShare network.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/equipment")}
          >
            Manage Equipment
          </Button>

          <Button
            size="sm"
            onClick={() => navigate("/admin/approvals")}
          >
            Review Requests
          </Button>
        </div>
      </section>

      {/* KPI Cards */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold text-white">
            Fleet health
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current operational indicators from your fleet data.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Equipment"
            value={totalEquipment}
            description="Equipment currently registered in the system."
            icon="equipment"
          />

          <StatCard
            label="Overdue Maintenance"
            value={overdueMaintenance}
            description={
              overdueMaintenance > 0
                ? "Equipment requires maintenance attention."
                : "No overdue maintenance currently reported."
            }
            icon="maintenance"
            alert={overdueMaintenance > 0}
          />

          <StatCard
            label="Average Utilization"
            value={`${avgUtilization}%`}
            description="Fleet-wide utilization based on the current analytics period."
            icon="utilization"
          />
        </div>
      </section>

      {/* Fleet Utilization */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
              Performance
            </p>

            <h2 className="mt-1 font-display text-2xl font-bold text-white">
              Fleet utilization
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Compare utilization and idle capacity across the fleet.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/reports")}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-white"
          >
            View analytics
            <Icon type="arrow" />
          </button>
        </div>

        <div className="border border-[#2a2a2d] bg-[#1c1c1f] p-4 sm:p-6">
          <UtilizationChart
            data={fleetUtilization}
            title="Fleet-wide Utilization"
          />
        </div>
      </section>

      {/* Attention Required */}
      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
              Equipment performance
            </p>

            <h2 className="mt-1 font-display text-2xl font-bold text-white">
              Equipment needing attention
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Lowest-performing equipment based on your existing EEI data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/equipment")}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-white"
          >
            Open inventory
            <Icon type="arrow" />
          </button>
        </div>

        <div className="overflow-hidden border border-[#2a2a2d] bg-[#1c1c1f]">
          {lowestPerformingEquipment.length > 0 ? (
            <EquipmentTable
              data={lowestPerformingEquipment}
              onRowClick={(eq) =>
  navigate(`/admin/equipment/${eq._id}`)
}
            />
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-gray-300">
                No equipment performance data available.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Equipment will appear here once performance data is available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Admin Actions */}
      <section className="border-t border-[#2a2a2d] pt-7">
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-white">
            Operations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Quickly access the areas you manage most often.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/admin/equipment")}
            className="group flex items-center justify-between border border-[#2a2a2d] bg-[#1c1c1f] p-4 text-left transition-colors hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                Equipment Inventory
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Manage your fleet.
              </p>
            </div>

            <Icon type="arrow" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/approvals")}
            className="group flex items-center justify-between border border-[#2a2a2d] bg-[#1c1c1f] p-4 text-left transition-colors hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                Approval Queue
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Review equipment requests.
              </p>
            </div>

            <Icon type="arrow" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/reports")}
            className="group flex items-center justify-between border border-[#2a2a2d] bg-[#1c1c1f] p-4 text-left transition-colors hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                Analytics & Reports
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Analyze fleet performance.
              </p>
            </div>

            <Icon type="arrow" />
          </button>
        </div>
      </section>
    </div>
  );
}