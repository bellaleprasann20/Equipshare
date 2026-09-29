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
  completed: "bg-green-100 text-green-700",
  active: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-500",
};

/**
 * List of past allocation requests — what was requested, what
 * equipment was ultimately allocated, and current status. This
 * is also useful evidence for the evaluation section of the
 * research paper (allocation time, unmet requests, etc).
 *
 * Expects useAllocation() to expose:
 *   fetchHistory({ page, pageSize }) -> { items, totalCount }
 *   items: [{ _id, equipmentType, projectLocation, allocatedEquipmentName,
 *             allocationScore, status, createdAt }]
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
        setItems(res.items);
        setTotalCount(res.totalCount);
      })
      .catch((err) => !cancelled && setError(err?.response?.data?.message || "Failed to load history."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, fetchHistory]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Allocation History</h1>
        <Button onClick={() => navigate("/allocation")}>+ New Requirement</Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loader label="Loading history..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No allocation requests yet"
          description="Submit your first equipment requirement to see it here."
          actionLabel="New Requirement"
          onAction={() => navigate("/allocation")}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Requested Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Location</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Allocated Equipment</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Score</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((req) => (
                  <tr
                    key={req._id}
                    onClick={() => navigate(`/allocation/${req._id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(req.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2 text-gray-900">{req.equipmentType}</td>
                    <td className="px-4 py-2 text-gray-600">{req.projectLocation}</td>
                    <td className="px-4 py-2 text-gray-900">
                      {req.allocatedEquipmentName || "—"}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {req.allocationScore ? req.allocationScore.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[req.status] || STATUS_STYLES.cancelled
                        }`}
                      >
                        {req.status}
                      </span>
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
