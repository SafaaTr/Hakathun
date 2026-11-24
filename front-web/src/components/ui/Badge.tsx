import React from "react";

type BadgeVariant =
  | "available"
  | "unavailable"
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "closed"
  | "default";

interface BadgeProps {
  status?: string;
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ status, variant, children, className = "" }: BadgeProps) {
  const normStatus = (status || "").toLowerCase();

  // Infer variant from status if not explicitly passed
  const activeVariant: BadgeVariant =
    variant ||
    (normStatus === "available" || normStatus === "active" || normStatus === "approved"
      ? (normStatus as BadgeVariant)
      : normStatus === "unavailable" || normStatus === "closed"
      ? (normStatus as BadgeVariant)
      : normStatus === "pending"
      ? "pending"
      : normStatus === "rejected"
      ? "rejected"
      : "default");

  const variantStyles: Record<BadgeVariant, string> = {
    available:
      "bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-xs",
    active:
      "bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-xs",
    approved:
      "bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-xs",
    unavailable:
      "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold shadow-xs",
    closed:
      "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold shadow-xs",
    pending:
      "bg-amber-500 text-white border-amber-500 font-extrabold shadow-xs",
    rejected:
      "bg-rose-600 text-white border-rose-600 font-extrabold shadow-xs",
    default:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };

  const displayText = children || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${variantStyles[activeVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      {displayText}
    </span>
  );
}
