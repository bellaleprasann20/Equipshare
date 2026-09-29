import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { rentPerDay, lineTotal, formatINR } from "../../utils/pricing";
import Button from "../../components/common/Button";
import EquipmentImage from "../../components/equipment/EquipmentImage";

function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex border border-line">
      {["rent", "buy"].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={[
            "px-4 py-1.5 text-sm font-medium",
            mode === m ? "bg-ink text-white" : "text-steel hover:text-ink",
          ].join(" ")}
        >
          {m === "rent" ? "Rent" : "Buy"}
        </button>
      ))}
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { items, total, removeItem, updateItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-steel">Add machines from the Rent or Buy pages.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate("/equipment?mode=rent")}>Rent equipment</Button>
          <Button variant="outline" onClick={() => navigate("/equipment?mode=buy")}>
            Buy equipment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold text-ink">
        Your cart <span className="font-mono text-xl text-steel">({items.length})</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          {items.map((item) => (
            <div key={item.equipmentId} className="panel flex gap-4 p-4">
              <EquipmentImage
                src={item.imageUrl}
                alt={item.name}
                label={item.name.split(" ")[0]}
                className="h-24 w-32 shrink-0"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{item.name}</h3>
                    <p className="text-sm text-steel">{item.location}</p>
                  </div>
                  <p className="font-mono text-xl font-semibold text-ink">{formatINR(lineTotal(item))}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3">
                  <ModeToggle mode={item.mode} onChange={(mode) => updateItem(item.equipmentId, { mode })} />

                  {item.mode === "rent" ? (
                    <label className="flex items-center gap-2 text-sm text-steel">
                      Days
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={item.days}
                        onChange={(e) =>
                          updateItem(item.equipmentId, {
                            days: Math.max(1, Math.min(365, Number(e.target.value) || 1)),
                          })
                        }
                        className="w-20 border border-line px-2 py-1 font-mono text-sm text-ink focus:border-signal focus:outline-none"
                      />
                      <span className="font-mono">at {formatINR(rentPerDay(item))} per day</span>
                    </label>
                  ) : (
                    <span className="text-sm text-steel">One-time purchase price</span>
                  )}

                  <button
                    onClick={() => removeItem(item.equipmentId)}
                    className="ml-auto text-sm text-steel hover:text-signal"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="panel sticky top-32 p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Summary</h2>
            <div className="mt-4 flex items-baseline justify-between border-b border-line pb-4">
              <span className="text-sm text-steel">Total</span>
              <span className="font-mono text-2xl font-semibold text-ink">{formatINR(total)}</span>
            </div>
            <div className="mt-5">
              <Button fullWidth size="lg" onClick={() => navigate("/checkout")}>
                Proceed to checkout
              </Button>
            </div>
            <button
              onClick={() => navigate("/equipment?mode=rent")}
              className="mt-3 w-full text-center text-sm text-steel hover:text-signal"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}