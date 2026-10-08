import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RequirementForm from "../../components/allocation/RequirementForm";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAllocation } from "../../hooks/useAllocation";

export default function CreateRequirement() {
  const navigate = useNavigate();
  const { getRecommendations } = useAllocation();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (requirement) => {
    setError("");
    setLoading(true);

    try {
      const response = await getRecommendations(
        requirement
      );

      const requestId =
        response?.requestId ||
        response?.request?._id ||
        response?.request?.id ||
        response?._id;

      if (!requestId) {
        throw new Error(
          "Allocation request was created, but no request ID was returned."
        );
      }

      navigate(
        `/allocation/recommendations/${requestId}`
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Smart Allocation could not be completed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-6 sm:py-8">
      <div className="mb-6 border-b border-[#2a2a2d] pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
          Smart Allocation
        </p>

        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Run Smart Allocation
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
          Define your project requirement once. EquipShare will
          evaluate the available fleet and generate the best
          equipment matches.
        </p>
      </div>

      {error && (
        <div className="mb-5">
          <ErrorMessage message={error} />
        </div>
      )}

      <RequirementForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}