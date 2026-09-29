// Uses the machine's listed rentPerDay and salePrice when it has them.
// Falls back to an estimate from operating cost for older records.
export function rentPerDay(equipment) {
  if (equipment.rentPerDay) return Math.round(equipment.rentPerDay);
  return Math.round((equipment.operatingCostPerDay || 0) * 1.4);
}

export function buyPrice(equipment) {
  if (equipment.salePrice) return Math.round(equipment.salePrice);
  const ageYears = equipment.purchaseDate
    ? (Date.now() - new Date(equipment.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    : 5;
  const valueFactor = Math.max(0.25, 1 - ageYears * 0.08);
  return Math.round(((equipment.operatingCostPerDay || 0) * 500 * valueFactor) / 1000) * 1000;
}

export function lineTotal(item) {
  return item.mode === "buy" ? buyPrice(item) : rentPerDay(item) * item.days;
}

export function formatINR(amount) {
  return "₹" + Math.round(Number(amount) || 0).toLocaleString("en-IN");
}