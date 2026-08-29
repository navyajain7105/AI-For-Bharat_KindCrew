"use client";

import React from "react";
import { FiInfo } from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface InfoTooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
  delayDuration?: number;
}

export function InfoTooltip({
  content,
  children,
  side = "top",
  sideOffset = 6,
  className = "",
  delayDuration = 150,
}: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children ? (
            children
          ) : (
            <button
              type="button"
              className="inline-flex items-center text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
              aria-label="More information"
            >
              <FiInfo className="w-3.5 h-3.5" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          className={`z-50 max-w-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 shadow-xl backdrop-blur-md ${className}`}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
