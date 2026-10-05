import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/common/Button";
import EEIBadge from "../../components/equipment/EEIBadge";
import { useEquipment } from "../../hooks/useEquipment";
import { useAuth } from "../../hooks/useAuth";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  available: "bg-green-500/10 text-green-400 border border-green-500/20",
  allocated: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  maintenance: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  sold: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

/**
 * Admin Fleet Management Directory / Table View
 */
export default function EquipmentList() {
  const navigate = useNavigate();
  const { fetchEquipment } = useEquipment();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchEquipment({ filters: { search: searchQuery }, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items || res);
        setTotalCount(res.totalCount || (res.items ? res.items.length : 0));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Failed to load equipment directory.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [searchQuery, page, fetchEquipment]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Fleet Management Directory</h1>
          <p className="text-sm text-gray-400 mt-1">
            Master inventory control, GPS tracking locations, and AI efficiency metrics across all company assets.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => navigate("/equipment/add")} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
            + Register New Asset
          </Button>
        )}
      </div>

      {/* Search Bar filter */}
      <div className="flex items-center gap-4 bg-[#1c1c1f] p-4 rounded-lg border border-[#2a2a2d]">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, category, or site location..."
          className="w-full bg-[#161618] border border-[#2a2a2d] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 rounded focus:border-[#8b5cf6] focus:outline-none"
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loader label="Loading fleet directory..." />
      ) : items.length === 0 ? (
        <div className="panel bg-[#1c1c1f] border border-[#2a2a2d] p-12 rounded-lg text-center">
          <p className="font-display text-xl font-bold text-white">No machinery found</p>
          <p className="mt-2 text-sm text-gray-400">Try adjusting your search query or seed the database.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] shadow-sm">
            <table className="min-w-full divide-y divide-[#2a2a2d] text-sm text-left">
              <thead className="bg-[#161618]">
                <tr>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Asset Name</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Category</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Current Location</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">Status</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400">AI Score (EEI)</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2d] bg-[#1c1c1f]">
                {items.map((eq) => (
                  <tr
                    key={eq._id}
                    onClick={() => navigate(`/equipment/${eq._id}`)}
                    className="hover:bg-[#222225] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-white">{eq.name}</td>
                    <td className="px-6 py-4 text-gray-300 capitalize">{eq.category || eq.type}</td>
                    <td className="px-6 py-4 text-gray-300">{eq.currentLocation?.siteName || eq.location || "Central Hub"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[eq.availability] || STATUS_STYLES.available}`}>
                        {eq.availability || "Available"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <EEIBadge score={eq.eeiScore || 80} showLabel={false} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/equipment/${eq._id}`)}
                          className="px-3 py-1 rounded text-xs font-semibold bg-[#2a2a2d] text-gray-300 hover:text-white transition-colors"
                        >
                          View
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => navigate(`/equipment/${eq._id}/edit`)}
                            className="px-3 py-1 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                          >
                            Edit
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