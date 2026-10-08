import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Button from "../../components/common/Button";
import EquipmentImage from "../../components/equipment/EquipmentImage";
import { lineTotal, formatINR } from "../../utils/pricing";

function getEquipmentId(item) {
  return item?.equipmentId || item?._id || item?.id;
}

function getDays(item) {
  const days = Number(item?.days);
  return Number.isFinite(days) && days > 0 ? days : 1;
}

function getItemTotal(item) {
  try {
    const value = Number(lineTotal(item));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export default function Cart() {
  const navigate = useNavigate();

  const {
    items = [],
    total = 0,
    removeItem,
    updateItem,
    clear,
  } = useCart();

  const safeTotal = Number(total);
  const displayTotal = Number.isFinite(safeTotal) ? safeTotal : 0;

  const handleDaysChange = (equipmentId, value) => {
    const days = Math.max(
      1,
      Math.min(365, Number(value) || 1)
    );

    updateItem(equipmentId, { days });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl py-16">
        <div className="rounded-xl border border-[#2a2a2d] bg-[#1c1c1f] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
            <span className="text-2xl">+</span>
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            Equipment Selection
          </p>

          <h1 className="mt-2 font-display text-2xl font-bold text-white">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
            Select equipment from the catalog to review your fleet
            selection and estimated internal allocation cost.
          </p>

          <div className="mt-6">
            <Button onClick={() => navigate("/equipment")}>
              Browse Equipment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-[#2a2a2d] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            Equipment Selection
          </p>

          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Selected Equipment
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Review the equipment selected for your project.
          </p>
        </div>

        <button
          type="button"
          onClick={clear}
          className="self-start text-sm font-medium text-gray-500 transition-colors hover:text-red-400 sm:self-auto"
        >
          Clear Selection
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Equipment List */}
        <section className="space-y-4">
          {items.map((item) => {
            const equipmentId = getEquipmentId(item);
            const days = getDays(item);
            const itemTotal = getItemTotal(item);

            return (
              <article
                key={equipmentId}
                className="rounded-xl border border-[#2a2a2d] bg-[#1c1c1f] p-4 transition-colors hover:border-[#3a3a40] sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Image */}
                  <EquipmentImage
                    src={item.imageUrl}
                    alt={item.name || "Equipment"}
                    label={item?.name?.split(" ")[0] || "Equipment"}
                    className="h-40 w-full shrink-0 rounded-lg object-cover sm:h-28 sm:w-36"
                  />

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-display text-lg font-bold text-white">
                          {item.name || "Unnamed Equipment"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.category || item.type || "Equipment"}
                        </p>

                        {item.location && (
                          <p className="mt-2 text-xs text-gray-400">
                            Location:{" "}
                            <span className="text-gray-300">
                              {item.location}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          Estimated Cost
                        </p>

                        <p className="mt-1 font-mono text-lg font-bold text-white">
                          {formatINR(itemTotal)}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#2a2a2d] pt-4">
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor={`days-${equipmentId}`}
                          className="text-xs font-medium text-gray-400"
                        >
                          Required Duration
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            id={`days-${equipmentId}`}
                            type="number"
                            min="1"
                            max="365"
                            value={days}
                            onChange={(event) =>
                              handleDaysChange(
                                equipmentId,
                                event.target.value
                              )
                            }
                            className="w-20 rounded-md border border-[#333338] bg-[#161618] px-3 py-1.5 text-center font-mono text-sm text-white outline-none transition-colors focus:border-[#8b5cf6]"
                          />

                          <span className="text-xs text-gray-500">
                            days
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(equipmentId)}
                        className="text-xs font-medium text-gray-500 transition-colors hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Summary */}
        <aside>
          <div className="sticky top-24 rounded-xl border border-[#2a2a2d] bg-[#1c1c1f] p-5">
            <div className="border-b border-[#2a2a2d] pb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8b5cf6]">
                Selection Summary
              </p>

              <h2 className="mt-1 font-display text-lg font-bold text-white">
                Equipment Overview
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Equipment
                </span>

                <span className="font-mono text-sm font-semibold text-white">
                  {items.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Maximum duration
                </span>

                <span className="font-mono text-sm font-semibold text-white">
                  {Math.max(...items.map(getDays))} days
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-[#2a2a2d] pt-5">
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm font-medium text-gray-400">
                  Estimated Total
                </span>

                <span className="font-mono text-2xl font-bold text-white">
                  {formatINR(displayTotal)}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                This is an internal fleet cost estimate. Final allocation
                depends on availability and project approval.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Continue
              </Button>

              <button
                type="button"
                onClick={() => navigate("/equipment")}
                className="w-full rounded-md border border-[#333338] px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:border-[#8b5cf6] hover:text-white"
              >
                Browse More Equipment
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}