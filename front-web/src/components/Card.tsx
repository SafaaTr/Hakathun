import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`p-5 rounded-xl border border-card-border bg-card shadow-sm transition-colors ${className}`}
      {...props}
    >
      {title && <h3 className="text-lg font-semibold mb-3 text-foreground">{title}</h3>}
      {children}
    </div>
  );
}