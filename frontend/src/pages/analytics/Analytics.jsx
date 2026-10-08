import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  Package,
  RefreshCw,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";

export default function Analytics() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setError("");

    try {
      const response = await api.get("/equipment");

      const payload = response?.data;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.equipment)
        ? payload.equipment
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.results)
        ? payload.results
        : [];

      setEquipment(list);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load fleet analytics."
      );
      setEquipment([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      try {
        await loadAnalytics();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [loadAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadAnalytics();
    } finally {
      setRefreshing(false);
    }
  };

  const metrics = useMemo(() => {
    const total = equipment.length;

    const available = equipment.filter(
      (item) => item?.availability === "available"
    ).length;

    const inUse = equipment.filter(
      (item) => item?.availability === "in_use"
    ).length;

    const sold = equipment.filter(
      (item) => item?.availability === "sold"
    ).length;

    const utilizationValues = equipment
      .map((item) => {
        const operating = Number(item?.operatingHoursLast30Days || 0);
        const idle = Number(item?.idleHoursLast30Days || 0);
        const totalHours = operating + idle;

        if (totalHours <= 0) return null;

        return (operating / totalHours) * 100;
      })
      .filter((value) => value !== null);

    const fleetUtilization =
      utilizationValues.length > 0
        ? utilizationValues.reduce((sum, value) => sum + value, 0) /
          utilizationValues.length
        : 0;

    const eeiValues = equipment
      .map((item) => Number(item?.eeiScore))
      .filter((value) => Number.isFinite(value));

    const averageEEI =
      eeiValues.length > 0
        ? eeiValues.reduce((sum, value) => sum + value, 0) /
          eeiValues.length
        : 0;

    const operatingCosts = equipment
      .map((item) => Number(item?.operatingCostPerDay))
      .filter((value) => Number.isFinite(value) && value >= 0);

    const averageOperatingCost =
      operatingCosts.length > 0
        ? operatingCosts.reduce((sum, value) => sum + value, 0) /
          operatingCosts.length
        : 0;

    const maintenanceDue = equipment.filter((item) =>
      isMaintenanceDue(item)
    ).length;

    const breakdowns = equipment.reduce(
      (sum, item) => sum + Number(item?.breakdownCount || 0),
      0
    );

    return {
      total,
      available,
      inUse,
      sold,
      fleetUtilization,
      averageEEI,
      averageOperatingCost,
      maintenanceDue,
      breakdowns,
    };
  }, [equipment]);

  const typeDistribution = useMemo(() => {
    const map = new Map();

    equipment.forEach((item) => {
      const type = item?.type || "unknown";

      map.set(type, (map.get(type) || 0) + 1);
    });

    return [...map.entries()]
      .map(([type, count]) => ({
        type,
        count,
        percentage:
          equipment.length > 0 ? (count / equipment.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [equipment]);

  const locationDistribution = useMemo(() => {
    const map = new Map();

    equipment.forEach((item) => {
      const location = item?.location || "Unknown location";

      map.set(location, (map.get(location) || 0) + 1);
    });

    return [...map.entries()]
      .map(([location, count]) => ({
        location,
        count,
        percentage:
          equipment.length > 0 ? (count / equipment.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [equipment]);

  const utilizationRanking = useMemo(() => {
    return equipment
      .map((item) => {
        const operating = Number(item?.operatingHoursLast30Days || 0);
        const idle = Number(item?.idleHoursLast30Days || 0);
        const totalHours = operating + idle;

        const utilization =
          totalHours > 0 ? (operating / totalHours) * 100 : 0;

        return {
          id: item?._id || item?.id || item?.name,
          name: item?.name || "Unnamed equipment",
          type: item?.type || "unknown",
          utilization,
          operating,
          idle,
        };
      })
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 8);
  }, [equipment]);

  const eeiRanking = useMemo(() => {
    return equipment
      .map((item) => ({
        id: item?._id || item?.id || item?.name,
        name: item?.name || "Unnamed equipment",
        type: item?.type || "unknown",
        score: Number.isFinite(Number(item?.eeiScore))
          ? Number(item.eeiScore)
          : null,
      }))
      .filter((item) => item.score !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [equipment]);

  const maintenanceItems = useMemo(() => {
    return equipment
      .filter((item) => isMaintenanceDue(item))
      .map((item) => {
        const dueDate = getMaintenanceDueDate(item);

        return {
          id: item?._id || item?.id || item?.name,
          name: item?.name || "Unnamed equipment",
          location: item?.location || "Unknown location",
          dueDate,
          daysOverdue: dueDate
            ? Math.max(
                0,
                Math.ceil(
                  (Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                )
              )
            : 0,
        };
      })
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      })
      .slice(0, 6);
  }, [equipment]);

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
            ANALYTICS HEADER
        ====================================================== */}
        <section className="flex flex-col gap-5 border-b border-[#2a2a2d] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a78bfa]">
              Fleet Intelligence
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Analyze fleet composition, equipment efficiency, utilization,
              maintenance status, locations, and operating costs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 border border-[#2a2a2d] bg-[#1c1c1f] px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-[#8b5cf6]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </section>

        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* =====================================================
            FLEET HEALTH
        ====================================================== */}
        <section className="mt-7">
          <SectionHeading
            eyebrow="Fleet health"
            title="Current fleet condition"
            description="A high-level view of the physical fleet, availability, efficiency, and maintenance status."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Fleet Size"
              value={metrics.total}
              description="Total equipment records."
              icon={Package}
              iconClass="bg-[#8b5cf6]/10 text-[#a78bfa]"
            />

            <MetricCard
              label="Available"
              value={metrics.available}
              description={`${getPercentage(
                metrics.available,
                metrics.total
              )}% of fleet available.`}
              icon={CheckCircle2}
              iconClass="bg-green-500/10 text-green-400"
            />

            <MetricCard
              label="In Use"
              value={metrics.inUse}
              description={`${getPercentage(
                metrics.inUse,
                metrics.total
              )}% currently allocated.`}
              icon={Activity}
              iconClass="bg-blue-500/10 text-blue-400"
            />

            <MetricCard
              label="Maintenance Due"
              value={metrics.maintenanceDue}
              description="Equipment requiring service attention."
              icon={Wrench}
              iconClass="bg-amber-500/10 text-amber-400"
            />
          </div>
        </section>

        {/* =====================================================
            EFFICIENCY + OPERATING COST
        ====================================================== */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalyticsPanel
            icon={Gauge}
            title="Fleet efficiency"
            description="Utilization and Equipment Efficiency Index across the fleet."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <StatBlock
                label="Average Utilization"
                value={`${Math.round(metrics.fleetUtilization)}%`}
                icon={TrendingUp}
              />

              <StatBlock
                label="Average EEI"
                value={`${Math.round(metrics.averageEEI)}/100`}
                icon={Gauge}
              />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  Fleet utilization
                </span>

                <span className="text-xs font-semibold text-white">
                  {Math.round(metrics.fleetUtilization)}%
                </span>
              </div>

              <ProgressBar value={metrics.fleetUtilization} />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  Average EEI
                </span>

                <span className="text-xs font-semibold text-white">
                  {Math.round(metrics.averageEEI)}/100
                </span>
              </div>

              <ProgressBar value={metrics.averageEEI} />
            </div>
          </AnalyticsPanel>

          <AnalyticsPanel
            icon={CircleDollarSign}
            title="Operating cost"
            description="Average daily operating cost based on equipment records."
          >
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {formatCurrency(metrics.averageOperatingCost)}
              </span>

              <span className="mb-1 text-xs text-zinc-600">
                average / day
              </span>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <StatBlock
                label="Breakdowns"
                value={metrics.breakdowns}
                icon={AlertTriangle}
              />

              <StatBlock
                label="Sold"
                value={metrics.sold}
                icon={ShieldCheck}
              />
            </div>
          </AnalyticsPanel>
        </section>

        {/* =====================================================
            EQUIPMENT TYPE DISTRIBUTION
        ====================================================== */}
        <section className="mt-6">
          <AnalyticsPanel
            icon={BarChart3}
            title="Equipment by type"
            description="Distribution of equipment categories across the current fleet."
          >
            {typeDistribution.length === 0 ? (
              <EmptyAnalytics
                icon={Package}
                title="Equipment type data unavailable"
                description="No equipment records were returned by the equipment API."
              />
            ) : (
              <div className="space-y-5">
                {typeDistribution.map((item) => (
                  <div key={item.type}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium capitalize text-zinc-300">
                        {formatEquipmentType(item.type)}
                      </span>

                      <span className="text-xs text-zinc-500">
                        {item.count} · {Math.round(item.percentage)}%
                      </span>
                    </div>

                    <div className="h-2 bg-[#29292d]">
                      <div
                        className="h-full bg-[#7c3aed]"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsPanel>
        </section>

        {/* =====================================================
            LOCATION DISTRIBUTION
        ====================================================== */}
        <section className="mt-6">
          <AnalyticsPanel
            icon={Building2}
            title="Fleet by location"
            description="Where the current equipment fleet is positioned."
          >
            {locationDistribution.length === 0 ? (
              <EmptyAnalytics
                icon={Building2}
                title="Location data unavailable"
                description="No equipment location records were returned."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {locationDistribution.map((item) => (
                  <div
                    key={item.location}
                    className="border border-[#2a2a2d] bg-[#161618] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#8b5cf6]/10">
                          <Building2 className="h-4 w-4 text-[#a78bfa]" />
                        </div>

                        <span className="truncate text-sm text-zinc-300">
                          {item.location}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-white">
                        {item.count}
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 bg-[#29292d]">
                      <div
                        className="h-full bg-[#8b5cf6]"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsPanel>
        </section>

        {/* =====================================================
            UTILIZATION RANKING
        ====================================================== */}
        <section className="mt-6">
          <AnalyticsPanel
            icon={TrendingUp}
            title="Equipment utilization analysis"
            description="Highest-utilized equipment based on operating and idle hours from the last 30 days."
          >
            {utilizationRanking.length === 0 ? (
              <EmptyAnalytics
                icon={TrendingUp}
                title="Utilization data unavailable"
                description="Operating and idle hour data is not available for analysis."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-[#2a2a2d]">
                      <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        Equipment
                      </th>

                      <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        Type
                      </th>

                      <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        Operating
                      </th>

                      <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        Idle
                      </th>

                      <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        Utilization
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {utilizationRanking.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#2a2a2d] last:border-0"
                      >
                        <td className="px-3 py-4">
                          <span className="text-sm text-zinc-300">
                            {item.name}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-xs capitalize text-zinc-500">
                          {formatEquipmentType(item.type)}
                        </td>

                        <td className="px-3 py-4 text-xs text-zinc-500">
                          {item.operating.toFixed(1)} h
                        </td>

                        <td className="px-3 py-4 text-xs text-zinc-500">
                          {item.idle.toFixed(1)} h
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <div className="hidden w-24 sm:block">
                              <ProgressBar value={item.utilization} />
                            </div>

                            <span className="w-10 text-right text-xs font-semibold text-white">
                              {Math.round(item.utilization)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnalyticsPanel>
        </section>

        {/* =====================================================
            EEI RANKING + MAINTENANCE
        ====================================================== */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalyticsPanel
            icon={ShieldCheck}
            title="Equipment efficiency leaders"
            description="Highest available EEI scores in the current fleet data."
          >
            {eeiRanking.length === 0 ? (
              <EmptyAnalytics
                icon={ShieldCheck}
                title="EEI data unavailable"
                description="No equipment efficiency scores are available yet."
              />
            ) : (
              <div className="space-y-4">
                {eeiRanking.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b border-[#2a2a2d] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#8b5cf6]/10 text-xs font-bold text-[#a78bfa]">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-300">
                        {item.name}
                      </p>

                      <p className="mt-1 text-[11px] capitalize text-zinc-600">
                        {formatEquipmentType(item.type)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {Math.round(item.score)}
                      </p>

                      <p className="text-[10px] text-zinc-600">EEI</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsPanel>

          <AnalyticsPanel
            icon={CalendarClock}
            title="Maintenance watch"
            description="Equipment approaching or exceeding its calculated service interval."
          >
            {maintenanceItems.length === 0 ? (
              <EmptyAnalytics
                icon={CheckCircle2}
                title="No maintenance alerts"
                description="No equipment is currently due for maintenance based on the available service data."
              />
            ) : (
              <div className="space-y-4">
                {maintenanceItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-b border-[#2a2a2d] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-amber-500/10">
                      <Wrench className="h-4 w-4 text-amber-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-300">
                        {item.name}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-zinc-600">
                        {item.location}
                      </p>

                      <p className="mt-2 text-[11px] text-amber-400">
                        {item.daysOverdue > 0
                          ? `${item.daysOverdue} day${
                              item.daysOverdue === 1 ? "" : "s"
                            } overdue`
                          : item.dueDate
                          ? `Due ${item.dueDate.toLocaleDateString()}`
                          : "Maintenance due"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsPanel>
        </section>
      </main>
    </div>
  );
}

/* =============================================================
   SECTION HEADING
============================================================= */

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>

      <p className="mt-1 max-w-3xl text-sm text-zinc-500">{description}</p>
    </div>
  );
}

/* =============================================================
   METRIC CARD
============================================================= */

function MetricCard({
  label,
  value,
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

          <p className="mt-3 text-3xl font-bold text-white">{value}</p>

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
   ANALYTICS PANEL
============================================================= */

function AnalyticsPanel({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="border border-[#2a2a2d] bg-[#1c1c1f]">
      <div className="flex items-start gap-4 border-b border-[#2a2a2d] px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#8b5cf6]/10">
          <Icon className="h-4 w-4 text-[#a78bfa]" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>

          <p className="mt-1 text-xs leading-5 text-zinc-600">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

/* =============================================================
   STAT BLOCK
============================================================= */

function StatBlock({ label, value, icon: Icon }) {
  return (
    <div className="border border-[#2a2a2d] bg-[#161618] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
          {label}
        </span>

        <Icon className="h-4 w-4 text-[#8b5cf6]" />
      </div>

      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

/* =============================================================
   PROGRESS BAR
============================================================= */

function ProgressBar({ value }) {
  const safeValue = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  return (
    <div className="h-2 overflow-hidden bg-[#29292d]">
      <div
        className="h-full bg-[#7c3aed] transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

/* =============================================================
   EMPTY ANALYTICS
============================================================= */

function EmptyAnalytics({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center border border-dashed border-[#2a2a2d] bg-[#161618] px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center bg-[#8b5cf6]/10">
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
   HELPERS
============================================================= */

function getPercentage(value, total) {
  if (!total) return 0;

  return Math.round((value / total) * 100);
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatEquipmentType(type) {
  return String(type || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getMaintenanceDueDate(item) {
  if (!item?.lastServiceDate) return null;

  const serviceDate = new Date(item.lastServiceDate);

  if (Number.isNaN(serviceDate.getTime())) return null;

  const interval = Number(item?.maintenanceIntervalDays);

  if (!Number.isFinite(interval) || interval <= 0) return null;

  return new Date(
    serviceDate.getTime() + interval * 24 * 60 * 60 * 1000
  );
}

function isMaintenanceDue(item) {
  const dueDate = getMaintenanceDueDate(item);

  if (!dueDate) return false;

  return dueDate.getTime() <= Date.now();
}