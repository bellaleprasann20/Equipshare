import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import EEIBadge from "../../components/equipment/EEIBadge";
import EquipmentImage from "../../components/equipment/EquipmentImage";
import MaintenanceStatus from "../../components/equipment/MaintenanceStatus";
import ReviewList from "../../components/reviews/ReviewList";
import ReviewForm from "../../components/reviews/ReviewForm";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { useEquipment } from "../../hooks/useEquipment";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import {
  buyPrice,
  rentPerDay,
  formatINR,
} from "../../utils/pricing";

const BREAKDOWN_LABELS = {
  utilization: "Utilization",
  reliability: "Reliability",
  maintenance: "Maintenance",
  age: "Age",
  cost: "Cost efficiency",
};

function getStatusLabel(status) {
  const labels = {
    available: "Available",
    in_use: "In use",
    allocated: "Allocated",
    maintenance: "Maintenance",
    sold: "Sold",
  };

  return labels[status] || "Unknown";
}

function getLocation(equipment) {
  return (
    equipment?.currentLocation?.siteName ||
    equipment?.location ||
    "Location not available"
  );
}

export default function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    getById,
    submitReview,
    deleteEquipment,
    canReview,
    checkReviewEligibility,
  } = useEquipment();

  const { items: cartItems, addItem } = useCart();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("rent");
  const [days, setDays] = useState(7);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    let cancelled = false;

    const loadEquipment = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getById(id);

        if (!cancelled) {
          setEquipment(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Failed to load equipment."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEquipment();

    if (!isAdmin) {
      checkReviewEligibility(id).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [
    id,
    getById,
    checkReviewEligibility,
    isAdmin,
  ]);

  const handleReviewSubmit = async (payload) => {
    setReviewLoading(true);
    setError("");

    try {
      const updated = await submitReview(payload);

      setEquipment((prev) => ({
        ...prev,
        ...updated,
        eeiScore: prev?.eeiScore,
        eeiBreakdown: prev?.eeiBreakdown,
      }));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to submit review."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await deleteEquipment(id);

      navigate("/admin/equipment");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete equipment."
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading equipment..." />;
  }

  if (error && !equipment) {
    return <ErrorMessage message={error} />;
  }

  if (!equipment) {
    return null;
  }

  const available =
    equipment.availability === "available";

  const cartEntry = cartItems.find(
    (item) => item.equipmentId === equipment._id
  );

  const inCart =
    !isAdmin &&
    cartEntry &&
    cartEntry.mode === mode;

  const total =
    mode === "buy"
      ? buyPrice(equipment)
      : rentPerDay(equipment) * days;

  const handleAdd = () => {
    if (inCart) {
      navigate("/cart");
      return;
    }

    addItem(equipment, mode, days);
  };

  const statusLabel = getStatusLabel(
    equipment.availability
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      {error && (
        <ErrorMessage message={error} />
      )}

      {/* Header */}
      <div>
        <p className="text-sm text-gray-500">
          {getLocation(equipment)}
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              {equipment.name}
            </h1>

            <p className="mt-1 text-sm capitalize text-gray-400">
              {equipment.category ||
                equipment.type ||
                "Equipment"}
            </p>
          </div>

          {isAdmin && (
            <span className="w-fit border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-400">
              Admin View
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-lg border border-[#2a2a2d] bg-[#1c1c1f]">
            <EquipmentImage
              src={equipment.imageUrl}
              alt={equipment.name}
              label={equipment.name?.charAt(0) || "E"}
              className="aspect-[4/3] w-full"
            />
          </div>

          {/* Metrics */}
          <div className="grid gap-px overflow-hidden rounded-lg border border-[#2a2a2d] bg-[#2a2a2d] sm:grid-cols-3">
            <Metric
              label="Utilization / 30d"
              value={`${equipment.utilizationRate ?? 0}%`}
            />

            <Metric
              label="Idle Hours / 30d"
              value={equipment.idleHoursLast30Days ?? 0}
            />

            <Metric
              label="Breakdowns"
              value={equipment.breakdownCount ?? 0}
            />
          </div>

          {/* EEI breakdown */}
          {equipment.eeiBreakdown && (
            <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-5">
              <h2 className="mb-5 font-display text-lg font-bold text-white">
                Equipment Efficiency Index
              </h2>

              <div className="flex flex-col gap-4">
                {Object.entries(
                  BREAKDOWN_LABELS
                ).map(([key, label]) => {
                  const value = Math.round(
                    equipment.eeiBreakdown[key] ?? 0
                  );

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3"
                    >
                      <span className="w-32 shrink-0 text-sm text-gray-400">
                        {label}
                      </span>

                      <div className="h-1.5 flex-1 bg-[#2a2a2d]">
                        <div
                          className="h-full bg-[#8b5cf6]"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, value)
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="w-8 text-right font-mono text-sm text-white">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-6">
          {/* Status */}
          <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-5">
            <div className="flex flex-wrap items-center gap-4">
              <EEIBadge
                score={equipment.eeiScore}
              />

              <span
                className={
                  available
                    ? "text-sm font-semibold text-green-400"
                    : "text-sm text-gray-400"
                }
              >
                {statusLabel}
              </span>

              <MaintenanceStatus
                lastServiceDate={
                  equipment.lastServiceDate
                }
                recommendedIntervalDays={
                  equipment.maintenanceIntervalDays ||
                  90
                }
              />
            </div>
          </div>

          {/* Admin controls */}
          {isAdmin ? (
            <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-6">
              <p className="mb-5 text-sm text-gray-400">
                Manage this fleet asset from the administration
                panel.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/admin/equipment/${id}/edit`
                    )
                  }
                >
                  Edit Asset
                </Button>

                <Button
                  variant="danger"
                  onClick={() =>
                    setShowDelete(true)
                  }
                >
                  Delete Asset
                </Button>
              </div>
            </div>
          ) : (
            /* User rental/purchase panel */
            <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-6">
              <div className="flex border border-[#2a2a2d]">
                {["rent", "buy"].map((itemMode) => (
                  <button
                    key={itemMode}
                    type="button"
                    onClick={() =>
                      setMode(itemMode)
                    }
                    className={[
                      "flex-1 py-2.5 text-sm font-semibold transition-colors",
                      mode === itemMode
                        ? "bg-[#8b5cf6] text-white"
                        : "text-gray-400 hover:bg-[#222225] hover:text-white",
                    ].join(" ")}
                  >
                    {itemMode === "rent"
                      ? "Rent"
                      : "Buy"}
                  </button>
                ))}
              </div>

              <p className="mt-6 font-mono text-3xl font-semibold text-white">
                {formatINR(total)}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {mode === "rent"
                  ? `${days} ${
                      days === 1
                        ? "day"
                        : "days"
                    } at ${formatINR(
                      rentPerDay(equipment)
                    )} per day`
                  : "One-time purchase price"}
              </p>

              {mode === "rent" && (
                <label className="mt-5 flex items-center justify-between gap-3 text-sm text-gray-400">
                  Rental days

                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={days}
                    onChange={(e) =>
                      setDays(
                        Math.max(
                          1,
                          Math.min(
                            365,
                            Number(
                              e.target.value
                            ) || 1
                          )
                        )
                      )
                    }
                    className="w-24 border border-[#2a2a2d] bg-[#161618] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#8b5cf6]"
                  />
                </label>
              )}

              <div className="mt-6">
                <Button
                  fullWidth
                  size="lg"
                  variant={
                    inCart
                      ? "outline"
                      : "primary"
                  }
                  disabled={!available}
                  onClick={handleAdd}
                >
                  {!available
                    ? statusLabel
                    : inCart
                    ? "In Cart — View Cart"
                    : "Add to Cart"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {!isAdmin && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold text-white">
            Reviews
          </h2>

          {canReview(id) && (
            <div className="mb-5">
              <ReviewForm
                equipmentId={id}
                onSubmit={handleReviewSubmit}
                loading={reviewLoading}
              />
            </div>
          )}

          <ReviewList
            reviews={equipment.reviews || []}
          />
        </section>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        title="Delete equipment"
        message="This permanently removes this machine from the system. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() =>
          setShowDelete(false)
        }
      />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-[#1c1c1f] p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-2 font-mono text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}