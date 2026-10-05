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
  { value: "internal", label: "Internal Fleet Transfer (Recommended)" },
  { value: "urgent", label: "Emergency Site Deployment" },
  { value: "scheduled", label: "Scheduled Long-Term Project" },
];

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

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.contactName.trim()) errs.contactName = "Enter site contact name";
    if (form.phone.replace(/\D/g, "").length < 10) errs.phone = "Enter a valid 10-digit mobile number";
    if (!form.address.trim()) errs.address = "Enter destination site name and location";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setSubmitting(true);
    try {
      // Mapping the payload to backend order service while maintaining expected fields
      const order = await createOrder({ items, ...form, paymentMethod: "internal_budget" });
      setPlaced(order);
      clear();
    } catch (err) {
      setApiError(err?.response?.data?.message || "Could not submit requirement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center bg-surface border border-line rounded-lg mt-10">
        <h1 className="font-display text-3xl font-bold text-ink">Requirement Submitted</h1>
        <p className="mt-3 text-steel">
          Reference ID <span className="font-mono text-ink">#{placed._id.slice(-6).toUpperCase()}</span> for{" "}
          <span className="font-mono text-ink">{formatINR(placed.total)}</span> estimated budget allocation.
        </p>
        <p className="mt-2 text-sm text-steel">
          Your request has been routed to the Fleet Admin's approval queue. No assets are reserved until reviewed and dispatched.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate("/orders")}>View My Allocation History</Button>
          <Button variant="outline" onClick={() => navigate("/equipment")}>
            Browse Equipment Catalog
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center bg-surface border border-line rounded-lg mt-10">
        <h1 className="font-display text-3xl font-bold text-ink">No Machinery Selected</h1>
        <p className="mt-2 text-steel">Your allocation draft is empty.</p>
        <div className="mt-6">
          <Button onClick={() => navigate("/equipment")}>Browse Equipment Catalog</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px] max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Finalize Allocation Request</h1>
          <p className="text-sm text-steel mt-1">Provide site contact details and deployment parameters for admin review.</p>
        </div>

        {apiError && (
          <div>
            <ErrorMessage message={apiError} />
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="mt-2 text-sm font-medium text-signal hover:text-signal-dark"
            >
              Back to allocation draft
            </button>
          </div>
        )}

        <div className="panel flex flex-col gap-4 p-6 bg-surface border border-line rounded-lg">
          <h2 className="font-display text-lg font-semibold text-ink border-b border-line pb-3">Site & Contact Information</h2>
          <Input
            label="Site Supervisor Name"
            name="contactName"
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            error={errors.contactName}
            required
          />
          <Input
            label="Supervisor Mobile Number"
            name="phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            error={errors.phone}
            required
          />
          <Input
            label="Destination Site Location"
            name="address"
            placeholder="e.g. Site C - Yelahanka Hub, Bengaluru"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            error={errors.address}
            required
          />
        </div>

        <div className="panel flex flex-col gap-3 p-6 bg-surface border border-line rounded-lg">
          <h2 className="font-display text-lg font-semibold text-ink border-b border-line pb-3">Deployment Priority</h2>
          {ALLOCATION_TYPES.map((m) => (
            <label
              key={m.value}
              className={[
                "flex cursor-pointer items-center gap-3 border p-3.5 text-sm rounded transition-colors",
                form.allocationType === m.value ? "border-signal bg-paper text-ink font-medium" : "border-line text-steel",
              ].join(" ")}
            >
              <input
                type="radio"
                name="allocationType"
                value={m.value}
                checked={form.allocationType === m.value}
                onChange={() => update("allocationType", m.value)}
              />
              {m.label}
            </label>
          ))}
          <p className="text-xs text-steel mt-1">
            Note: All machinery requests are charged internally against your project budget allocation code.
          </p>
        </div>
      </div>

      <div>
        <div className="panel sticky top-28 p-6 bg-surface border border-line rounded-lg shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink border-b border-line pb-3">Request Summary</h2>
          <ul className="mt-4 divide-y divide-line max-h-60 overflow-y-auto">
            {items.map((item) => (
              <li key={item.equipmentId} className="flex justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-steel">
                    {item.days} days allocation at {formatINR(rentPerDay(item))} / day
                  </p>
                </div>
                <span className="font-mono font-medium text-ink">{formatINR(lineTotal(item))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm font-medium text-steel">Est. Budget Total</span>
            <span className="font-mono text-2xl font-bold text-ink">{formatINR(total)}</span>
          </div>
          <div className="mt-6">
            <Button type="submit" fullWidth size="lg" loading={submitting} className="bg-signal text-white py-3">
              Submit to Admin Queue
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}