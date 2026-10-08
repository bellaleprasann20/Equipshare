import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAnalytics } from "../../hooks/useAnalytics";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Clock3,
  Gauge,
  Package,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { getDashboardSummary } = useAnalytics();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const response = await getDashboardSummary();

        if (!mounted) return;

        setSummary(response || {});
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [getDashboardSummary]);

  const activeAllocations = Number(summary?.activeAllocations || 0);
  const pendingRequests = Number(summary?.pendingRequests || 0);
  const avgEEI = Number(summary?.avgEEI || 0);

  const utilizationData = useMemo(() => {
    const data = Array.isArray(summary?.utilizationByEquipment)
      ? summary.utilizationByEquipment
      : [];

    return data
      .map((item) => {
        const operating = Number(item?.operatingHours || 0);
        const idle = Number(item?.idleHours || 0);

        const utilization =
          item?.utilization !== undefined
            ? Number(item.utilization)
            : operating + idle > 0
            ? (operating / (operating + idle)) * 100
            : 0;

        return {
          id: item?._id || item?.equipmentId || item?.id,
          name: item?.name || "Equipment",
          utilization: Math.max(0, Math.min(100, utilization)),
        };
      })
      .filter((item) => item.name)
      .slice(0, 8);
  }, [summary]);

  const recentActivity = Array.isArray(summary?.recentActivity)
    ? summary.recentActivity
    : [];

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Manager";

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#161618]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161618] text-white">
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <section className="border-b border-[#2a2a2d] pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a78bfa]">
            Project Manager Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back, {displayName}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Monitor your equipment allocations, project activity, and fleet
            performance from one workspace.
          </p>
        </section>

        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* =====================================================
            WORKSPACE OVERVIEW
        ====================================================== */}
        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">
              Workspace overview
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Current status from your equipment and allocation activity.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <OverviewCard
              label="Active Allocations"
              value={activeAllocations}
              description="Machines currently assigned to your projects."
              icon={Package}
              iconClass="bg-[#8b5cf6]/10 text-[#a78bfa]"
            />

            <OverviewCard
              label="Pending Allocations"
              value={pendingRequests}
              description="Allocation requests currently awaiting action."
              icon={Clock3}
              iconClass="bg-amber-500/10 text-amber-400"
            />

            <OverviewCard
              label="Average Fleet EEI"
              value={avgEEI}
              suffix="/100"
              description={getEEIDescription(avgEEI)}
              icon={Gauge}
              iconClass="bg-blue-500/10 text-blue-400"
            />
          </div>
        </section>

        {/* =====================================================
            UTILIZATION
        ====================================================== */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
              Performance
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Equipment utilization
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Utilization performance for equipment associated with your
              workspace.
            </p>
          </div>

          <div className="border border-[#2a2a2d] bg-[#1c1c1f] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#a78bfa]" />

                  <h3 className="text-sm font-semibold text-white">
                    Fleet utilization
                  </h3>
                </div>

                <p className="mt-1 text-xs text-zinc-600">
                  Operating hours compared with available idle hours.
                </p>
              </div>

              <span className="text-[10px] text-zinc-600">0–100%</span>
            </div>

            {utilizationData.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No utilization data"
                description="Equipment utilization data will appear here once fleet activity is available."
              />
            ) : (
              <div className="space-y-4">
                {utilizationData.map((item) => (
                  <div key={item.id || item.name}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="truncate text-xs text-zinc-400">
                        {item.name}
                      </span>

                      <span className="shrink-0 text-xs font-semibold text-white">
                        {Math.round(item.utilization)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden bg-[#29292d]">
                      <div
                        className="h-full bg-[#7c3aed] transition-all"
                        style={{
                          width: `${item.utilization}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            RECENT ACTIVITY
        ====================================================== */}
        <section className="mt-8 border-t border-[#2a2a2d] pt-8">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
              Activity
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Recent activity
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Recent allocation and order activity associated with your
              workspace.
            </p>
          </div>

          <div className="border border-[#2a2a2d] bg-[#1c1c1f]">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-10">
                <EmptyState
                  icon={Activity}
                  title="No recent activity"
                  description="Your allocation and order activity will appear here after you start using the fleet."
                />
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2d]">
                {recentActivity.map((activity, index) => (
                  <ActivityRow
                    key={activity?._id || index}
                    activity={activity}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* =============================================================
   OVERVIEW CARD
============================================================= */

function OverviewCard({
  label,
  value,
  suffix = "",
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="border border-[#2a2a2d] bg-[#1c1c1f] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            {label}
          </p>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{value}</span>

            {suffix && (
              <span className="text-sm text-zinc-500">{suffix}</span>
            )}
          </div>

          <p className="mt-2 text-xs leading-5 text-zinc-600">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   ACTIVITY ROW
============================================================= */

function ActivityRow({ activity }) {
  const date = activity?.createdAt
    ? new Date(activity.createdAt).toLocaleString()
    : "";

  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[#8b5cf6]/10">
        <Activity className="h-4 w-4 text-[#a78bfa]" />
      </div>

      <div className="min-w-0">
        <p className="text-sm text-zinc-300">
          {activity?.message || "Workspace activity recorded."}
        </p>

        {date && (
          <p className="mt-1 text-xs text-zinc-600">{date}</p>
        )}
      </div>
    </div>
  );
}

/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center bg-[#8b5cf6]/10">
        <Icon className="h-5 w-5 text-[#a78bfa]" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-zinc-300">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-xs leading-5 text-zinc-600">
        {description}
      </p>
    </div>
  );
}

/* =============================================================
   EEI DESCRIPTION
============================================================= */

function getEEIDescription(score) {
  if (score >= 80) return "Fleet performance is excellent.";
  if (score >= 65) return "Fleet performance is good.";
  if (score >= 50) return "Fleet performance is moderate.";
  return "Fleet performance needs attention.";
}