import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  rightElement,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-input-bg text-foreground placeholder:text-muted/60 transition-all duration-150 text-sm py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow/50 ${
            icon ? "pl-11" : "pl-4"
          } ${rightElement ? "pr-11" : "pr-4"} ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-input-border focus:border-yellow"
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3.5 flex items-center justify-center">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger font-medium mt-1 inline-flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
}
