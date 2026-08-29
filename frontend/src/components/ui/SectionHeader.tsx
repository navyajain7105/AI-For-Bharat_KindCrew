"use client";

import React from "react";
import { InfoTooltip } from "./InfoTooltip";

interface SectionHeaderProps {
  title: string;
  description?: string;
  tooltip?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  tooltip,
  badge,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800/80 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
            {title}
          </h2>
          {tooltip && <InfoTooltip content={tooltip} />}
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
