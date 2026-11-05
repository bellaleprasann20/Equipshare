import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import { useAllocation } from "../../hooks/useAllocation";

export default function Recommendations() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const { getResultsByRequestId } = useAllocation();

  const [recommendations, setRecommendations] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        // Fetch an existing allocation request.
        // Do NOT create another allocation here.
        const res = await getResultsByRequestId(requestId);

        if (cancelled) return;

        const items =
          res.results ||
          res.recommendations ||
          res.items ||
          [];

        setRequestDetails(res.request || {});
        setRecommendations(items);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Failed to fetch allocation recommendations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [requestId, getResultsByRequestId]);

  if (loading) {
    return (
      <Loader label="Loading equipment recommendations..." />
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorMessage message={error} />

        <div className="mt-5">
          <Button
            variant="outline"
            onClick={() => navigate("/allocation")}
          >
            Back to Smart Allocation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a2a2d] pb-6">
        <div>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
            Smart Ranking Complete
          </span>

          <h1 className="font-display text-3xl font-bold text-white">
            Smart Allocation Shortlist
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Recommendations for:{" "}
            <span className="font-medium text-white">
              {requestDetails?.projectLocation || "Project location"}
            </span>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/allocation")}
          className="border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d]"
        >
          Modify Requirement
        </Button>
      </div>

      {error && (
        <div className="rounded-md border-l-4 border-red-500 bg-red-950/50 p-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Results count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Ranked Equipment
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            {recommendations.length} suitable equipment item(s) found.
          </p>
        </div>

        <span className="rounded-md border border-[#2a2a2d] bg-[#1c1c1f] px-3 py-2 text-xs text-gray-300">
          EEI + Distance + Cost + Duration
        </span>
      </div>

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-8 text-center">
          <h3 className="font-semibold text-white">
            No suitable equipment found
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Try changing the equipment type, transfer distance,
            dates or minimum EEI score.
          </p>

          <Button
            className="mt-5"
            onClick={() => navigate("/allocation")}
          >
            Modify Requirement
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {recommendations.map((rec, index) => {
            const equipment = rec.equipment || {};

            const equipmentId = String(
              equipment._id ||
                rec.equipmentId ||
                rec._id ||
                index
            );

            const eeiScore =
              rec.scoreBreakdown?.eei ??
              equipment.eeiScore ??
              null;

            const allocationScore =
              rec.allocationScore ?? null;

            const distance =
              rec.transferDistanceKm ?? null;

            const transferCost =
              rec.transferCost ?? null;

            return (
              <div
                key={equipmentId}
                className="panel rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-6 transition-all hover:border-gray-500"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex min-w-0 items-start gap-4">
                    {/* Rank */}
                    <div
                      className={[
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-mono text-lg font-bold",
                        index === 0
                          ? "bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20"
                          : "border border-[#2a2a2d] bg-[#222225] text-gray-300",
                      ].join(" ")}
                    >
                      #{rec.rank ?? index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-xl font-bold text-white">
                          {equipment.name || "Unnamed equipment"}
                        </h3>

                        {index === 0 && (
                          <span className="rounded border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-400">
                            Top Ranked
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-400">
                        {equipment.type || "Equipment"} · Current location:{" "}
                        <span className="font-medium text-gray-200">
                          {equipment.currentLocation?.siteName ||
                            equipment.location ||
                            "Not available"}
                        </span>
                      </p>

                      {/* Equipment metrics */}
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#2a2a2d] pt-4 text-xs text-gray-400">
                        <div>
                          <p>Transfer Distance</p>
                          <p className="mt-1 font-mono font-bold text-white">
                            {distance !== null
                              ? `${distance} km`
                              : "Not available"}
                          </p>
                        </div>

                        <div>
                          <p>Transfer Cost</p>
                          <p className="mt-1 font-mono font-bold text-white">
                            {transferCost !== null
                              ? `₹${Number(transferCost).toLocaleString("en-IN")}`
                              : "Not available"}
                          </p>
                        </div>

                        <div>
                          <p>Breakdown Count</p>
                          <p className="mt-1 font-mono font-bold text-white">
                            {equipment.breakdownCount ?? "Not available"}
                          </p>
                        </div>
                      </div>

                      {/* Score breakdown */}
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          ["EEI", rec.scoreBreakdown?.eei],
                          ["Proximity", rec.scoreBreakdown?.distance],
                          ["Cost", rec.scoreBreakdown?.cost],
                          ["Duration", rec.scoreBreakdown?.durationFit],
                        ].map(([label, score]) => (
                          <div
                            key={label}
                            className="rounded-md border border-[#2a2a2d] bg-[#161618] p-3"
                          >
                            <p className="text-[10px] uppercase tracking-wider text-gray-500">
                              {label}
                            </p>

                            <p className="mt-1 font-mono text-sm font-bold text-white">
                              {score !== undefined && score !== null
                                ? `${score}/100`
                                : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex min-w-[140px] flex-col items-end gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Equipment Efficiency Index
                      </p>

                      <p className="mt-1 font-mono text-2xl font-bold text-[#a78bfa]">
                        {eeiScore !== null
                          ? `${eeiScore}/100`
                          : "Not available"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Overall Allocation Score
                      </p>

                      <p className="mt-1 font-mono text-xl font-bold text-white">
                        {allocationScore !== null
                          ? `${allocationScore}/100`
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin review information */}
      {recommendations.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#2a2a2d] pt-6">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Recommendations generated successfully
            </h3>

            <p className="mt-1 max-w-xl text-xs text-gray-400">
              These results are ranked suggestions. An administrator
              will review the recommended equipment and approve the
              final allocation.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/allocation/history")}
            className="border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d]"
          >
            View Allocation History
          </Button>
        </div>
      )}
    </div>
  );
}