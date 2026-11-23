import React from "react";
import { RafeeqLogo } from "@/components/shared/RafeeqLogo";

export function LoginIllustration() {
  return (
    <div className="hidden lg:flex flex-col justify-between w-1/2 bg-yellow p-12 lg:p-16 select-none relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-soft-yellow/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Logo */}
      <div className="relative z-10">
        <RafeeqLogo iconSize={42} textColor="text-slate-900" />
      </div>

      {/* Center Illustration (Dog & Cat with Care Bag SVG) */}
      <div className="relative z-10 flex flex-col items-center justify-center py-8">
        <div className="relative w-full max-w-md aspect-4/3 flex items-center justify-center">
          {/* Organic golden background blob */}
          <svg
            className="w-full h-full text-soft-yellow"
            viewBox="0 0 500 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M450 190C450 270 370 350 250 350C130 350 50 270 50 190C50 110 130 40 250 40C370 40 450 110 450 190Z"
              fill="currentColor"
              fillOpacity="0.4"
            />
          </svg>

          {/* Embedded Pet Character Vectors */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 400 300"
              className="w-4/5 h-4/5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Golden Dog */}
              <ellipse cx="160" cy="190" rx="60" ry="75" fill="#E8A932" />
              <circle cx="160" cy="115" r="42" fill="#E8A932" />
              <path
                d="M142 85C135 65 115 80 118 105C120 120 130 130 138 120Z"
                fill="#3B5778"
              />
              <path
                d="M178 85C185 65 205 80 202 105C200 120 190 130 182 120Z"
                fill="#3B5778"
              />
              <ellipse cx="148" cy="112" rx="4.5" ry="5.5" fill="#202A36" />
              <ellipse cx="172" cy="112" rx="4.5" ry="5.5" fill="#202A36" />
              <ellipse cx="160" cy="122" rx="6" ry="4" fill="#202A36" />
              <path
                d="M154 126C156 131 164 131 166 126"
                stroke="#202A36"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Dog Collar */}
              <rect x="135" y="148" width="50" height="12" rx="6" fill="#5F88BA" />
              <path
                d="M148 160C148 160 145 230 160 230C175 230 172 160 172 160Z"
                fill="#F2ECE6"
              />

              {/* Blue Cat */}
              <ellipse cx="255" cy="210" rx="36" ry="48" fill="#3B5778" />
              <circle cx="255" cy="155" r="28" fill="#3B5778" />
              <polygon points="235,142 242,122 250,138" fill="#3B5778" />
              <polygon points="260,138 268,122 275,142" fill="#3B5778" />
              <ellipse cx="247" cy="154" rx="3.5" ry="4.5" fill="#F8F6F2" />
              <ellipse cx="263" cy="154" rx="3.5" ry="4.5" fill="#F8F6F2" />
              <polygon points="253,162 257,162 255,165" fill="#EFBB44" />

              {/* Pet Care Bag with Paw Stamp */}
              <rect
                x="260"
                y="180"
                width="78"
                height="70"
                rx="14"
                fill="#5F88BA"
                stroke="#3B5778"
                strokeWidth="2"
              />
              <path
                d="M284 180V165C284 158 314 158 314 165V180"
                stroke="#3B5778"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Paw print on bag */}
              <circle cx="299" cy="218" r="6" fill="#FFFFFF" />
              <circle cx="292" cy="208" r="2.8" fill="#FFFFFF" />
              <circle cx="297" cy="204" r="2.8" fill="#FFFFFF" />
              <circle cx="303" cy="204" r="2.8" fill="#FFFFFF" />
              <circle cx="308" cy="208" r="2.8" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      </div>

      {/* Typography & Slogan */}
      <div className="relative z-10 space-y-3">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
          Better care.
          <br />
          Happier companions.
        </h1>
        <p className="text-slate-800/80 text-sm max-w-md leading-relaxed font-medium">
          One warm community for pets, people, and the businesses that care for them.
        </p>
        <p className="text-[11px] font-bold tracking-widest text-slate-900/60 pt-4 uppercase">
          Rafeeq / Built Around Care
        </p>
      </div>
    </div>
  );
}
