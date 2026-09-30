import React from "react";

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  disabled = false,
  className = "",
  ...rest
}) {
  const inputId = `input-${name}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-steel">
          {label}
          {required && <span className="text-signal ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={[
          "border px-3 py-2 text-sm text-ink placeholder:text-steel-light",
          "focus:outline-none focus:ring-1 focus:ring-signal focus:border-signal",
          error ? "border-red-400" : "border-line",
          disabled ? "bg-line/40 cursor-not-allowed" : "bg-surface",
          className,
        ].join(" ")}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}