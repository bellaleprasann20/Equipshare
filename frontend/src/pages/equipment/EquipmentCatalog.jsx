import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEquipment } from "../../hooks/useEquipment";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/pricing";
import EEIBadge from "../../components/equipment/EEIBadge";
import EquipmentImage from "../../components/equipment/EquipmentImage";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

const TYPES = [
  { value: "excavator", label: "Excavator" },
  { value: "crane", label: "Crane" },
  { value: "bulldozer", label: "Bulldozer" },
  { value: "loader", label: "Loader" },
  { value: "concrete_mixer", label: "Concrete Mixer" },
  { value: "dump_truck", label: "Dump Truck" },
];

const FAQS = [
  {
    q: "What is the Equipment Efficiency Index (EEI)?",
    a: "A score from 0 to 100 that summarizes how healthy and well-used a machine is. It combines utilization, reliability, maintenance, age and operating cost, using weights learned from data by a regression model.",
  },
  {
    q: "How are machines ranked for my request?",
    a: "On the New requirement page, each available machine of the type you ask for is scored on its EEI, distance to your site, transfer cost and availability fit. The highest combined score ranks first, and you can see the breakdown behind it.",
  },
  {
    q: "How are internal costs calculated?",
    a: "Instead of paying third-party vendors, your site budget is charged an internal transfer fee based on the daily depreciation rate of the machine.",
  },
  {
    q: "What happens when I request an allocation?",
    a: "Your request is sent to the Fleet Admin's approval queue. Once approved, the machine status changes to 'Allocated' and it will be dispatched to your site.",
  },
  {
    q: "Who can add or retire equipment?",
    a: "Only Fleet Admins. Project managers can browse the fleet, request machines for their sites, and release them when a project is complete.",
  },
];

function EquipmentTile({ item, cartMode, onOpen, onAdd }) {
  const status = item.availability || "available"; // fallback for testing
  const available = status === "available";
  const inCart = cartMode === "rent"; // Simplified since we removed buy mode

  let label = "Request Asset";
  if (status === "allocated") label = "Allocated";
  else if (status === "maintenance") label = "In Maintenance";
  else if (inCart) label = "In Request Draft";

  return (
    <div className="panel flex flex-col bg-surface border border-line rounded-lg overflow-hidden transition-all hover:border-signal">
      <button onClick={onOpen} className="group flex flex-col text-left">
        <div className="relative">
          <EquipmentImage
            src={item.imageUrl}
            alt={item.name}
            label={item.name.split(" ")[0]}
            className="aspect-[4/3] w-full object-cover"
          />
          {!available && (
            <span className="absolute left-3 top-3 border border-line bg-paper px-2 py-1 text-xs font-bold uppercase tracking-wider text-ink rounded shadow-sm">
              {status === "allocated" ? "At Another Site" : "Maintenance"}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 px-4 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-steel">
            Site: {item.location || "Central Hub"}
          </p>
          <h3 className="font-display text-lg font-bold text-ink group-hover:text-signal transition-colors line-clamp-1">
            {item.name}
          </h3>
        </div>
      </button>

      <div className="mt-auto flex items-end justify-between gap-3 p-4 border-t border-line mt-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-steel">AI Efficiency Score</p>
          <EEIBadge score={item.eeiScore || 75} showLabel={false} />
        </div>
        <Button size="sm" variant={inCart ? "outline" : "primary"} disabled={!available} onClick={onAdd}>
          {label}
        </Button>
      </div>
    </div>
  );
}

export default function EquipmentCatalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchEquipment } = useEquipment();
  const { items: cartItems, addItem } = useCart(); // Still using cart context under the hood

  const search = searchParams.get("q") || "";

  const [machines, setMachines] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEquipment({ filters: {}, page: 1, pageSize: 200 })
      .then((res) => setMachines(res.items || res)) // Ensure it handles different res structures
      .catch((err) => setError(err?.response?.data?.message || "Could not reach the server. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [fetchEquipment]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase();
    return TYPES.map((t) => {
      const list = machines
        .filter((m) => m.category?.toLowerCase() === t.value || m.type === t.value)
        .filter(
          (m) =>
            !query ||
            m.name.toLowerCase().includes(query) ||
            m.location?.toLowerCase().includes(query)
        )
        .sort((a, b) => (b.eeiScore ?? 0) - (a.eeiScore ?? 0));
      return { ...t, list };
    }).filter((g) => g.list.length > 0);
  }, [machines, search]);

  const scrollToCategory = (value) => {
    const el = document.getElementById(`cat-${value}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAdd = (item) => {
    const inCart = cartItems.find((c) => c.equipmentId === item._id);
    if (inCart) {
      navigate("/cart"); // Redirect to the Allocation Draft page
      return;
    }
    addItem(item, "rent", 7); // Default to rent mode under the hood to preserve pricing logic
  };

  if (loading) return <Loader label="Loading company fleet..." />;

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto py-6 px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">
            Company Fleet Catalog
          </h1>
          <p className="mt-2 text-sm text-steel max-w-2xl">
            Browse all available internal machinery. Assets are automatically ranked by their AI-predicted Equipment Efficiency Index (EEI) to ensure your site receives the most reliable machines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search by name or site location"
            className="w-72 border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-steel-light focus:border-signal focus:outline-none rounded shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-signal/5 p-5 rounded-lg">
        <div>
          <h3 className="text-base font-bold text-ink">Need a smart recommendation?</h3>
          <p className="text-sm text-steel mt-1">
            Not sure which machine suits your site? Let the AI engine shortlist the best options based on distance and reliability.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => navigate("/allocation")}>
          Run Smart Allocation
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && machines.length === 0 && (
        <div className="panel p-12 text-center bg-surface border border-line rounded-lg">
          <p className="font-display text-2xl font-bold text-ink">No equipment found</p>
          <p className="mt-2 text-steel">
            The database is currently empty. Run the seed script in your backend to populate the fleet.
          </p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-32 border-t-2 border-signal pt-4 bg-surface p-4 rounded-lg border border-line shadow-sm">
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-ink">Browse by category</p>
            <ul className="flex flex-col gap-1">
              {grouped.map((g) => (
                <li key={g.value}>
                  <button
                    onClick={() => scrollToCategory(g.value)}
                    className="flex w-full items-center justify-between py-2.5 px-3 rounded text-left text-sm font-medium text-steel hover:bg-line hover:text-ink transition-colors"
                  >
                    {g.label}
                    <span className="font-mono text-xs bg-paper px-2 py-0.5 rounded text-steel-light border border-line">
                      {g.list.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {grouped.length === 0 && machines.length > 0 && (
            <p className="text-base text-steel">No machines match the search query "{search}".</p>
          )}

          {grouped.map((g) => {
            const showAll = expanded[g.value];
            const visible = showAll ? g.list : g.list.slice(0, 3);
            return (
              <section key={g.value} id={`cat-${g.value}`} className="scroll-mt-36">
                <div className="mb-6 flex items-baseline justify-between border-b border-line pb-3">
                  <h2 className="font-display text-2xl font-bold text-ink">{g.label}s</h2>
                  {g.list.length > 3 && (
                    <button
                      onClick={() => setExpanded((e) => ({ ...e, [g.value]: !e[g.value] }))}
                      className="text-sm font-bold uppercase tracking-wider text-signal hover:text-signal-dark transition-colors"
                    >
                      {showAll ? "Show fewer" : `See all ${g.list.length}`}
                    </button>
                  )}
                </div>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((item) => {
                    const cartEntry = cartItems.find((c) => c.equipmentId === item._id);
                    return (
                      <EquipmentTile
                        key={item._id}
                        item={item}
                        cartMode={cartEntry ? cartEntry.mode : null}
                        onOpen={() => navigate(`/equipment/${item._id}`)}
                        onAdd={() => handleAdd(item)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <section className="border border-line bg-surface px-6 py-12 sm:px-10 rounded-lg mt-10 shadow-sm">
        <h2 className="mb-8 text-center font-display text-3xl font-bold text-ink">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-ink">
                {f.q}
                <span className="text-signal transition-transform group-open:rotate-45 text-xl font-light">+</span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-steel pr-8">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}