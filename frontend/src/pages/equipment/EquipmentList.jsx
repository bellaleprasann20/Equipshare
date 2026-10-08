import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/common/Button";
import EEIBadge from "../../components/equipment/EEIBadge";

import { useEquipment } from "../../hooks/useEquipment";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  available:
    "border border-green-500/20 bg-green-500/10 text-green-400",

  in_use:
    "border border-blue-500/20 bg-blue-500/10 text-blue-400",

  allocated:
    "border border-purple-500/20 bg-purple-500/10 text-purple-400",

  maintenance:
    "border border-amber-500/20 bg-amber-500/10 text-amber-400",

  sold:
    "border border-gray-500/20 bg-gray-500/10 text-gray-400",
};

const STATUS_LABELS = {
  available: "Available",
  in_use: "In Use",
  allocated: "Allocated",
  maintenance: "Maintenance",
  sold: "Sold",
};

function getStatusLabel(status) {
  if (!status) return "Unknown";

  return (
    STATUS_LABELS[String(status).toLowerCase()] ||
    String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function getStatusClass(status) {
  return (
    STATUS_STYLES[String(status).toLowerCase()] ||
    "border border-gray-500/20 bg-gray-500/10 text-gray-400"
  );
}

function getEquipmentId(equipment) {
  return equipment?._id || equipment?.id || null;
}

function getEquipmentCategory(equipment) {
  return (
    equipment?.category ||
    equipment?.type ||
    "—"
  );
}

function getEquipmentLocation(equipment) {
  return (
    equipment?.currentLocation?.siteName ||
    equipment?.location ||
    "Location unavailable"
  );
}

function getEquipmentStatus(equipment) {
  return (
    equipment?.availability ||
    equipment?.status ||
    null
  );
}

function getEquipmentItems(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.equipment)) {
    return response.equipment;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getTotalCount(response, items) {
  if (Number.isFinite(Number(response?.totalCount))) {
    return Number(response.totalCount);
  }

  if (Number.isFinite(Number(response?.total))) {
    return Number(response.total);
  }

  if (Number.isFinite(Number(response?.count))) {
    return Number(response.count);
  }

  return items.length;
}

export default function EquipmentList() {
  const navigate = useNavigate();
  const { fetchEquipment } = useEquipment();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadEquipment = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchEquipment({
          filters: {
            search: searchQuery.trim(),
          },
          page,
          pageSize: PAGE_SIZE,
        });

        if (cancelled) return;

        const nextItems = getEquipmentItems(response);
        const nextTotal = getTotalCount(
          response,
          nextItems
        );

        setItems(nextItems);
        setTotalCount(nextTotal);
      } catch (err) {
        if (cancelled) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load equipment inventory."
        );

        setItems([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEquipment();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, page, fetchEquipment]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (page !== 1) {
      setPage(1);
    }
  };

  const handleView = (equipmentId) => {
    if (!equipmentId) return;

    navigate(`/admin/equipment/${equipmentId}`);
  };

  const handleEdit = (equipmentId) => {
    if (!equipmentId) return;

    navigate(`/admin/equipment/${equipmentId}/edit`);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* =========================================================
          HEADER
      ========================================================== */}
      <div className="flex flex-col gap-5 border-b border-[#2a2a2d] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 bg-[#8b5cf6]"
            />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
              Fleet Administration
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Equipment Inventory
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Manage fleet assets, monitor availability, review EEI
            performance and maintain equipment records.
          </p>
        </div>

        <Button
          onClick={() => navigate("/admin/equipment/add")}
          className="w-full border-none bg-[#8b5cf6] text-white hover:bg-[#7c3aed] sm:w-auto"
        >
          + Register Asset
        </Button>
      </div>

      {/* =========================================================
          SEARCH
      ========================================================== */}
      <section className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-4">
        <label
          htmlFor="equipment-search"
          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500"
        >
          Search Fleet
        </label>

        <input
          id="equipment-search"
          type="search"
          value={searchQuery}
          onChange={(event) =>
            handleSearchChange(event.target.value)
          }
          placeholder="Search by equipment name, category or site..."
          autoComplete="off"
          className="w-full rounded-md border border-[#2a2a2d] bg-[#161618] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#8b5cf6]"
        />
      </section>

      {/* =========================================================
          ERROR
      ========================================================== */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* =========================================================
          CONTENT
      ========================================================== */}
      {loading ? (
        <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-10">
          <Loader label="Loading fleet inventory..." />
        </div>
      ) : items.length === 0 ? (
        <EmptyInventory
          searchQuery={searchQuery}
          onAdd={
            !searchQuery.trim()
              ? () => navigate("/admin/equipment/add")
              : undefined
          }
        />
      ) : (
        <>
          {/* =====================================================
              INVENTORY TABLE
          ====================================================== */}
          <section className="overflow-hidden rounded-lg border border-[#2a2a2d] bg-[#1c1c1f]">
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-left text-sm">
                <thead className="border-b border-[#2a2a2d] bg-[#161618]">
                  <tr>
                    <HeaderCell>
                      Asset
                    </HeaderCell>

                    <HeaderCell>
                      Category
                    </HeaderCell>

                    <HeaderCell>
                      Location
                    </HeaderCell>

                    <HeaderCell>
                      Status
                    </HeaderCell>

                    <HeaderCell>
                      EEI
                    </HeaderCell>

                    <HeaderCell align="right">
                      Actions
                    </HeaderCell>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2a2a2d]">
                  {items.map((equipment) => {
                    const equipmentId =
                      getEquipmentId(equipment);

                    const status =
                      getEquipmentStatus(equipment);

                    const category =
                      getEquipmentCategory(equipment);

                    const location =
                      getEquipmentLocation(equipment);

                    return (
                      <tr
                        key={
                          equipmentId ||
                          `${equipment?.name}-${Math.random()}`
                        }
                        className="transition-colors hover:bg-[#222225]"
                      >
                        {/* Asset */}
                        <td className="px-6 py-4">
                          <div className="min-w-[220px]">
                            <button
                              type="button"
                              disabled={!equipmentId}
                              onClick={() =>
                                handleView(equipmentId)
                              }
                              className="text-left font-semibold text-white transition-colors hover:text-[#a78bfa] disabled:cursor-default disabled:hover:text-white"
                            >
                              {equipment?.name ||
                                "Unnamed Equipment"}
                            </button>

                            <p className="mt-1 text-xs text-gray-500">
                              ID:{" "}
                              {equipmentId
                                ? String(
                                    equipmentId
                                  ).slice(-8)
                                : "—"}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="capitalize text-gray-300">
                            {String(category).replace(
                              /_/g,
                              " "
                            )}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">
                          <span className="block max-w-[220px] truncate text-gray-300">
                            {location}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {status ? (
                            <span
                              className={[
                                "inline-flex whitespace-nowrap px-3 py-1 text-[10px] font-bold uppercase tracking-wide",
                                getStatusClass(status),
                              ].join(" ")}
                            >
                              {getStatusLabel(status)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600">
                              —
                            </span>
                          )}
                        </td>

                        {/* EEI */}
                        <td className="px-6 py-4">
                          <EEIBadge
                            score={equipment?.eeiScore}
                            showLabel={false}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={!equipmentId}
                              onClick={() =>
                                handleView(equipmentId)
                              }
                              className="border border-[#2a2a2d] bg-[#222225] px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-[#444449] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              disabled={!equipmentId}
                              onClick={() =>
                                handleEdit(equipmentId)
                              }
                              className="border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400 transition-colors hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ===================================================
                TABLE FOOTER
            ==================================================== */}
            <div className="flex flex-col gap-2 border-t border-[#2a2a2d] px-6 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing{" "}
                <span className="text-gray-300">
                  {items.length}
                </span>{" "}
                of{" "}
                <span className="text-gray-300">
                  {totalCount}
                </span>{" "}
                assets
              </span>

              <span>
                Page{" "}
                <span className="text-gray-300">
                  {page}
                </span>{" "}
                of{" "}
                <span className="text-gray-300">
                  {totalPages}
                </span>
              </span>
            </div>
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ===============================================================
   TABLE HEADER
================================================================ */

function HeaderCell({
  children,
  align = "left",
}) {
  return (
    <th
      scope="col"
      className={[
        "px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500",
        align === "right"
          ? "text-right"
          : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

/* ===============================================================
   EMPTY STATE
================================================================ */

function EmptyInventory({
  searchQuery,
  onAdd,
}) {
  const hasSearch = Boolean(searchQuery?.trim());

  return (
    <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#2a2a2d] bg-[#161618] text-xl text-gray-500">
        ▣
      </div>

      <h2 className="mt-5 font-display text-xl font-bold text-white">
        {hasSearch
          ? "No matching equipment"
          : "No equipment registered"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {hasSearch
          ? "Try a different equipment name, category or location."
          : "Register your first fleet asset to start managing your equipment inventory."}
      </p>

      {onAdd && (
        <div className="mt-6">
          <Button
            onClick={onAdd}
            className="border-none bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
          >
            Register First Asset
          </Button>
        </div>
      )}
    </div>
  );
}