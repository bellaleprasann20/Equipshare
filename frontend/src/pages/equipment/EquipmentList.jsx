import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EquipmentFilters from "../../components/equipment/EquipmentFilters";
import EquipmentTable from "../../components/equipment/EquipmentTable";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/common/Button";
import { useEquipment } from "../../hooks/useEquipment";

const PAGE_SIZE = 10;
const initialFilters = { search: "", type: "", location: "", availability: "" };

/**
 * Main equipment browsing page — filters + table + pagination.
 * Expects useEquipment() to expose:
 *   fetchEquipment({ filters, page, pageSize }) -> { items, totalCount }
 */
export default function EquipmentList() {
  const navigate = useNavigate();
  const { fetchEquipment } = useEquipment();

  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchEquipment({ filters, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotalCount(res.totalCount);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Failed to load equipment.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [filters, page, fetchEquipment]);

  // Reset to page 1 whenever filters change
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Equipment</h1>
        <Button onClick={() => navigate("/equipment/add")}>+ Add Equipment</Button>
      </div>

      <EquipmentFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={() => handleFiltersChange(initialFilters)}
      />

      {error && <ErrorMessage message={error} onRetry={() => setFilters({ ...filters })} />}

      {loading ? (
        <Loader label="Loading equipment..." />
      ) : (
        <>
          <EquipmentTable data={items} onRowClick={(eq) => navigate(`/equipment/${eq._id}`)} />
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
