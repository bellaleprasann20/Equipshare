import React from "react";

/**
 * Button — part of the EquipShare design system. Safety-orange
 * is the ONE accent color, used for the primary action only, so
 * it stays meaningful rather than decorative.
 */
const VARIANT_CLASSES = {
  primary: "bg-signal hover:bg-signal-dark text-white",
  secondary: "bg-paper hover:bg-line text-ink border border-line",
  danger: "bg-red-700 hover:bg-red-800 text-white",
  outline: "border border-ink/20 hover:border-ink/40 text-ink",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  className = "",
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-signal",
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
      {...rest}
    >
      {loading && (
        <span
          className="h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {!loading && icon}
      {children}
    </button>
  );
}
