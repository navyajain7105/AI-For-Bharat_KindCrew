"use client";

import React from "react";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    secondary: "bg-zinc-900 text-zinc-400 border-zinc-800",
    success: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
    warning: "bg-amber-950/40 text-amber-300 border-amber-800/40",
    danger: "bg-rose-950/40 text-rose-300 border-rose-800/40",
    outline: "bg-transparent text-zinc-300 border-zinc-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
