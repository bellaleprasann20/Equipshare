import React from "react";
import EEIBadge from "./EEIBadge";
import MaintenanceStatus from "./MaintenanceStatus";

function getAvailability(availability) {
  if (availability === "available") {
    return {
      label: "Available",
      dot: "bg-emerald-400",
      text: "text-emerald-400",
    };
  }

  if (availability === "reserved") {
    return {
      label: "Reserved",
      dot: "bg-amber-400",
      text: "text-amber-400",
    };
  }

  return {
    label: "In use",
    dot: "bg-zinc-500",
    text: "text-zinc-400",
  };
}

export default function EquipmentCard({
  equipment,
  onClick,
  rank = null,
}) {
  const {
    name = "Unnamed equipment",
    type = "Equipment",
    location = "Location unavailable",
    availability,
    eeiScore,
    lastServiceDate,
    maintenanceIntervalDays,
    imageUrl,
  } = equipment || {};

  const status = getAvailability(availability);

  return (
    <article
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group overflow-hidden border border-zinc-800 bg-[#1c1c1f] transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-[#202024]"
          : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-[#161618]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-5xl font-bold text-zinc-800">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

        {rank !== null && (
          <span className="absolute left-3 top-3 flex h-7 min-w-7 items-center justify-center bg-violet-600 px-2 font-mono text-xs font-bold text-white">
            #{rank}
          </span>
        )}

        <span
          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 border border-white/10 bg-black/60 px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${status.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-white">
              {name}
            </h3>

            <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
              {type}
            </p>
          </div>

          <div className="shrink-0">
            <EEIBadge score={eeiScore} showLabel={false} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-3">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 text-zinc-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.3" />
          </svg>

          <span className="truncate text-xs text-zinc-400">
            {location}
          </span>
        </div>

        <div className="mt-3">
          <MaintenanceStatus
            lastServiceDate={lastServiceDate}
            recommendedIntervalDays={maintenanceIntervalDays || 90}
          />
        </div>
      </div>
    </article>
  );
}