import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RequirementForm from "../../components/allocation/RequirementForm";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAllocation } from "../../hooks/useAllocation";

/**
 * Entry point for the allocation flow: project manager fills
 * in requirements -> POST /api/allocate -> backend runs
 * eeiCalculator + allocationService -> ranked results are
 * stored in state/context and the user is routed to
 * /allocation/recommendations to view them.
 *
 * Expects useAllocation() to expose:
 *   getRecommendations(requirement) -> Promise<{ requestId, results }>
 */
export default function CreateRequirement() {
  const navigate = useNavigate();
  const { getRecommendations } = useAllocation();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (requirement) => {
    setError("");
    setLoading(true);
    try {
      const { requestId } = await getRecommendations(requirement);
      navigate(`/allocation/recommendations/${requestId}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to get recommendations. Please check your requirement details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-semibold text-gray-900">New Equipment Requirement</h1>
      <p className="mb-4 text-sm text-gray-500">
        Fill in your project's requirement — we'll rank the best available equipment for you.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <RequirementForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
