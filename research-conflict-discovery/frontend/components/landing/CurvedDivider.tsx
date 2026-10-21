"use client";

import React from "react";

interface CurvedDividerProps {
  className?: string;
}

export const CurvedDivider: React.FC<CurvedDividerProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full overflow-hidden leading-none pointer-events-none select-none z-10 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-16 sm:h-24 md:h-32 lg:h-44 block"
      >
        {/* Soft atmospheric gradient glow along the curve edge */}
        <defs>
          <linearGradient id="curveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#36C9C0" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#3B6FD8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#36C9C0" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Subtle accent border line tracking the curve */}
        <path
          d="M 0 115 C 380 185, 820 30, 1440 65"
          stroke="url(#curveGlow)"
          strokeWidth="2.5"
          fill="none"
        />

        {/* The solid white ground cut that creates the organic hero transition */}
        <path
          d="M 0 115 C 380 185, 820 30, 1440 65 L 1440 180 L 0 180 Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};
