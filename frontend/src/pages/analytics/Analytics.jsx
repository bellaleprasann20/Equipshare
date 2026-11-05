
import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";
import {
  Activity, AlertTriangle, BarChart3, Building2, CalendarClock,
  CheckCircle2, CircleDollarSign, Gauge, Package, RefreshCw,
  ShieldCheck, TrendingUp, Wrench,
} from "lucide-react";

const validNumber = (value) =>
  value !== null && value !== undefined && value !== "" &&
  Number.isFinite(Number(value));

const average = (values) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

const getUtilization = (item) => {
  const operating = Number(item.operatingHoursLast30Days);
  const idle = Number(item.idleHoursLast30Days);

  if (!validNumber(item.operatingHoursLast30Days) ||
      !validNumber(item.idleHoursLast30Days) ||
      operating + idle <= 0) return null;

  return (operating / (operating + idle)) * 100;
};

const getMaintenanceDueDate = (item) => {
  if (!item.lastServiceDate ||
      !validNumber(item.maintenanceIntervalDays)) return null;

  const date = new Date(item.lastServiceDate);
  if (Number.isNaN(date.getTime())) return null;

  date.setDate(date.getDate() + Number(item.maintenanceIntervalDays));
  return date;
};

const isMaintenanceDue = (item) => {
  const date = getMaintenanceDueDate(item);
  return date !== null && date <= new Date();
};

const formatType = (value) =>
  String(value || "—").replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());

const formatCurrency = (value) =>
  value === null ? "—" : new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(value);

const percentage = (value, total) =>
  total ? Math.round((value / total) * 100) : 0;

export default function Analytics() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setError("");

    try {
      const { data } = await api.get("/equipment");

      const list = Array.isArray(data) ? data :
        Array.isArray(data?.equipment) ? data.equipment :
        Array.isArray(data?.items) ? data.items :
        Array.isArray(data?.results) ? data.results : null;

      if (!list) throw new Error("Invalid equipment data received from server.");

      setEquipment(list);
    } catch (err) {
      setError(err?.response?.data?.message || err.message ||
        "Unable to load fleet analytics.");
      setEquipment([]);
    }
  }, []);

  useEffect(() => {
    loadAnalytics().finally(() => setLoading(false));
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
    const available = equipment.filter(x => x.availability === "available").length;
    const inUse = equipment.filter(x => x.availability === "in_use").length;
    const sold = equipment.filter(x => x.availability === "sold").length;

    const utilization = equipment.map(getUtilization).filter(v => v !== null);

    const eei = equipment
      .filter(x => validNumber(x.eeiScore))
      .map(x => Number(x.eeiScore));

    const costs = equipment
      .filter(x => validNumber(x.operatingCostPerDay) &&
        Number(x.operatingCostPerDay) >= 0)
      .map(x => Number(x.operatingCostPerDay));

    const breakdowns = equipment
      .filter(x => validNumber(x.breakdownCount))
      .reduce((sum, x) => sum + Number(x.breakdownCount), 0);

    return {
      total, available, inUse, sold,
      maintenanceDue: equipment.filter(isMaintenanceDue).length,
      fleetUtilization: average(utilization),
      averageEEI: average(eei),
      averageOperatingCost: average(costs),
      breakdowns,
      utilizationRecords: utilization.length,
      eeiRecords: eei.length,
      costRecords: costs.length,
    };
  }, [equipment]);

  const locationDistribution = useMemo(() => {
    const map = new Map();

    equipment.forEach(item => {
      if (!item.location?.trim()) return;
      map.set(item.location.trim(), (map.get(item.location.trim()) || 0) + 1);
    });

    return [...map.entries()]
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  }, [equipment]);

  const utilizationRanking = useMemo(() =>
    equipment.map(item => ({
      id: item._id || item.id,
      name: item.name,
      type: item.type,
      operating: validNumber(item.operatingHoursLast30Days)
        ? Number(item.operatingHoursLast30Days) : null,
      idle: validNumber(item.idleHoursLast30Days)
        ? Number(item.idleHoursLast30Days) : null,
      utilization: getUtilization(item),
    }))
      .filter(item => item.name && item.utilization !== null)
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 8),
  [equipment]);

  const eeiRanking = useMemo(() =>
    equipment
      .filter(item => item.name && validNumber(item.eeiScore))
      .map(item => ({
        id: item._id || item.id,
        name: item.name,
        type: item.type,
        score: Number(item.eeiScore),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6),
  [equipment]);

  const maintenanceItems = useMemo(() =>
    equipment.filter(isMaintenanceDue).map(item => {
      const dueDate = getMaintenanceDueDate(item);
      return {
        id: item._id || item.id,
        name: item.name,
        location: item.location,
        dueDate,
        overdue: Math.max(0, Math.ceil(
          (Date.now() - dueDate.getTime()) / 86400000
        )),
      };
    }).filter(item => item.name)
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, 6),
  [equipment]);

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
        <section className="flex flex-col gap-5 border-b border-[#2a2a2d] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a78bfa]">
              Fleet Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Actual fleet utilization, efficiency, maintenance, location
              and operating cost analysis.
            </p>
          </div>

          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center justify-center gap-2 border border-[#2a2a2d] bg-[#1c1c1f] px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </section>

        {error && <div className="mt-6"><ErrorMessage message={error} /></div>}

        <section className="mt-7">
          <SectionHeading title="Current fleet condition"
            description="Live summary based on registered equipment records." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Fleet Size" value={metrics.total}
              description="Registered equipment records." icon={Package}
              iconClass="bg-[#8b5cf6]/10 text-[#a78bfa]" />
            <MetricCard label="Available" value={metrics.available}
              description={`${percentage(metrics.available, metrics.total)}% of fleet available.`}
              icon={CheckCircle2} iconClass="bg-green-500/10 text-green-400" />
            <MetricCard label="In Use" value={metrics.inUse}
              description={`${percentage(metrics.inUse, metrics.total)}% currently allocated.`}
              icon={Activity} iconClass="bg-blue-500/10 text-blue-400" />
            <MetricCard label="Maintenance Due" value={metrics.maintenanceDue}
              description="Based on last service date and maintenance interval."
              icon={Wrench} iconClass="bg-amber-500/10 text-amber-400" />
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalyticsPanel icon={Gauge} title="Fleet efficiency"
            description="Calculated from recorded operating hours and available EEI scores.">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatBlock label="Average Utilization"
                value={metrics.fleetUtilization === null ? "—" :
                  `${Math.round(metrics.fleetUtilization)}%`} icon={TrendingUp} />
              <StatBlock label="Average EEI"
                value={metrics.averageEEI === null ? "Not calculated" :
                  `${Math.round(metrics.averageEEI)}/100`} icon={Gauge} />
            </div>
            <div className="mt-5 text-xs text-zinc-500">
              Utilization records: {metrics.utilizationRecords} ·
              EEI records: {metrics.eeiRecords}
            </div>
            <div className="mt-5">
              <ProgressBar value={metrics.fleetUtilization} />
            </div>
          </AnalyticsPanel>

          <AnalyticsPanel icon={CircleDollarSign} title="Operating cost"
            description="Average daily operating cost from registered equipment.">
            <p className="text-4xl font-bold">
              {formatCurrency(metrics.averageOperatingCost)}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Based on {metrics.costRecords} equipment records.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4">
              <StatBlock label="Breakdowns" value={metrics.breakdowns}
                icon={AlertTriangle} />
              <StatBlock label="Sold" value={metrics.sold}
                icon={ShieldCheck} />
            </div>
          </AnalyticsPanel>
        </section>

        <section className="mt-6">
          <AnalyticsPanel icon={Building2} title="Fleet by location"
            description="Actual registered equipment locations.">
            {locationDistribution.length === 0 ? (
              <EmptyAnalytics title="No location records"
                description="Equipment location data has not been recorded." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {locationDistribution.map(item => (
                  <div key={item.location}
                    className="border border-[#2a2a2d] bg-[#161618] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-zinc-300">{item.location}</span>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsPanel>
        </section>

        <section className="mt-6">
          <AnalyticsPanel icon={TrendingUp} title="Equipment utilization analysis"
            description="Equipment ranked by actual operating hours compared with total recorded hours.">
            {utilizationRanking.length === 0 ? (
              <EmptyAnalytics title="No utilization records"
                description="Valid operating and idle hour records are required." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead><tr className="border-b border-[#2a2a2d]">
                    {["Equipment", "Type", "Operating", "Idle", "Utilization"].map(x =>
                      <th key={x} className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{x}</th>
                    )}
                  </tr></thead>
                  <tbody>
                    {utilizationRanking.map(item => (
                      <tr key={item.id} className="border-b border-[#2a2a2d]">
                        <td className="px-3 py-4 text-sm text-zinc-300">{item.name}</td>
                        <td className="px-3 py-4 text-xs text-zinc-500">{formatType(item.type)}</td>
                        <td className="px-3 py-4 text-xs text-zinc-500">{item.operating} h</td>
                        <td className="px-3 py-4 text-xs text-zinc-500">{item.idle} h</td>
                        <td className="px-3 py-4 text-xs font-semibold">{Math.round(item.utilization)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnalyticsPanel>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalyticsPanel icon={ShieldCheck} title="Equipment efficiency leaders"
            description="Ranking based only on EEI scores returned by the backend.">
            {eeiRanking.length === 0 ? (
              <EmptyAnalytics title="EEI scores not available"
                description="The backend has not returned calculated EEI scores for these equipment records." />
            ) : eeiRanking.map((item, index) => (
              <div key={item.id}
                className="flex items-center justify-between border-b border-[#2a2a2d] py-4 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#a78bfa]">{index + 1}</span>
                  <div>
                    <p className="text-sm text-zinc-300">{item.name}</p>
                    <p className="text-xs text-zinc-600">{formatType(item.type)}</p>
                  </div>
                </div>
                <span className="font-bold">{item.score.toFixed(1)}/100</span>
              </div>
            ))}
          </AnalyticsPanel>

          <AnalyticsPanel icon={CalendarClock} title="Maintenance watch"
            description="Calculated from the last service date and maintenance interval.">
            {maintenanceItems.length === 0 ? (
              <EmptyAnalytics title="No maintenance due"
                description="No registered equipment is currently overdue for service." />
            ) : maintenanceItems.map(item => (
              <div key={item.id}
                className="flex items-start justify-between gap-4 border-b border-[#2a2a2d] py-4 last:border-0">
                <div>
                  <p className="text-sm text-zinc-300">{item.name}</p>
                  {item.location && <p className="mt-1 text-xs text-zinc-600">{item.location}</p>}
                  <p className="mt-2 text-xs text-amber-400">
                    {item.overdue > 0 ? `${item.overdue} days overdue` :
                      `Due ${item.dueDate.toLocaleDateString("en-IN")}`}
                  </p>
                </div>
                <Wrench className="h-4 w-4 text-amber-400" />
              </div>
            ))}
          </AnalyticsPanel>
        </section>
      </main>
    </div>
  );
}

function SectionHeading({ title, description }) {
  return <div className="mb-4">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <p className="mt-1 text-sm text-zinc-500">{description}</p>
  </div>;
}

function MetricCard({ label, value, description, icon: Icon, iconClass }) {
  return <div className="border border-[#2a2a2d] bg-[#1c1c1f] p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</p>
        <p className="mt-3 text-3xl font-bold">{value}</p>
        <p className="mt-2 text-xs leading-5 text-zinc-600">{description}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center ${iconClass}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </div>;
}

function AnalyticsPanel({ icon: Icon, title, description, children }) {
  return <section className="border border-[#2a2a2d] bg-[#1c1c1f]">
    <div className="flex items-start gap-4 border-b border-[#2a2a2d] px-5 py-5">
      <div className="flex h-9 w-9 items-center justify-center bg-[#8b5cf6]/10">
        <Icon className="h-4 w-4 text-[#a78bfa]" />
      </div>
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-600">{description}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </section>;
}

function StatBlock({ label, value, icon: Icon }) {
  return <div className="border border-[#2a2a2d] bg-[#161618] p-4">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{label}</span>
      <Icon className="h-4 w-4 text-[#8b5cf6]" />
    </div>
    <p className="mt-3 text-2xl font-bold">{value}</p>
  </div>;
}

function ProgressBar({ value }) {
  const safe = value === null ? 0 : Math.max(0, Math.min(100, value));
  return <div className="h-2 overflow-hidden bg-[#29292d]">
    <div className="h-full bg-[#7c3aed]" style={{ width: `${safe}%` }} />
  </div>;
}

function EmptyAnalytics({ title, description }) {
  return <div className="flex min-h-36 flex-col items-center justify-center border border-dashed border-[#2a2a2d] bg-[#161618] px-6 text-center">
    <BarChart3 className="h-6 w-6 text-[#a78bfa]" />
    <h3 className="mt-4 text-sm font-semibold text-zinc-300">{title}</h3>
    <p className="mt-2 text-xs leading-5 text-zinc-600">{description}</p>
  </div>;
}
