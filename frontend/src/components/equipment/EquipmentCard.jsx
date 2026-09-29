import React from "react";
import EEIBadge from "./EEIBadge";
import MaintenanceStatus from "./MaintenanceStatus";

/**
 * Reference implementation of the new card pattern — uses the
 * "panel" class (hairline border + corner ticks, defined in
 * index.css) instead of the old rounded-corner + soft-shadow
 * card. Apply this same className="panel" swap to other cards
 * across the app (RecommendationCard, StatCard, etc.) to carry
 * the visual language through consistently.
 */
export default function EquipmentCard({ equipment, onClick, rank = null }) {
  const {
    name,
    type,
    location,
    availability,
    eeiScore,
    lastServiceDate,
    maintenanceIntervalDays,
    imageUrl,
  } = equipment;

  return (
    <div onClick={onClick} className="panel cursor-pointer p-4 transition-colors hover:border-ink/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {rank && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-signal font-mono text-xs font-bold text-white">
              {rank}
            </span>
          )}
          <div className="h-11 w-11 shrink-0 overflow-hidden bg-paper">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-steel-light">▣</div>
            )}
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-ink">{name}</h3>
            <p className="text-xs text-steel">{type}</p>
          </div>
        </div>
        <EEIBadge score={eeiScore} showLabel={false} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-xs text-steel">
        <span>{location}</span>
        <span className={availability === "available" ? "font-medium text-green-700" : "text-steel-light"}>
          {availability === "available" ? "Available" : "In use"}
        </span>
      </div>

      <div className="mt-2">
        <MaintenanceStatus
          lastServiceDate={lastServiceDate}
          recommendedIntervalDays={maintenanceIntervalDays || 90}
        />
      </div>
    </div>
  );
}
