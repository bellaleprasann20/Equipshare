import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { buyPrice, rentPerDay, formatINR } from "../../utils/pricing";

const BREAKDOWN_LABELS = {
  utilization: "Utilization",
  reliability: "Reliability",
  maintenance: "Maintenance",
  age: "Age",
  cost: "Cost efficiency",
};

export default function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getById, submitReview, deleteEquipment, canReview, checkReviewEligibility } = useEquipment();
  const { items: cartItems, addItem } = useCart();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("rent");
  const [days, setDays] = useState(7);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getById(id)
      .then(setEquipment)
      .catch((err) => setError(err?.response?.data?.message || "Failed to load equipment."))
      .finally(() => setLoading(false));
    checkReviewEligibility(id).catch(() => {});
  }, [id, getById, checkReviewEligibility]);

  const handleReviewSubmit = async (payload) => {
    setReviewLoading(true);
    try {
      const updated = await submitReview(payload);
      setEquipment((prev) => ({
        ...prev,
        ...updated,
        eeiScore: prev.eeiScore,
        eeiBreakdown: prev.eeiBreakdown,
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEquipment(id);
      navigate("/equipment");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete equipment.");
      setDeleting(false);
    }
  };

  if (loading) return <Loader label="Loading equipment..." />;
  if (error && !equipment) return <ErrorMessage message={error} />;
  if (!equipment) return null;

  const isAdmin = user?.role === "admin";
  const available = equipment.availability === "available";
  const cartEntry = cartItems.find((c) => c.equipmentId === equipment._id);
  const inCart = cartEntry && cartEntry.mode === mode;
  const total = mode === "buy" ? buyPrice(equipment) : rentPerDay(equipment) * days;

  const handleAdd = () => {
    if (inCart) navigate("/cart");
    else addItem(equipment, mode, days);
  };

  const statusLabel = { available: "Available", in_use: "In use", sold: "Sold" }[equipment.availability];

  return (
    <div className="flex flex-col gap-8">
      {error && <ErrorMessage message={error} />}

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Left: photo and facts */}
        <div className="flex flex-col gap-6">
          <div className="panel overflow-hidden">
            <EquipmentImage
              src={equipment.imageUrl}
              alt={equipment.name}
              label={equipment.name.split(" ")[0]}
              className="aspect-[4/3] w-full"
            />
          </div>

          <div className="panel grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs text-steel">Utilization, 30 days</p>
              <p className="font-mono text-2xl font-semibold text-ink">{equipment.utilizationRate ?? 0}%</p>
            </div>
            <div>
              <p className="text-xs text-steel">Idle hours, 30 days</p>
              <p className="font-mono text-2xl font-semibold text-ink">{equipment.idleHoursLast30Days ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-steel">Breakdowns</p>
              <p className="font-mono text-2xl font-semibold text-ink">{equipment.breakdownCount ?? 0}</p>
            </div>
          </div>

          {equipment.eeiBreakdown && (
            <div className="panel p-5">
              <h2 className="mb-4 font-display text-base font-semibold text-ink">Why this EEI score</h2>
              <div className="flex flex-col gap-3">
                {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => {
                  const value = Math.round(equipment.eeiBreakdown[key] ?? 0);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-sm text-steel">{label}</span>
                      <div className="h-1.5 flex-1 bg-line">
                        <div className="h-full bg-blueprint" style={{ width: `${Math.min(100, value)}%` }} />
                      </div>
                      <span className="w-8 text-right font-mono text-sm text-ink">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: title and purchase panel */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-steel">{equipment.location}</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">{equipment.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <EEIBadge score={equipment.eeiScore} />
              <span className={available ? "text-sm font-medium text-green-700" : "text-sm text-steel"}>
                {statusLabel}
              </span>
              <MaintenanceStatus
                lastServiceDate={equipment.lastServiceDate}
                recommendedIntervalDays={equipment.maintenanceIntervalDays || 90}
              />
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex border border-line">
              {["rent", "buy"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={[
                    "flex-1 py-2 text-sm font-semibold",
                    mode === m ? "bg-ink text-white" : "text-steel hover:text-ink",
                  ].join(" ")}
                >
                  {m === "rent" ? "Rent" : "Buy"}
                </button>
              ))}
            </div>

            <p className="mt-5 font-mono text-3xl font-semibold text-ink">{formatINR(total)}</p>
            <p className="mt-1 text-sm text-steel">
              {mode === "rent"
                ? `${days} ${days === 1 ? "day" : "days"} at ${formatINR(rentPerDay(equipment))} per day`
                : "One-time purchase price"}
            </p>

            {mode === "rent" && (
              <label className="mt-4 flex items-center gap-3 text-sm text-steel">
                Rental days
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
                  className="w-24 border border-line px-2 py-1.5 font-mono text-sm text-ink focus:border-signal focus:outline-none"
                />
              </label>
            )}

            <div className="mt-6">
              <Button fullWidth size="lg" variant={inCart ? "outline" : "primary"} disabled={!available} onClick={handleAdd}>
                {!available ? statusLabel : inCart ? "In cart, view cart" : "Add to cart"}
              </Button>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(`/equipment/${id}/edit`)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => setShowDelete(true)}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-ink">Reviews</h2>
        {canReview(id) && (
          <div className="mb-4">
            <ReviewForm equipmentId={id} onSubmit={handleReviewSubmit} loading={reviewLoading} />
          </div>
        )}
        <ReviewList reviews={equipment.reviews || []} />
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete equipment"
        message="This permanently removes this machine from the system. It cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}