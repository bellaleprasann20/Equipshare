import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAllocation } from "../../hooks/useAllocation";
import {
  fetchPendingOrders,
  approveOrderRequest,
  rejectOrderRequest,
} from "../../services/orderService";

import { formatINR } from "../../utils/pricing";

import EEIBadge from "../../components/equipment/EEIBadge";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

function getItems(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function formatDate(value, fallback = "—") {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return "—";
  }

  return score.toFixed(1);
}

function getEquipmentId(result) {
  return (
    result?.equipmentId ||
    result?.equipment?._id ||
    result?.equipment?.id ||
    null
  );
}

function getEquipmentName(result) {
  return (
    result?.equipment?.name ||
    result?.equipmentName ||
    "Recommended equipment"
  );
}

function getRequestLocation(request) {
  return (
    request?.projectLocation ||
    request?.address ||
    request?.location ||
    "Location not specified"
  );
}

function getRequestType(request) {
  return (
    request?.equipmentType ||
    request?.category ||
    request?.type ||
    "Equipment"
  );
}

export default function Approvals() {
  const navigate = useNavigate();

  const {
    getPendingAllocations,
    approveAllocation,
    rejectAllocation,
  } = useAllocation();

  const [allocations, setAllocations] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [allocationResponse, orderResponse] = await Promise.all([
          getPendingAllocations(),
          fetchPendingOrders(),
        ]);

        setAllocations(getItems(allocationResponse));
        setOrders(getItems(orderResponse));
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load pending approval queues."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getPendingAllocations]
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleApproveAllocation = async (request) => {
    const topPick = request?.rankedResults?.[0];

    if (!topPick) {
      setError("This allocation request has no recommended equipment.");
      return;
    }

    const equipmentId = getEquipmentId(topPick);

    if (!equipmentId) {
      setError(
        "The recommended equipment ID is missing. This request cannot be approved."
      );
      return;
    }

    setBusyId(request._id);
    setError("");

    try {
      await approveAllocation({
        requestId: request._id,
        equipmentId,
      });

      await load({ silent: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not approve this allocation request."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectAllocation = async (requestId) => {
    if (!requestId) return;

    setBusyId(requestId);
    setError("");

    try {
      await rejectAllocation(requestId);
      await load({ silent: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not reject this allocation request."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleApproveOrder = async (orderId) => {
    if (!orderId) return;

    setBusyId(orderId);
    setError("");

    try {
      await approveOrderRequest(orderId);
      await load({ silent: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not approve this deployment."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!orderId) return;

    setBusyId(orderId);
    setError("");

    try {
      await rejectOrderRequest(orderId);
      await load({ silent: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not reject this deployment."
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading administrative approval queues..." />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 py-6 sm:py-8">
      {/* Page Header */}
      <header className="flex flex-col gap-4 border-b border-[#2a2a2d] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            Administration
          </p>

          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Fleet Approvals
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Review AI allocation recommendations and authorize equipment
            deployment requests before machinery is assigned to project sites.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={refreshing}
          onClick={() => load({ silent: true })}
          className="self-start border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d] sm:self-auto"
        >
          Refresh Queue
        </Button>
      </header>

      {error && <ErrorMessage message={error} />}

      {/* ============================================================
          ALLOCATION APPROVALS
      ============================================================ */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-[#2a2a2d] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Allocation Approval Queue
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Review the allocation engine's recommended equipment before
              approving the request.
            </p>
          </div>

          <span className="w-fit rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1 font-mono text-xs font-semibold text-[#a78bfa]">
            {allocations.length} pending
          </span>
        </div>

        {allocations.length === 0 ? (
          <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#a78bfa]">
              ✓
            </div>

            <h3 className="mt-3 font-display text-sm font-semibold text-white">
              Allocation queue is clear
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no pending allocation requests waiting for review.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {allocations.map((request) => {
              const topPick = request?.rankedResults?.[0];
              const requestBusy = busyId === request._id;

              const equipmentId = getEquipmentId(topPick);

              return (
                <article
                  key={request._id}
                  className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-5 shadow-sm transition-colors hover:border-[#3a3a3f] sm:p-6"
                >
                  {/* Request information */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#a78bfa]">
                          Allocation Request
                        </span>

                        <span className="font-mono text-[10px] text-gray-500">
                          #{request?._id?.slice(-8)?.toUpperCase() || "—"}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-lg font-bold capitalize text-white">
                        {getRequestType(request)} deployment
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        Project site:{" "}
                        <span className="text-gray-200">
                          {getRequestLocation(request)}
                        </span>
                      </p>

                      <p className="mt-2 text-xs leading-5 text-gray-500">
                        Requested by{" "}
                        <span className="text-gray-300">
                          {request?.requestedBy?.name ||
                            request?.user?.name ||
                            "Site Manager"}
                        </span>

                        {request?.requestedBy?.companyName && (
                          <>
                            {" "}
                            ({request.requestedBy.companyName})
                          </>
                        )}

                        {" · "}Required from{" "}
                        <span className="text-gray-300">
                          {formatDate(request?.requiredFrom, "Immediate")}
                        </span>
                        {" to "}
                        <span className="text-gray-300">
                          {formatDate(request?.requiredTo, "Open-ended")}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/allocation/recommendations/${request._id}`
                        )
                      }
                      className="shrink-0 text-left text-xs font-semibold text-[#a78bfa] transition-colors hover:text-white"
                    >
                      View Full Ranking →
                    </button>
                  </div>

                  {/* Recommendation */}
                  {topPick ? (
                    <div className="mt-5 rounded-md border border-[#2a2a2d] bg-[#161618]">
                      <div className="border-b border-[#2a2a2d] px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                          AI Top-Ranked Recommendation
                        </p>
                      </div>

                      <div className="flex flex-col gap-5 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#8b5cf6]/10 font-mono text-sm font-bold text-[#a78bfa]">
                            #1
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-semibold text-white">
                              {getEquipmentName(topPick)}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-3">
                              <span className="font-mono text-xs text-gray-400">
                                Allocation score:{" "}
                                <span className="font-semibold text-[#a78bfa]">
                                  {formatScore(topPick?.allocationScore)}
                                </span>
                              </span>

                              {equipmentId && (
                                <span className="font-mono text-[10px] text-gray-600">
                                  Asset #{String(equipmentId).slice(-6)}
                                </span>
                              )}
                            </div>
                          </div>

                          {topPick?.equipment?.eeiScore !== null &&
                            topPick?.equipment?.eeiScore !== undefined && (
                              <div className="hidden border-l border-[#2a2a2d] pl-4 sm:block">
                                <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
                                  EEI
                                </p>
                                <EEIBadge
                                  score={topPick.equipment.eeiScore}
                                  showLabel={false}
                                />
                              </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            loading={requestBusy}
                            disabled={requestBusy}
                            onClick={() =>
                              handleRejectAllocation(request._id)
                            }
                            className="border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d]"
                          >
                            Reject Request
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            loading={requestBusy}
                            disabled={!equipmentId || requestBusy}
                            onClick={() =>
                              handleApproveAllocation(request)
                            }
                            className="border-none bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
                          >
                            Approve Top Pick
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-md border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-sm font-medium text-amber-300">
                        No matching equipment found
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        The allocation engine did not return a recommendation
                        for this request. Review the request before taking
                        further action.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/allocation/recommendations/${request._id}`
                          )
                        }
                        className="mt-3 text-xs font-semibold text-[#a78bfa] hover:text-white"
                      >
                        Open request details →
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================
          ORDER / DISPATCH APPROVALS
      ============================================================ */}
      <section className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-[#2a2a2d] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Asset Dispatch & Order Queue
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Authorize equipment orders before machinery is dispatched to
              the destination site.
            </p>
          </div>

          <span className="w-fit rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1 font-mono text-xs font-semibold text-[#a78bfa]">
            {orders.length} pending
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#a78bfa]">
              ✓
            </div>

            <h3 className="mt-3 font-display text-sm font-semibold text-white">
              Dispatch queue is clear
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no pending machinery orders waiting for approval.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const orderBusy = busyId === order._id;

              return (
                <article
                  key={order._id}
                  className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#a78bfa]">
                          Pending Dispatch
                        </span>

                        <span className="font-mono text-[10px] text-gray-500">
                          #
                          {order?._id?.slice(-8)?.toUpperCase() || "—"}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-base font-bold text-white">
                        {order?.contactName ||
                          order?.user?.name ||
                          "Project Supervisor"}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        Contact:{" "}
                        <span className="text-gray-300">
                          {order?.phone || "—"}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Destination:{" "}
                        <span className="text-gray-200">
                          {order?.address || "Destination not specified"}
                        </span>
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        Order Total
                      </p>

                      <p className="mt-1 font-mono text-xl font-bold text-white">
                        {formatINR(order?.total || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="mt-5 overflow-hidden rounded-md border border-[#2a2a2d]">
                    <div className="border-b border-[#2a2a2d] bg-[#161618] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                        Equipment in Order
                      </p>
                    </div>

                    {Array.isArray(order?.items) &&
                    order.items.length > 0 ? (
                      <ul className="divide-y divide-[#2a2a2d]">
                        {order.items.map((item, index) => (
                          <li
                            key={
                              item?.equipmentId ||
                              item?._id ||
                              `order-item-${index}`
                            }
                            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-200">
                                {item?.name || "Equipment"}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-500">
                                {item?.days
                                  ? `${item.days} day${
                                      item.days === 1 ? "" : "s"
                                    } allocation`
                                  : "Allocation period not specified"}
                              </p>
                            </div>

                            <span className="font-mono text-sm text-gray-200">
                              {formatINR(item?.lineTotal || 0)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-4 py-4 text-sm text-gray-500">
                        No equipment line items available.
                      </p>
                    )}
                  </div>

                  {/* Order actions */}
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={orderBusy}
                      disabled={orderBusy}
                      onClick={() => handleRejectOrder(order._id)}
                      className="border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d]"
                    >
                      Reject Dispatch
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      loading={orderBusy}
                      disabled={orderBusy}
                      onClick={() => handleApproveOrder(order._id)}
                      className="border-none bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
                    >
                      Approve & Dispatch
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}