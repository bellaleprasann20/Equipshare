import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UtilizationChart from "../../components/analytics/UtilizationChart";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useAuth } from "../../hooks/useAuth";

const ICONS = {
  catalog: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  request: (
    <>
      <rect x="3" y="3" width="18" height="18" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  analytics: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M3 10h18M9 10v10" />
    </>
  ),
  fleet: (
    <>
      <path d="M3 20h18" />
      <path d="M6 20V9l6-5 6 5v11" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  add: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
};

function CardIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const CARDS = [
  {
    to: "/equipment",
    icon: "catalog",
    title: "Equipment catalog",
    text: "Browse every machine in the fleet, ranked by efficiency score.",
  },
  {
    to: "/allocation",
    icon: "request",
    title: "New requirement",
    text: "Describe your project and get a ranked shortlist of machines.",
  },
  {
    to: "/allocation/history",
    icon: "history",
    title: "Allocation history",
    text: "See past requests and which machines were assigned to them.",
  },
  {
    to: "/analytics",
    icon: "analytics",
    title: "Analytics",
    text: "Review utilization trends and compare ranking methods.",
  },
  {
    to: "/equipment/manage",
    icon: "table",
    title: "Table view",
    text: "Sort and scan the whole fleet in one dense table.",
  },
  {
    to: "/admin",
    icon: "fleet",
    title: "Fleet overview",
    text: "Spot low-scoring machines and overdue maintenance.",
    adminOnly: true,
  },
  {
    to: "/equipment/add",
    icon: "add",
    title: "Add equipment",
    text: "Register a new machine with its service and cost details.",
    adminOnly: true,
  },
];

function ActionCard({ card, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="panel group flex flex-col items-start gap-3 p-6 text-left transition-colors hover:border-ink/30"
    >
      <span className="text-ink group-hover:text-signal">
        <CardIcon name={card.icon} />
      </span>
      <span className="font-display text-lg font-bold uppercase tracking-tight text-ink">
        {card.title}
      </span>
      <span className="text-sm text-steel">{card.text}</span>
    </button>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="panel p-5">
      <p className="text-sm text-steel">{label}</p>
      <p className="mt-2 font-mono text-4xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-2 text-xs text-steel-light">{hint}</p>}
    </div>
  );
}

function eeiHint(score) {
  if (score === null || score === undefined) return "No equipment scored yet";
  if (score >= 80) return "Fleet is in excellent shape";
  if (score >= 60) return "Fleet is in good shape";
  if (score >= 40) return "Fleet needs attention";
  return "Fleet is underperforming";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDashboardSummary } = useAnalytics();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) =>
        setError(err?.response?.data?.message || "Failed to load dashboard.")
      )
      .finally(() => setLoading(false));
  }, [getDashboardSummary]);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  const isAdmin = user?.role === "admin";
  const cards = CARDS.filter((c) => !c.adminOnly || isAdmin);
  const hasActivity = summary?.recentActivity?.length > 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
     <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">
            {isAdmin ? "Your fleet" : "Your project workspace"}
          </h1>
          <p className="mt-1 text-steel">
            Welcome back{user?.name ? `, ${user.name}` : ""}. 
            {isAdmin 
              ? " Here is how the overall fleet is performing." 
              : " Here is the status of your requested equipment."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={() => navigate("/allocation/history")}>
            Allocation history
          </Button>
          <Button size="lg" onClick={() => navigate("/allocation")}>
            Request equipment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Active allocations"
          value={summary?.activeAllocations ?? 0}
          hint="Machines currently assigned to your projects"
        />
        <StatCard
          label="Pending requests"
          value={summary?.pendingRequests ?? 0}
          hint="Requests waiting for you to pick a machine"
        />
        <StatCard
          label="Average fleet EEI"
          value={summary?.avgEEI ?? "N/A"}
          hint={eeiHint(summary?.avgEEI)}
        />
      </div>

      {/* Action cards */}
      <section>
        <h2 className="mb-5 font-display text-2xl font-bold text-ink">Manage your work</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <ActionCard key={card.to} card={card} onOpen={() => navigate(card.to)} />
          ))}
        </div>
      </section>

      <hr className="border-line" />

      {/* Fleet health */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-2xl font-bold text-ink">Fleet health</h2>

        <UtilizationChart
          data={summary?.utilizationByEquipment || []}
          title="Equipment utilization, last 30 days"
        />

        <div className="panel p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-ink">
            Recent activity
          </h3>
          {hasActivity ? (
            <ul className="divide-y divide-line">
              {summary.recentActivity.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="text-ink">{item.message}</span>
                  <span className="shrink-0 font-mono text-xs text-steel">
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-steel">
                No requests yet. Submit a requirement and it will show up here.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/allocation")}>
                Submit a requirement
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}