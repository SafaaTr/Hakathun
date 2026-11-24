import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
}

export function StatCard({ label, value, subValue, icon }: StatCardProps) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-yellow/40 flex flex-col justify-between">
      {/* Metric Label + Icon */}
      <div className="flex items-center gap-2.5 text-muted text-xs font-semibold tracking-wide">
        <span className="text-navy dark:text-yellow">{icon}</span>
        <span>{label}</span>
      </div>

      {/* Metric Values */}
      <div className="flex items-baseline gap-3 mt-4">
        <span className="text-3xl font-extrabold text-foreground tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-semibold text-muted/90 truncate">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
