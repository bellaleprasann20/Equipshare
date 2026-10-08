import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMyOrders,
  cancelOrder,
} from "../../services/orderService";
import { formatINR } from "../../utils/pricing";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

const STATUS_CONFIG = {
  pending: {
    label: "Awaiting Admin Approval",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  approved: {
    label: "Approved",
    className:
      "border-green-500/20 bg-green-500/10 text-green-400",
  },
  rejected: {
    label: "Rejected",
    className:
      "border-red-500/20 bg-red-500/10 text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border-gray-500/20 bg-gray-500/10 text-gray-400",
  },
};

const PAYMENT_LABEL = {
  cod: "Pay on delivery / site",
  bank: "Bank Transfer",
  upi: "UPI",
  internal_budget: "Internal Fleet Budget",
};

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      className:
        "border-gray-500/20 bg-gray-500/10 text-gray-400",
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

function getOrderId(order) {
  return order?._id || order?.id || "";
}

function getOrderReference(order) {
  const id = getOrderId(order);

  if (!id) return "ORDER";

  return `#${String(id).slice(-6).toUpperCase()}`;
}

function getOrders(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.orders)) {
    return response.orders;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getOrderTotal(order) {
  const value = Number(order?.total);

  return Number.isFinite(value) ? value : 0;
}

function getLineTotal(item) {
  const value = Number(item?.lineTotal);

  if (Number.isFinite(value)) {
    return value;
  }

  const unitPrice = Number(item?.unitPrice);
  const days = Number(item?.days) || 1;

  if (Number.isFinite(unitPrice)) {
    return unitPrice * days;
  }

  return 0;
}

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetchMyOrders();
      setOrders(getOrders(response));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load your orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCancel = async (orderId) => {
    if (!orderId || cancellingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setCancellingId(orderId);

      await cancelOrder(orderId);

      await loadOrders(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not cancel the order."
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <Loader fullScreen label="Loading your orders..." />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-[#2a2a2d] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            Equipment Orders
          </p>

          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            My Orders
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Track equipment requests, approval status, and deployment
            information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {refreshing && (
            <span className="text-xs text-gray-500">
              Refreshing...
            </span>
          )}

          <Button
            variant="outline"
            onClick={() => navigate("/equipment")}
          >
            Browse Equipment
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-5">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="rounded-xl border border-[#2a2a2d] bg-[#1c1c1f] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
            <span className="text-2xl">+</span>
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            No Orders
          </p>

          <h2 className="mt-2 font-display text-xl font-bold text-white">
            No equipment orders yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
            Equipment requests you submit through the catalog and
            checkout will appear here.
          </p>

          <div className="mt-6">
            <Button onClick={() => navigate("/equipment")}>
              Browse Equipment
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const orderId = getOrderId(order);
            const status = getStatusConfig(order?.status);

            return (
              <article
                key={orderId}
                className="overflow-hidden rounded-xl border border-[#2a2a2d] bg-[#1c1c1f]"
              >
                {/* Order header */}
                <div className="border-b border-[#2a2a2d] px-5 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-white">
                          {getOrderReference(order)}
                        </span>

                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                            status.className,
                          ].join(" ")}
                        >
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        Placed on {formatDate(order?.createdAt)}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Order Total
                      </p>

                      <p className="mt-1 font-mono text-xl font-bold text-white">
                        {formatINR(getOrderTotal(order))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5">
                  <div className="divide-y divide-[#2a2a2d]">
                    {(Array.isArray(order?.items)
                      ? order.items
                      : []
                    ).map((item, index) => (
                      <div
                        key={
                          item?.equipmentId ||
                          item?._id ||
                          `${orderId}-${index}`
                        }
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {item?.name || "Equipment"}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            {item?.mode === "rent" ? (
                              <>
                                <span>
                                  Rental
                                </span>

                                <span>
                                  {item?.days || 1} day
                                  {(item?.days || 1) !== 1
                                    ? "s"
                                    : ""}
                                </span>

                                {item?.unitPrice !== undefined && (
                                  <span>
                                    {formatINR(item.unitPrice)}
                                    /day
                                  </span>
                                )}
                              </>
                            ) : (
                              <span>Equipment Request</span>
                            )}
                          </div>
                        </div>

                        <span className="font-mono text-sm font-semibold text-gray-200">
                          {formatINR(getLineTotal(item))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery / contact information */}
                <div className="border-t border-[#2a2a2d] bg-[#161618]/50 px-5 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                        Site Contact
                      </p>

                      <p className="mt-1 text-sm text-gray-300">
                        {order?.contactName || "Not provided"}
                      </p>

                      {order?.phone && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {order.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                        Destination
                      </p>

                      <p className="mt-1 text-sm leading-5 text-gray-300">
                        {order?.address || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-[#2a2a2d] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">
                      Payment:{" "}
                      <span className="text-gray-300">
                        {PAYMENT_LABEL[order?.paymentMethod] ||
                          order?.paymentMethod ||
                          "Not specified"}
                      </span>
                    </p>

                    {["pending", "approved"].includes(
                      order?.status
                    ) && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={cancellingId === orderId}
                        onClick={() => handleCancel(orderId)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}