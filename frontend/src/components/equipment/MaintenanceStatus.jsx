import React from "react";

function getStatus(lastServiceDate, recommendedIntervalDays) {
  if (!lastServiceDate) {
    return {
      label: "No service record",
      dot: "bg-zinc-600",
      text: "text-zinc-500",
      bg: "bg-zinc-900",
    };
  }

  const serviceDate = new Date(lastServiceDate);

  if (Number.isNaN(serviceDate.getTime())) {
    return {
      label: "Invalid service date",
      dot: "bg-zinc-600",
      text: "text-zinc-500",
      bg: "bg-zinc-900",
    };
  }

  const interval = Number(recommendedIntervalDays);

  if (!Number.isFinite(interval) || interval <= 0) {
    return {
      label: "Interval unavailable",
      dot: "bg-zinc-600",
      text: "text-zinc-500",
      bg: "bg-zinc-900",
    };
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const daysSince = Math.floor(
    (Date.now() - serviceDate.getTime()) /
      millisecondsPerDay
  );

  // Future service date
  if (daysSince < 0) {
    return {
      label: "Scheduled",
      dot: "bg-sky-400",
      text: "text-sky-400",
      bg: "bg-sky-400/10",
    };
  }

  const ratio = daysSince / interval;

  if (ratio >= 1) {
    return {
      label: `Overdue · ${daysSince}d`,
      dot: "bg-red-400",
      text: "text-red-400",
      bg: "bg-red-400/10",
    };
  }

  if (ratio >= 0.75) {
    return {
      label: `Due soon · ${daysSince}d`,
      dot: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-400/10",
    };
  }

  return {
    label: `OK · ${daysSince}d`,
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
  };
}

export default function MaintenanceStatus({
  lastServiceDate,
  recommendedIntervalDays = 90,
}) {
  const status = getStatus(
    lastServiceDate,
    recommendedIntervalDays
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium ${status.bg} ${status.text}`}
      title={
        lastServiceDate
          ? `Last service: ${new Date(
              lastServiceDate
            ).toLocaleDateString("en-IN")}`
          : "No service record available"
      }
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
        aria-hidden="true"
      />

      {status.label}
    </span>
  );
}