"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerWidth?: number;
}

export function ShinyText({
  text,
  className = "",
  shimmerWidth = 100,
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-[linear-gradient(110deg,#a1a1aa,45%,#ffffff,55%,#a1a1aa)] bg-[length:250%_100%] bg-clip-text text-transparent animate-shiny-text ${className}`}
      style={{
        animation: "shimmer 4s infinite linear",
      }}
    >
      {text}
    </span>
  );
}
