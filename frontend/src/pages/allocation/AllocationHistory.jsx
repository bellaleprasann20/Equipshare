import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

import { fetchMyOrders } from "../../services/orderService";
import { formatINR } from "../../utils/pricing";

const ORDER_STATUS = {
  pending: {
    label: "Awaiting Admin Approval",
    className:
      "border border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  approved: {
    label: "Approved",
    className:
      "border border-green-500/20 bg-green-500/10 text-green-400",
  },
  rejected: {
    label: "Rejected",
    className:
      "border border-red-500/20 bg-red-500/10 text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border border-gray-500/20 bg-gray-500/10 text-gray-400",
  },
};

function getItems(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.orders)) return response.orders;

  return [];
}

function getOrderStatus(status) {
  const normalized = String(status || "pending").toLowerCase();

  return (
    ORDER_STATUS[normalized] || {
      label: normalized.replace(/_/g, " "),
      className:
        "border border-gray-500/20 bg-gray-500/10 text-gray-400",
    }
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AllocationHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchMyOrders();

        if (!cancelled) {
          setOrders(getItems(response));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Failed to load order history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">

      {/* PAGE HEADER */}
      <section className="border-b border-[#2a2a2d] pb-7">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 bg-[#8b5cf6]" />

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
            Workspace History
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Order History
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
          View your equipment orders, approval status, rental details
          and delivery information.
        </p>
      </section>

      {/* ORDER HISTORY */}
      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
            Orders
          </p>

          <h2 className="mt-1 font-display text-2xl font-bold text-white">
            Your Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Track equipment orders submitted through Checkout.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-[#2a2a2d] bg-[#1c1c1f]">
            <Loader label="Loading order history..." />
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrders onBrowse={() => navigate("/equipment")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#2a2a2d] bg-[#1c1c1f]">
            {orders.map((order) => {
              const status = getOrderStatus(order?.status);

              return (
                <div
                  key={order?._id}
                  className="border-b border-[#2a2a2d] p-5 last:border-b-0 transition-colors hover:bg-[#202023]"
                >
                  {/* ORDER HEADER */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="font-mono text-sm font-semibold text-white">
                        #
                        {order?._id
                          ?.slice(-8)
                          .toUpperCase() || "ORDER"}
                      </span>

                      <span className="ml-3 text-xs text-gray-600">
                        {formatDate(order?.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${status.className}`}
                      >
                        {status.label}
                      </span>

                      <span className="font-mono text-lg font-semibold text-white">
                        {formatINR(Number(order?.total) || 0)}
                      </span>
                    </div>
                  </div>

                  {/* ORDER ITEMS */}
                  <div className="mt-5 divide-y divide-[#2a2a2d] border-y border-[#2a2a2d]">
                    {(order?.items || []).map((item, index) => (
                      <div
                        key={
                          item?.equipmentId ||
                          `${order?._id}-${index}`
                        }
                        className="flex flex-wrap items-center justify-between gap-3 py-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-200">
                            {item?.name || "Equipment"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {item?.mode === "rent"
                              ? `Rental • ${
                                  item?.days || 1
                                } ${
                                  Number(item?.days) === 1
                                    ? "day"
                                    : "days"
                                }`
                              : "Purchase"}
                          </p>
                        </div>

                        <span className="font-mono text-sm text-gray-300">
                          {formatINR(
                            Number(item?.lineTotal) || 0
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CONTACT / DESTINATION */}
                  <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Contact:{" "}
                      <span className="text-gray-300">
                        {order?.contactName || "—"}
                      </span>
                    </span>

                    <span>
                      Destination:{" "}
                      <span className="text-gray-300">
                        {order?.address || "—"}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyOrders({ onBrowse }) {
  return (
    <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-purple-500/20 bg-purple-500/10 text-lg text-purple-400">
        ▣
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold text-white">
        No orders yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Your equipment orders submitted through Checkout will
        appear here.
      </p>

      <Button
        onClick={onBrowse}
        className="mt-5 border-none bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
      >
        Browse Equipment
      </Button>
    </div>
  );
}