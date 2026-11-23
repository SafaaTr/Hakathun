import React from "react";

interface RafeeqLogoProps {
  className?: string;
  iconSize?: number;
  textColor?: string;
}

export function RafeeqLogo({
  className = "",
  iconSize = 32,
  textColor = "text-foreground",
}: RafeeqLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Paw Icon SVG */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-current"
      >
        {/* Main Pad */}
        <path
          d="M20 19C16.6863 19 14 22.3579 14 26.5C14 29.8 16.3 32.5 20 32.5C23.7 32.5 26 29.8 26 26.5C26 22.3579 23.3137 19 20 19Z"
          fill="currentColor"
        />
        {/* Top-Left Toe */}
        <circle cx="11.5" cy="14.5" r="3.5" fill="currentColor" />
        {/* Top-Middle-Left Toe */}
        <circle cx="16.5" cy="10" r="3.5" fill="currentColor" />
        {/* Top-Middle-Right Toe */}
        <circle cx="23.5" cy="10" r="3.5" fill="currentColor" />
        {/* Top-Right Toe */}
        <circle cx="28.5" cy="14.5" r="3.5" fill="currentColor" />
      </svg>
      <span className={`text-2xl font-extrabold lowercase tracking-tight ${textColor}`}>
        rafeeq
      </span>
    </div>
  );
}
