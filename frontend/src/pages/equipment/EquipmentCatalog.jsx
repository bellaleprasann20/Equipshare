import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEquipment } from "../../hooks/useEquipment";
import { useCart } from "../../context/CartContext";
import { buyPrice, rentPerDay, formatINR } from "../../utils/pricing";
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
    q: "How are rent and buy prices set?",
    a: "Each machine has a listed daily rent and a listed purchase price. A rental total is the number of days multiplied by the daily rate.",
  },
  {
    q: "What happens when I place an order?",
    a: "Rented machines are marked in use and purchased machines are marked sold. You can cancel a confirmed order from the My orders page to release the machines. Payment is simulated in this project.",
  },
  {
    q: "Who can add or edit equipment?",
    a: "Fleet admins. Project managers can browse the fleet, rent or buy machines and review machines they have rented.",
  },
];

function EquipmentTile({ item, mode, cartMode, onOpen, onAdd }) {
  const status = item.availability;
  const available = status === "available";
  const inCart = cartMode === mode;
  const price = mode === "buy" ? formatINR(buyPrice(item)) : `${formatINR(rentPerDay(item))} / day`;

  let label = mode === "buy" ? "Add to cart" : "Rent";
  if (status === "sold") label = "Sold";
  else if (status === "in_use") label = "In use";
  else if (inCart) label = "In cart";

  return (
    <div className="panel flex flex-col">
      <button onClick={onOpen} className="group flex flex-col text-left">
        <div className="relative">
          <EquipmentImage
            src={item.imageUrl}
            alt={item.name}
            label={item.name.split(" ")[0]}
            className="aspect-[4/3] w-full"
          />
          {!available && (
            <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-xs font-medium text-white">
              {status === "sold" ? "Sold" : "In use"}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 px-4 pt-4">
          <p className="text-xs text-steel">{item.location}</p>
          <h3 className="font-display text-base font-semibold text-ink group-hover:text-signal">
            {item.name}
          </h3>
        </div>
      </button>

      <div className="mt-auto flex items-end justify-between gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-lg font-semibold text-ink">{price}</span>
          <EEIBadge score={item.eeiScore} showLabel={false} />
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
  const { items: cartItems, addItem } = useCart();

  const mode = searchParams.get("mode") === "buy" ? "buy" : "rent";
  const search = searchParams.get("q") || "";

  const [machines, setMachines] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEquipment({ filters: {}, page: 1, pageSize: 200 })
      .then((res) => setMachines(res.items))
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
        .filter((m) => m.type === t.value)
        .filter(
          (m) =>
            !query ||
            m.name.toLowerCase().includes(query) ||
            m.location.toLowerCase().includes(query)
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
    if (inCart && inCart.mode === mode) {
      navigate("/cart");
      return;
    }
    addItem(item, mode, 7);
  };

  if (loading) return <Loader label="Loading fleet..." />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {mode === "buy" ? "Buy equipment" : "Rent equipment"}
          </h1>
          <p className="mt-1 text-sm text-steel">
            {mode === "buy"
              ? "Listed purchase prices. Sold machines stay visible so you can see what has gone."
              : "Daily rental rates. Best-scoring machines come first."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex border border-line bg-white">
            {["rent", "buy"].map((m) => (
              <button
                key={m}
                onClick={() => setParam("mode", m)}
                className={[
                  "px-5 py-2 text-sm font-semibold",
                  mode === m ? "bg-ink text-white" : "text-steel hover:text-ink",
                ].join(" ")}
              >
                {m === "rent" ? "Rent" : "Buy"}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search by name or site"
            className="w-64 border border-line bg-white px-3 py-2 text-sm placeholder:text-steel-light focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
          />
        </div>
      </div>

      {mode === "rent" && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-white p-4">
          <p className="text-sm text-steel">
            Not sure which machine suits your site? Let the ranking engine shortlist for you.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/allocation")}>
            Get a ranked shortlist
          </Button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {!error && machines.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">No equipment in the database yet</p>
          <p className="mt-2 text-sm text-steel">
            Open a terminal in the backend folder, run npm run seed, then refresh this page.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-32 border-t-2 border-ink pt-3">
            <p className="mb-2 text-sm font-semibold">Browse by category</p>
            <ul>
              {grouped.map((g) => (
                <li key={g.value} className="border-b border-line">
                  <button
                    onClick={() => scrollToCategory(g.value)}
                    className="flex w-full items-center justify-between py-2.5 text-left text-sm text-steel hover:text-signal"
                  >
                    {g.label}
                    <span className="font-mono text-xs text-steel-light">{g.list.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {grouped.length === 0 && machines.length > 0 && (
            <p className="text-sm text-steel">No machines match "{search}".</p>
          )}

          {grouped.map((g) => {
            const showAll = expanded[g.value];
            const visible = showAll ? g.list : g.list.slice(0, 3);
            return (
              <section key={g.value} id={`cat-${g.value}`} className="scroll-mt-36">
                <div className="mb-4 flex items-baseline justify-between border-b border-line pb-2">
                  <h2 className="font-display text-xl font-semibold">{g.label}s</h2>
                  {g.list.length > 3 && (
                    <button
                      onClick={() => setExpanded((e) => ({ ...e, [g.value]: !e[g.value] }))}
                      className="text-sm font-medium text-signal hover:text-signal-dark"
                    >
                      {showAll ? "Show fewer" : `See all ${g.list.length} ${g.label.toLowerCase()}s`}
                    </button>
                  )}
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((item) => {
                    const cartEntry = cartItems.find((c) => c.equipmentId === item._id);
                    return (
                      <EquipmentTile
                        key={item._id}
                        item={item}
                        mode={mode}
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

      <section className="bg-ink px-6 py-12 text-white sm:px-10">
        <h2 className="mb-6 text-center font-display text-3xl font-bold">Frequently asked questions</h2>
        <div className="mx-auto max-w-3xl divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {f.q}
                <span className="text-signal transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-white/65">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white p-8">
        <div>
          <h2 className="font-display text-2xl font-bold">Can't find the right machine?</h2>
          <p className="mt-1 text-sm text-steel">
            Describe your project and we'll rank what's available for you.
          </p>
        </div>
        <Button size="lg" onClick={() => navigate("/allocation")}>
          Submit a requirement
        </Button>
      </section>
    </div>
  );
}