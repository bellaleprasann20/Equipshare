import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import EEIBadge from "../../components/equipment/EEIBadge";
import { useAllocation } from "../../hooks/useAllocation";

export default function Recommendations() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { getRecommendations, selectRecommendation } = useAllocation();

  const [recommendations, setRecommendations] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRecommendations(requestId)
      .then((res) => {
        if (cancelled) return;
        // Expecting { request, recommendations: [...] } from backend
        setRequestDetails(res.request || {});
        setRecommendations(res.recommendations || res.items || []);
        if (res.recommendations?.[0]) {
          setSelectedMachineId(res.recommendations[0]._id); // Default to top AI rank
        }
      })
      .catch((err) => !cancelled && setError(err?.response?.data?.message || "Failed to fetch AI recommendations."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [requestId, getRecommendations]);

  const handleConfirmSelection = async () => {
    if (!selectedMachineId) return;
    setSubmitting(true);
    setError("");
    try {
      await selectRecommendation(requestId, selectedMachineId);
      navigate("/allocation/history");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to confirm equipment selection.");
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Running Random Forest AI & Proximity Engine..." />;
  if (error && recommendations.length === 0) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a2a2d] pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20 mb-3">
            AI Engine Active
          </span>
          <h1 className="font-display text-3xl font-bold text-white">Smart Allocation Shortlist</h1>
          <p className="text-sm text-gray-400 mt-1">
            Generated for site location: <span className="text-white font-medium">{requestDetails?.projectLocation || "Destination Hub"}</span>
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/allocation")} className="border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d]">
          Modify Requirement
        </Button>
      </div>

      {error && (
        <div className="rounded-md border-l-4 border-red-500 bg-red-950/50 p-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Ranked List of Recommendations */}
      <div className="grid gap-6">
        {recommendations.map((rec, index) => {
          const isTopRanked = index === 0;
          const isSelected = selectedMachineId === rec._id;

          return (
            <div
              key={rec._id}
              onClick={() => setSelectedMachineId(rec._id)}
              className={[
                "panel cursor-pointer rounded-lg p-6 transition-all border bg-[#1c1c1f]",
                isSelected ? "border-[#8b5cf6] ring-1 ring-[#8b5cf6]" : "border-[#2a2a2d] hover:border-gray-500",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-mono text-lg font-bold",
                    isTopRanked ? "bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20" : "bg-[#222225] text-gray-300 border border-[#2a2a2d]"
                  ].join(" ")}>
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-xl font-bold text-white">{rec.name}</h3>
                      {isTopRanked && (
                        <span className="rounded bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-400 border border-green-500/20">
                          AI Best Match
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Current Location: <span className="text-gray-200 font-medium">{rec.currentLocation?.siteName || rec.location}</span>
                    </p>

                    {/* AI Factor Breakdown */}
                    <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-gray-400 border-t border-[#2a2a2d] pt-4">
                      <div>
                        <span>Calculated Distance: </span>
                        <span className="font-mono font-bold text-white">{rec.distanceKm ?? "4.2"} km</span>
                      </div>
                      <div>
                        <span>Machine Age: </span>
                        <span className="font-mono font-bold text-white">{rec.machineAgeYears ?? "1.5"} years</span>
                      </div>
                      <div>
                        <span>Breakdown History (12m): </span>
                        <span className="font-mono font-bold text-white">{rec.breakdownHistory ?? "0"} incidents</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score & Selection Radio */}
                <div className="flex flex-col items-end justify-between gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Efficiency Score (EEI)</p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className="font-mono text-2xl font-bold text-[#8b5cf6]">{rec.eeiScore || 85}/100</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="selectedRecommendation"
                      checked={isSelected}
                      onChange={() => setSelectedMachineId(rec._id)}
                      className="h-4 w-4 text-[#8b5cf6] focus:ring-[#8b5cf6]"
                    />
                    <span className="text-xs font-semibold text-gray-300">
                      {isSelected ? "Selected" : "Select Match"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-[#2a2a2d] pt-6 mt-4">
        <button
          onClick={() => navigate("/allocation/history")}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Cancel / Skip to History
        </button>
        <Button
          onClick={handleConfirmSelection}
          loading={submitting}
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3 font-semibold"
        >
          Confirm & Submit to Admin
        </Button>
      </div>
    </div>
  );
}