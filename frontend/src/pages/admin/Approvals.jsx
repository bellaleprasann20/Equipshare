import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAllocation } from "../../hooks/useAllocation";
import { fetchPendingOrders, approveOrderRequest, rejectOrderRequest } from "../../services/orderService";
import { formatINR } from "../../utils/pricing";
import EEIBadge from "../../components/equipment/EEIBadge";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

export default function Approvals() {
  const navigate = useNavigate();
  const { getPendingAllocations, approveAllocation, rejectAllocation } = useAllocation();

  const [allocations, setAllocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setError("");
    Promise.all([getPendingAllocations(), fetchPendingOrders()])
      .then(([a, o]) => {
        setAllocations(a.items || a);
        setOrders(o.items || o);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load pending items."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApproveAllocation = async (request) => {
    const topPick = request.rankedResults?.[0];
    if (!topPick) return;
    setBusyId(request._id);
    try {
      await approveAllocation({ requestId: request._id, equipmentId: topPick.equipmentId });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not approve this request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectAllocation = async (requestId) => {
    setBusyId(requestId);
    try {
      await rejectAllocation(requestId);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not reject this request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleApproveOrder = async (orderId) => {
    setBusyId(orderId);
    try {
      await approveOrderRequest(orderId);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not approve this deployment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    setBusyId(orderId);
    try {
      await rejectOrderRequest(orderId);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not reject this deployment.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading administrative approval queues..." />;

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto py-8 px-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Fleet Administration Approvals</h1>
        <p className="text-sm text-gray-400 mt-1">
          Review and authorize site allocation requests and machinery dispatch queues.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Allocation Requests Queue */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#2a2a2d] pb-3">
          <h2 className="font-display text-xl font-bold text-white">
            Pending AI Allocation Requests <span className="font-mono text-sm text-purple-400">({allocations.length})</span>
          </h2>
        </div>

        {allocations.length === 0 ? (
          <div className="panel bg-[#1c1c1f] border border-[#2a2a2d] p-8 rounded-lg text-center">
            <p className="text-sm text-gray-400">No pending AI allocation requests waiting for review.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {allocations.map((req) => {
              const topPick = req.rankedResults?.[0];
              return (
                <div key={req._id} className="panel bg-[#1c1c1f] border border-[#2a2a2d] p-6 rounded-lg shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white capitalize">
                        {req.equipmentType || req.category} deployment for {req.projectLocation || req.address}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Requested by <span className="text-gray-200">{req.requestedBy?.name || "Site Manager"}</span>
                        {req.requestedBy?.companyName ? ` (${req.requestedBy.companyName})` : ""} · Dates:{" "}
                        {req.requiredFrom ? new Date(req.requiredFrom).toLocaleDateString("en-IN") : "Immediate"} to{" "}
                        {req.requiredTo ? new Date(req.requiredTo).toLocaleDateString("en-IN") : "Open-ended"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/allocation/recommendations/${req._id}`)}
                      className="text-xs font-semibold text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
                    >
                      View Full AI Ranking
                    </button>
                  </div>

                  {topPick ? (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#2a2a2d] pt-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">AI Top-Ranked Recommendation</p>
                          <p className="font-medium text-white mt-0.5">
                            {topPick.equipment?.name || "Assigned Asset"} — Score: <span className="font-mono text-[#8b5cf6] font-bold">{topPick.allocationScore?.toFixed(1)}</span>
                          </p>
                        </div>
                        {topPick.equipment?.eeiScore && (
                          <EEIBadge score={topPick.equipment.eeiScore} showLabel={false} />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          loading={busyId === req._id}
                          onClick={() => handleRejectAllocation(req._id)}
                          className="border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d]"
                        >
                          Reject Request
                        </Button>
                        <Button 
                          size="sm" 
                          loading={busyId === req._id} 
                          onClick={() => handleApproveAllocation(req)}
                          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-none"
                        >
                          Approve Top Pick
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 border-t border-[#2a2a2d] pt-4 text-sm text-gray-400">
                      No matching equipment found for this request parameters.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Orders / Dispatch Queue */}
      <section className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between border-b border-[#2a2a2d] pb-3">
          <h2 className="font-display text-xl font-bold text-white">
            Asset Dispatch & Order Queue <span className="font-mono text-sm text-purple-400">({orders.length})</span>
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="panel bg-[#1c1c1f] border border-[#2a2a2d] p-8 rounded-lg text-center">
            <p className="text-sm text-gray-400">No pending machinery orders in queue.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order._id} className="panel bg-[#1c1c1f] border border-[#2a2a2d] p-6 rounded-lg shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      Request ID: <span className="font-mono text-[#8b5cf6]">#{order._id.slice(-6).toUpperCase()}</span> · Supervisor: {order.contactName || order.user?.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Contact: {order.phone} · Destination Site: <span className="text-gray-200">{order.address}</span>
                    </p>
                  </div>
                  <span className="font-mono text-lg font-bold text-white">{formatINR(order.total)}</span>
                </div>

                <ul className="mt-4 divide-y divide-[#2a2a2d] border-y border-[#2a2a2d]">
                  {order.items?.map((item) => (
                    <li key={item.equipmentId} className="flex justify-between gap-3 py-2.5 text-sm">
                      <span className="text-gray-300 font-medium">
                        {item.name} — <span className="text-gray-400">{item.days} days allocation</span>
                      </span>
                      <span className="font-mono text-gray-200">{formatINR(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={busyId === order._id}
                    onClick={() => handleRejectOrder(order._id)}
                    className="border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d]"
                  >
                    Reject Dispatch
                  </Button>
                  <Button 
                    size="sm" 
                    loading={busyId === order._id} 
                    onClick={() => handleApproveOrder(order._id)}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-none"
                  >
                    Approve & Dispatch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}