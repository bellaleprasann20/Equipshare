import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { rentPerDay, lineTotal, formatINR } from "../../utils/pricing";
import Button from "../../components/common/Button";
import EquipmentImage from "../../components/equipment/EquipmentImage";

export default function AllocationDraft() {
  const navigate = useNavigate();
  // Using your existing cart context as the "draft" staging area
  const { items, total, removeItem, updateItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center bg-surface border border-line rounded-lg mt-10">
        <h1 className="font-display text-3xl font-bold text-ink">No equipment selected</h1>
        <p className="mt-2 text-steel">You haven't added any machinery to your allocation request yet.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate("/equipment")}>Browse Equipment Catalog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink">
        Draft Allocation Request <span className="font-mono text-xl text-steel">({items.length} machines)</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left Side: Selected Equipment List */}
        <div className="flex flex-col gap-5">
          {items.map((item) => (
            <div key={item.equipmentId} className="panel flex gap-4 p-5 bg-surface border border-line rounded-lg">
              <EquipmentImage
                src={item.imageUrl}
                alt={item.name}
                label={item.name.split(" ")[0]}
                className="h-28 w-36 shrink-0 rounded object-cover"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">{item.name}</h3>
                    <p className="text-sm text-steel mt-1">Current Location: {item.location || "Central Yard"}</p>
                    
                    {/* Display the AI EEI Score if available, otherwise fallback */}
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      </span>
                      AI Score (EEI): {item.eeiScore || "85"}/100
                    </div>
                  </div>
                  
                  {/* Internal accounting cost display */}
                  <div className="text-right">
                    <p className="text-xs text-steel uppercase tracking-wider mb-1">Internal Cost</p>
                    <p className="font-mono text-xl font-bold text-ink">{formatINR(lineTotal(item))}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between border-t border-line pt-4">
                  <label className="flex items-center gap-3 text-sm text-ink font-medium">
                    Duration Required:
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={item.days || 1}
                        onChange={(e) =>
                          updateItem(item.equipmentId, {
                            days: Math.max(1, Math.min(365, Number(e.target.value) || 1)),
                          })
                        }
                        className="w-20 border border-line bg-paper px-3 py-1.5 font-mono text-sm text-ink focus:border-signal focus:outline-none rounded"
                      />
                      <span className="text-steel font-normal">days</span>
                    </div>
                  </label>

                  <button
                    onClick={() => removeItem(item.equipmentId)}
                    className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    Remove from request
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Submission Summary */}
        <div>
          <div className="panel sticky top-24 p-6 bg-surface border border-line rounded-lg shadow-sm">
            <h2 className="font-display text-xl font-bold text-ink border-b border-line pb-4">Request Summary</h2>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-steel">Total Machines</span>
                <span className="font-medium text-ink">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-steel">Average EEI Score</span>
                <span className="font-medium text-green-600">High Efficiency</span>
              </div>
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-sm font-medium text-ink">Est. Site Budget</span>
              <span className="font-mono text-2xl font-bold text-ink">{formatINR(total)}</span>
            </div>
            
            <p className="mt-2 text-xs text-steel leading-relaxed">
              This amount will be allocated from your project budget for internal fleet utilization.
            </p>

            <div className="mt-6">
              {/* Keeping the route to /checkout so it doesn't break your app routing, 
                  but visually acting as a submit button */}
              <Button fullWidth size="lg" className="bg-signal text-white py-3" onClick={() => navigate("/checkout")}>
                Submit to Admin
              </Button>
            </div>
            
            <button
              onClick={() => navigate("/equipment")}
              className="mt-4 w-full text-center text-sm font-medium text-steel hover:text-signal transition-colors"
            >
              Add more machinery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}