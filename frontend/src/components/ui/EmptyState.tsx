"use client";

import React from "react";
import Link from "next/link";
import { IconType } from "react-icons";
import { FiArrowRight } from "react-icons/fi";

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 backdrop-blur-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-100 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white transition-all transform hover:scale-[1.02] shadow-sm"
        >
          {actionLabel}
          <FiArrowRight className="w-4 h-4" />
        </Link>
      )}

      {!actionHref && onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white transition-all transform hover:scale-[1.02] shadow-sm"
        >
          {actionLabel}
          <FiArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
