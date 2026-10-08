import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";
import { rentPerDay, lineTotal, formatINR } from "../../utils/pricing";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";

const ALLOCATION_TYPES = [
  {
    value: "internal",
    label: "Internal Fleet Transfer",
  },
  {
    value: "urgent",
    label: "Urgent Site Deployment",
  },
  {
    value: "scheduled",
    label: "Scheduled Project Deployment",
  },
];

function getOrderId(order) {
  return order?._id || order?.id || order?.orderId || null;
}

function getOrderTotal(order, fallbackTotal) {
  const value = Number(order?.total);

  return Number.isFinite(value) ? value : fallbackTotal;
}

export default function Checkout() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { items, total, clear } = useCart();

  const [form, setForm] = useState({
    contactName: user?.name || "",
    phone: "",
    address: "",
    allocationType: "internal",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    const contactName = form.contactName.trim();
    const phoneDigits = form.phone.replace(/\D/g, "");
    const address = form.address.trim();

    if (!contactName) {
      nextErrors.contactName = "Enter the site contact name";
    }

    if (phoneDigits.length !== 10) {
      nextErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!address) {
      nextErrors.address = "Enter the destination site location";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!validate()) return;

    setApiError("");
    setSubmitting(true);

    try {
      const order = await createOrder({
        items,
        contactName: form.contactName.trim(),
        phone: form.phone.replace(/\D/g, ""),
        address: form.address.trim(),
        allocationType: form.allocationType,
        paymentMethod: "internal_budget",
      });

      setPlaced(order);
      clear();
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not submit the allocation request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Success state
   */
  if (placed) {
    const orderId = getOrderId(placed);
    const orderTotal = getOrderTotal(placed, total);

    return (
      <div className="mx-auto mt-10 w-full max-w-xl px-4">
        <div className="panel rounded-xl border border-line bg-surface p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal/10 text-signal">
            ✓
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-signal">
            Smart Allocation
          </p>

          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Request Submitted
          </h1>

          <p className="mt-3 text-sm leading-6 text-steel">
            Your selected equipment has been submitted to Fleet Admin for
            review. No equipment is reserved until the request is approved.
          </p>

          <div className="mt-5 rounded-lg border border-line bg-paper p-4 text-left">
            {orderId && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-steel">
                  Reference ID
                </span>

                <span className="font-mono text-sm font-semibold text-ink">
                  #{String(orderId).slice(-6).toUpperCase()}
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-steel">
                Estimated Budget
              </span>

              <span className="font-mono text-sm font-semibold text-ink">
                {formatINR(orderTotal)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-steel">
                Status
              </span>

              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                Pending Admin Approval
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => navigate("/orders")}>
              View My Orders
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/allocation/history")}
            >
              Allocation History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Empty cart
   */
  if (items.length === 0) {
    return (
      <div className="mx-auto mt-10 w-full max-w-xl px-4">
        <div className="panel rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-steel">
            Allocation
          </p>

          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            No equipment selected
          </h1>

          <p className="mt-2 text-sm leading-6 text-steel">
            Select an equipment recommendation before submitting an allocation
            request.
          </p>

          <div className="mt-6">
            <Button onClick={() => navigate("/allocation")}>
              Run Smart Allocation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Checkout
   */
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:py-8 lg:grid-cols-[1fr_360px]"
    >
      {/* Left */}
      <div className="flex flex-col gap-6">
        <div className="border-b border-line pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-signal">
            Smart Allocation
          </p>

          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Submit Allocation Request
          </h1>

          <p className="mt-2 text-sm leading-6 text-steel">
            Provide the destination and site contact information required for
            Fleet Admin review.
          </p>
        </div>

        {apiError && (
          <div>
            <ErrorMessage message={apiError} />

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="mt-2 text-sm font-medium text-signal transition-colors hover:opacity-80"
            >
              Back to selected equipment
            </button>
          </div>
        )}

        {/* Contact information */}
        <section className="panel rounded-xl border border-line bg-surface p-6">
          <div className="mb-5 border-b border-line pb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-steel">
              Site Details
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold text-ink">
              Contact & Destination
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Site Supervisor Name"
              name="contactName"
              value={form.contactName}
              onChange={(event) =>
                update("contactName", event.target.value)
              }
              error={errors.contactName}
              required
            />

            <Input
              label="Supervisor Mobile Number"
              name="phone"
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(event) =>
                update("phone", event.target.value)
              }
              error={errors.phone}
              required
            />

            <Input
              label="Destination Site"
              name="address"
              placeholder="e.g. Site C - Yelahanka, Bengaluru"
              value={form.address}
              onChange={(event) =>
                update("address", event.target.value)
              }
              error={errors.address}
              required
            />
          </div>
        </section>

        {/* Deployment type */}
        <section className="panel rounded-xl border border-line bg-surface p-6">
          <div className="mb-5 border-b border-line pb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-steel">
              Deployment
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold text-ink">
              Deployment Type
            </h2>
          </div>

          <div className="space-y-3">
            {ALLOCATION_TYPES.map((option) => {
              const selected =
                form.allocationType === option.value;

              return (
                <label
                  key={option.value}
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-colors",
                    selected
                      ? "border-signal bg-signal/5 text-ink"
                      : "border-line text-steel hover:border-signal/40",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="allocationType"
                    value={option.value}
                    checked={selected}
                    onChange={() =>
                      update("allocationType", option.value)
                    }
                    className="accent-signal"
                  />

                  <span className={selected ? "font-medium" : ""}>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>

          <p className="mt-4 text-xs leading-5 text-steel">
            Fleet Admin will review the deployment details before approving
            the equipment request.
          </p>
        </section>
      </div>

      {/* Right */}
      <aside>
        <div className="panel sticky top-24 rounded-xl border border-line bg-surface p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-signal">
            Request Summary
          </p>

          <h2 className="mt-1 font-display text-xl font-semibold text-ink">
            Selected Equipment
          </h2>

          <div className="mt-5 rounded-lg border border-line bg-paper p-4">
            {items.map((item) => (
              <div
                key={item.equipmentId}
                className="flex justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.name || "Equipment"}
                  </p>

                  <p className="mt-1 text-xs text-steel">
                    {item.days || 1} days allocation
                  </p>

                  <p className="mt-1 text-xs text-steel">
                    {formatINR(rentPerDay(item))} / day
                  </p>
                </div>

                <span className="shrink-0 font-mono text-sm font-semibold text-ink">
                  {formatINR(lineTotal(item))}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <div className="flex items-end justify-between gap-4">
              <span className="text-sm font-medium text-steel">
                Estimated Budget
              </span>

              <span className="font-mono text-2xl font-bold text-ink">
                {formatINR(total)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
            >
              Submit to Admin
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="mt-4 w-full text-center text-sm font-medium text-steel transition-colors hover:text-signal"
          >
            Back to selected equipment
          </button>
        </div>
      </aside>
    </form>
  );
}