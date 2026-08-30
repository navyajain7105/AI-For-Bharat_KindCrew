"use client";

import React from "react";
import { InfoTooltip } from "./InfoTooltip";

interface DefaultBadgeProps {
  label?: string;
  description?: string;
  className?: string;
}

export function DefaultBadge({
  label = "Default",
  description = "This value is currently set to the system default recommended for your creator profile.",
  className = "",
}: DefaultBadgeProps) {
  return (
    <InfoTooltip content={description}>
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded border border-zinc-700/60 bg-zinc-800/70 text-zinc-400 cursor-help select-none hover:text-zinc-200 transition-colors ${className}`}
      >
        <span className="w-1 h-1 rounded-full bg-amber-400/80" />
        {label}
      </span>
    </InfoTooltip>
  );
}
