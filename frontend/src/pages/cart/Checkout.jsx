import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";
import { rentPerDay, lineTotal, formatINR } from "../../utils/pricing";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";

const PAYMENT_METHODS = [
  { value: "cod", label: "Pay on delivery or on site" },
  { value: "bank", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clear } = useCart();

  const [form, setForm] = useState({
    contactName: user?.name || "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.contactName.trim()) errs.contactName = "Enter the contact name";
    if (form.phone.replace(/\D/g, "").length < 10) errs.phone = "Enter a phone number with at least 10 digits";
    if (!form.address.trim()) errs.address = "Enter the delivery address or site";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setSubmitting(true);
    try {
      const order = await createOrder({ items, ...form });
      setPlaced(order);
      clear();
    } catch (err) {
      setApiError(err?.response?.data?.message || "Could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Order confirmed</h1>
        <p className="mt-3 text-steel">
          Reference <span className="font-mono text-ink">#{placed._id.slice(-6).toUpperCase()}</span> for{" "}
          <span className="font-mono text-ink">{formatINR(placed.total)}</span>.
        </p>
        <p className="mt-2 text-sm text-steel">
          Rented machines are now marked in use and purchased machines are marked sold. You can cancel
          this order from My orders.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate("/orders")}>View my orders</Button>
          <Button variant="outline" onClick={() => navigate("/equipment?mode=rent")}>
            Keep browsing
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Nothing to check out</h1>
        <p className="mt-2 text-steel">Your cart is empty.</p>
        <div className="mt-6">
          <Button onClick={() => navigate("/equipment?mode=rent")}>Browse equipment</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-bold text-ink">Checkout</h1>

        {apiError && (
          <div>
            <ErrorMessage message={apiError} />
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="mt-2 text-sm font-medium text-signal hover:text-signal-dark"
            >
              Back to cart
            </button>
          </div>
        )}

        <div className="panel flex flex-col gap-4 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Contact and delivery</h2>
          <Input
            label="Contact name"
            name="contactName"
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            error={errors.contactName}
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            placeholder="10 digit mobile number"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            error={errors.phone}
            required
          />
          <Input
            label="Delivery address or site"
            name="address"
            placeholder="Site name, road, area, city"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            error={errors.address}
            required
          />
        </div>

        <div className="panel flex flex-col gap-3 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Payment method</h2>
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.value}
              className={[
                "flex cursor-pointer items-center gap-3 border p-3 text-sm",
                form.paymentMethod === m.value ? "border-signal bg-paper" : "border-line",
              ].join(" ")}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={m.value}
                checked={form.paymentMethod === m.value}
                onChange={() => update("paymentMethod", m.value)}
              />
              {m.label}
            </label>
          ))}
          <p className="text-xs text-steel">
            Payments are simulated in this project. No money is charged and no card details are collected.
          </p>
        </div>
      </div>

      <div>
        <div className="panel sticky top-32 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Your order</h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((item) => (
              <li key={item.equipmentId} className="flex justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-steel">
                    {item.mode === "rent"
                      ? `Rent, ${item.days} days at ${formatINR(rentPerDay(item))}`
                      : "Purchase"}
                  </p>
                </div>
                <span className="font-mono text-ink">{formatINR(lineTotal(item))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-steel">Total</span>
            <span className="font-mono text-2xl font-semibold text-ink">{formatINR(total)}</span>
          </div>
          <div className="mt-5">
            <Button type="submit" fullWidth size="lg" loading={submitting}>
              Place order
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}