import React from "react";

type BadgeVariant =
  | "available"
  | "unavailable"
  | "pending"
  | "approved"
  | "rejected"
  | "default";

interface BadgeProps {
  status?: string;
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ status, variant, children, className = "" }: BadgeProps) {
  // Infer variant from status if not explicitly passed
  const activeVariant: BadgeVariant =
    variant ||
    (status === "available"
      ? "available"
      : status === "unavailable"
      ? "unavailable"
      : status === "pending"
      ? "pending"
      : status === "approved"
      ? "approved"
      : status === "rejected"
      ? "rejected"
      : "default");

  const variantStyles: Record<BadgeVariant, string> = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    unavailable: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    default: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };

  const displayText = children || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variantStyles[activeVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {displayText}
    </span>
  );
}
