
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
    a: "On the New requirement page, each available machine of the type you ask for is scored on its EEI, distance to your site, transfer cost and availability fit.",
  },
  {
    q: "How are internal costs calculated?",
    a: "Instead of paying third-party vendors, your site budget is charged an internal transfer fee based on the daily depreciation rate of the machine.",
  },
  {
    q: "What happens when I request an allocation?",
    a: "Your request is sent to the Fleet Admin's approval queue. Once approved, the machine status changes to Allocated and it will be dispatched to your site.",
  },
  {
    q: "Who can add or retire equipment?",
    a: "Only Fleet Admins. Project managers can browse the fleet, request machines for their sites, and release them when a project is complete.",
  },
];

function normalizeLocation(location) {
  return String(location || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function EquipmentTile({ item, cartMode, onOpen, onAdd }) {
  const status = item.availability;
  const available = status === "available";
  const inCart = Boolean(cartMode);

  let label = "Request Asset";

  if (status === "allocated" || status === "in_use") {
    label = "Allocated";
  } else if (status === "maintenance") {
    label = "In Maintenance";
  } else if (inCart) {
    label = "In Request Draft";
  }

  return (
    <div className="panel flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all hover:border-signal">
      <button
        onClick={onOpen}
        className="group flex flex-col text-left"
      >
        <div className="relative">
          <EquipmentImage
            src={item.imageUrl}
            alt={item.name}
            label={item.name?.split(" ")[0] || "Equipment"}
            className="aspect-[4/3] w-full object-cover"
          />

          {!available && (
            <span className="absolute left-3 top-3 rounded border border-line bg-paper px-2 py-1 text-xs font-bold uppercase tracking-wider text-ink shadow-sm">
              {status === "allocated" || status === "in_use"
                ? "At Another Site"
                : "Maintenance"}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 px-4 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-steel">
            Site:{" "}
            {item.location ||
              item.currentLocation?.siteName ||
              "Location unavailable"}
          </p>

          <h3 className="line-clamp-1 font-display text-lg font-bold text-ink transition-colors group-hover:text-signal">
            {item.name}
          </h3>
        </div>
      </button>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-line p-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-steel">
            AI Efficiency Score
          </p>

          <EEIBadge
            score={item.eeiScore}
            showLabel={false}
          />
        </div>

        <Button
          size="sm"
          variant={inCart ? "outline" : "primary"}
          disabled={!available}
          onClick={onAdd}
        >
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

  const search = searchParams.get("q") || "";

  const [machines, setMachines] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load company fleet.
  useEffect(() => {
    let mounted = true;

    async function loadEquipment() {
      try {
        setLoading(true);
        setError("");

        const response = await fetchEquipment({
          filters: {},
          page: 1,
          pageSize: 500,
        });

        if (!mounted) return;

        const equipment = Array.isArray(response)
          ? response
          : response?.items || [];

        setMachines(equipment);
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            "Could not reach the server. Is the backend running?"
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEquipment();

    return () => {
      mounted = false;
    };
  }, [fetchEquipment]);

  // Update URL search parameters.
  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next, { replace: true });
  };

  // Group equipment by type and filter by name or location.
  const grouped = useMemo(() => {
    const query = normalizeLocation(search);

    return TYPES.map((type) => {
      const list = machines
        .filter(
          (machine) =>
            machine.category?.toLowerCase() === type.value ||
            machine.type === type.value
        )
        .filter((machine) => {
          const equipmentName = normalizeLocation(machine.name);

          const equipmentLocation = normalizeLocation(
            machine.location ||
              machine.currentLocation?.siteName
          );

          return (
            !query ||
            equipmentName.includes(query) ||
            equipmentLocation.includes(query)
          );
        })
        .sort(
          (a, b) =>
            (b.eeiScore ?? 0) - (a.eeiScore ?? 0)
        );

      return {
        ...type,
        list,
      };
    }).filter((group) => group.list.length > 0);
  }, [machines, search]);

  const scrollToCategory = (value) => {
    const element = document.getElementById(`cat-${value}`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleAdd = (item) => {
    const inCart = cartItems.find(
      (cartItem) => cartItem.equipmentId === item._id
    );

    if (inCart) {
      navigate("/cart");
      return;
    }

    addItem(item, "rent", 7);
  };

  if (loading) {
    return <Loader label="Loading company fleet..." />;
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">
            Company Fleet Catalog
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-steel">
            Browse all available internal machinery. Assets are
            automatically ranked by their AI-predicted Equipment
            Efficiency Index (EEI) to help your site receive reliable machines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(event) =>
              setParam("q", event.target.value)
            }
            placeholder="Search by name or site location"
            className="w-72 rounded border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-steel-light shadow-sm focus:border-signal focus:outline-none"
          />
        </div>
      </div>

      {/* SMART ALLOCATION */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-signal/5 p-5">
        <div>
          <h3 className="text-base font-bold text-ink">
            Need a smart recommendation?
          </h3>

          <p className="mt-1 text-sm text-steel">
            Not sure which machine suits your site? Let the AI
            engine shortlist the best options based on distance and reliability.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/allocation")}
        >
          Run Smart Allocation
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && machines.length === 0 && (
        <div className="panel rounded-lg border border-line bg-surface p-12 text-center">
          <p className="font-display text-2xl font-bold text-ink">
            No equipment found
          </p>

          <p className="mt-2 text-sm text-steel">
            The database currently contains no equipment records.
          </p>
        </div>
      )}

      {/* CATEGORY NAVIGATION AND EQUIPMENT */}
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">

        {/* CATEGORY SIDEBAR */}
        <div className="hidden lg:block">
          <div className="sticky top-32 rounded-lg border border-line border-t-2 border-t-signal bg-surface p-4 shadow-sm">
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-ink">
              Browse by category
            </p>

            <ul className="flex flex-col gap-1">
              {grouped.map((group) => (
                <li key={group.value}>
                  <button
                    onClick={() =>
                      scrollToCategory(group.value)
                    }
                    className="flex w-full items-center justify-between rounded px-3 py-2.5 text-left text-sm font-medium text-steel transition-colors hover:bg-line hover:text-ink"
                  >
                    {group.label}

                    <span className="rounded border border-line bg-paper px-2 py-0.5 font-mono text-xs text-steel-light">
                      {group.list.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* EQUIPMENT GROUPS */}
        <div className="flex flex-col gap-12">

          {grouped.length === 0 && machines.length > 0 && (
            <div className="rounded-lg border border-line bg-surface p-8 text-center">
              <p className="text-base font-semibold text-ink">
                No equipment matches this search.
              </p>

              <p className="mt-2 text-sm text-steel">
                Try another equipment name or location.
              </p>

              <button
                onClick={() => setParam("q", "")}
                className="mt-4 text-sm font-semibold text-signal hover:text-signal-dark"
              >
                Clear search
              </button>
            </div>
          )}

          {grouped.map((group) => {
            const showAll = expanded[group.value];

            const visible = showAll
              ? group.list
              : group.list.slice(0, 3);

            return (
              <section
                key={group.value}
                id={`cat-${group.value}`}
                className="scroll-mt-36"
              >
                <div className="mb-6 flex items-baseline justify-between border-b border-line pb-3">
                  <h2 className="font-display text-2xl font-bold text-ink">
                    {group.label}s
                  </h2>

                  {group.list.length > 3 && (
                    <button
                      onClick={() =>
                        setExpanded((current) => ({
                          ...current,
                          [group.value]: !current[group.value],
                        }))
                      }
                      className="text-sm font-bold uppercase tracking-wider text-signal transition-colors hover:text-signal-dark"
                    >
                      {showAll
                        ? "Show fewer"
                        : `See all ${group.list.length}`}
                    </button>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((item) => {
                    const cartEntry = cartItems.find(
                      (cartItem) =>
                        cartItem.equipmentId === item._id
                    );

                    return (
                      <EquipmentTile
                        key={item._id}
                        item={item}
                        cartMode={cartEntry?.mode || null}
                        onOpen={() =>
                          navigate(`/equipment/${item._id}`)
                        }
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

      {/* FAQ */}
      <section className="mt-10 rounded-lg border border-line bg-surface px-6 py-12 shadow-sm sm:px-10">
        <h2 className="mb-8 text-center font-display text-3xl font-bold text-ink">
          Frequently Asked Questions
        </h2>

        <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group py-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-ink">
                {faq.q}

                <span className="text-xl font-light text-signal transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>

              <p className="mt-4 pr-8 text-sm leading-relaxed text-steel">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
