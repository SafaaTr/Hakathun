import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
}

export function StatCard({ label, value, subValue, icon }: StatCardProps) {
  return (
    <div className="group bg-card border border-card-border rounded-2xl p-6 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-yellow/50 flex flex-col justify-between cursor-default">
      {/* Metric Label + Icon */}
      <div className="flex items-center gap-2.5 text-muted text-xs font-semibold tracking-wide">
        <span className="text-navy dark:text-yellow transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </span>
        <span className="group-hover:text-foreground transition-colors duration-150">
          {label}
        </span>
      </div>

      {/* Metric Values */}
      <div className="flex items-baseline gap-3 mt-4">
        <span className="text-3xl font-extrabold text-foreground tracking-tight group-hover:text-navy dark:group-hover:text-yellow transition-colors duration-200">
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
