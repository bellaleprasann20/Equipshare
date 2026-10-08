import React, { useEffect, useState } from "react";

export default function EquipmentImage({
  src,
  alt = "Equipment",
  label = "E",
  className = "",
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const fallbackLabel =
    label?.toString().trim().charAt(0).toUpperCase() || "E";

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#161618] ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="font-display text-4xl font-bold text-zinc-800">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      className={`object-cover ${className}`}
    />
  );
}