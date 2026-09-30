import React from "react";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error = "",
  required = false,
  disabled = false,
  className = "",
  ...rest
}) {
  const selectId = `select-${name}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-steel">
          {label}
          {required && <span className="text-signal ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
        className={[
          "border px-3 py-2 text-sm text-ink bg-surface",
          "focus:outline-none focus:ring-1 focus:ring-signal focus:border-signal",
          error ? "border-red-400" : "border-line",
          disabled ? "bg-line/40 cursor-not-allowed" : "",
          className,
        ].join(" ")}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}