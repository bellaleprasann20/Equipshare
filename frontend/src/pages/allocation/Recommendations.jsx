import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecommendationCard from "../../components/allocation/RecommendationCard";
import RankingTable from "../../components/allocation/RankingTable";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { useAllocation } from "../../hooks/useAllocation";

/**
 * Shows the ranked recommendation results for a given requirement
 * (requestId from the URL, created by CreateRequirement). Lets
 * the user toggle between card view (detailed, explainable) and
 * table view (dense, scan-many-at-once), and confirm an allocation.
 *
 * Expects useAllocation() to expose:
 *   getResultsByRequestId(requestId) -> Promise<{ requirement, results }>
 *   confirmAllocation({ requestId, equipmentId }) -> Promise<AllocationRecord>
 */
export default function Recommendations() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { getResultsByRequestId, confirmAllocation } = useAllocation();

  const [requirement, setRequirement] = useState(null);
  const [results, setResults] = useState([]);
  const [view, setView] = useState("cards"); // "cards" | "table"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setLoading(true);
    getResultsByRequestId(requestId)
      .then((res) => {
        setRequirement(res.requirement);
        setResults(res.results);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load recommendations."))
      .finally(() => setLoading(false));
  }, [requestId, getResultsByRequestId]);

  const handleSelect = async (result) => {
    setError("");
    setConfirming(true);
    try {
      await confirmAllocation({ requestId, equipmentId: result.equipment._id });
      navigate("/allocation/history");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to confirm allocation.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <Loader label="Ranking equipment for your requirement..." />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Recommended Equipment</h1>
          {requirement && (
            <p className="text-sm text-gray-500">
              {requirement.equipmentType} · {requirement.projectLocation} ·{" "}
              {requirement.requiredFrom} to {requirement.requiredTo}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === "cards" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("cards")}
          >
            Cards
          </Button>
          <Button
            variant={view === "table" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            Table
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {results.length === 0 ? (
        <EmptyState
          title="No matching equipment found"
          description="Try widening your max transfer distance or choosing a different date range."
          actionLabel="New Requirement"
          onAction={() => navigate("/allocation")}
        />
      ) : view === "cards" ? (
        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <RecommendationCard key={r.equipment._id} result={r} onSelect={handleSelect} />
          ))}
        </div>
      ) : (
        <RankingTable results={results} onSelect={handleSelect} />
      )}

      {confirming && <p className="text-sm text-gray-500">Confirming allocation...</p>}
    </div>
  );
}
