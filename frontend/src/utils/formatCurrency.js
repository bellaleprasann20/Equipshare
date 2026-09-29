/**
 * Currency formatting — used in EquipmentCard, RecommendationCard,
 * AllocationHistory, Reports. Defaults to INR since this is a
 * construction-equipment-in-India project, but accepts a currency
 * override if needed later.
 */
export function formatCurrency(amount, currency = "INR") {
  const value = Number(amount);
  if (Number.isNaN(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact form for dashboard stat cards, e.g. ₹1.2L instead of ₹1,20,000 */
export function formatCurrencyCompact(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return "—";

  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}
