import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <input
        className={`px-3 py-2 border rounded-lg outline-none bg-input-bg border-input-border text-foreground focus:ring-2 focus:ring-primary transition-all ${className}`}
        {...props}
      />
    </div>
  );
}