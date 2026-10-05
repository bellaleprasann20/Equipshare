import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/common/Button";
import { useAllocation } from "../../hooks/useAllocation";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  active: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border border-green-500/20",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  released: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
};

/**
 * List of past and active allocation requests — showing what was requested,
 * what equipment was ultimately allocated, and the AI matching score.
 */
export default function AllocationHistory() {
  const navigate = useNavigate();
  const { fetchHistory } = useAllocation();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchHistory({ page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items || res); // Handle varied API responses gracefully
        setTotalCount(res.totalCount || (res.items ? res.items.length : 0));
      })
      .catch((err) => !cancelled && setError(err?.response?.data?.message || "Failed to load allocation history."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, fetchHistory]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Allocation History & Active Deployments</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track historical site requirements, AI recommendation scores, and manage active machinery releases.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/allocation")} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
          + New Requirement
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loader label="Loading allocation records..." />
      ) : items.length === 0 ? (
        <div className="panel bg-[#1c1c1f] border border-[#2a2a2d] p-12 rounded-lg text-center">
          <EmptyState
            title="No allocation requests found"
            description="Submit your first equipment requirement to begin tracking internal fleet allocations."
            actionLabel="Submit Requirement"
            onAction={() => navigate("/allocation")}
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] shadow-sm">
            <table className="min-w-full divide-y divide-[#2a2a2d] text-sm text-left">
              <thead className="bg-[#161618]">
                <tr>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Date</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Requested Asset</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Destination Site</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Assigned Machine</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">AI Score</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Status</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2d] bg-[#1c1c1f]">
                {items.map((req) => (
                  <tr
                    key={req._id}
                    className="hover:bg-[#222225] transition-colors group"
                  >
                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                      {new Date(req.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white capitalize">{req.equipmentType || req.category}</td>
                    <td className="px-6 py-4 text-gray-300">{req.projectLocation || req.address}</td>
                    <td className="px-6 py-4 text-white font-medium">
                      {req.allocatedEquipmentName || req.name || "Pending Assignment"}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#8b5cf6]">
                      {req.allocationScore ? `${req.allocationScore.toFixed(0)}/100` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          STATUS_STYLES[req.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {req.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/allocation/${req._id}`)}
                          className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                          Details
                        </button>
                        {req.status === "active" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Call your release handler here
                              alert(`Releasing equipment for request #${req._id.slice(-6)} back to available pool.`);
                            }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded text-xs font-semibold transition-colors"
                          >
                            Release Asset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalCount / PAGE_SIZE)}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}