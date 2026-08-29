"use client";

import React from "react";
import { FiX, FiCheck, FiLayers } from "react-icons/fi";
import { SpotlightCard } from "./Spotlight";

export function AuthenticValueMatrix() {
  const comparisonRows = [
    {
      dimension: "Idea Generation & Validation",
      fragmented: "Staring at blank pages, relying on unverified gut feeling, and guessing what resonates.",
      kindcrew: "3 structured AI pathways backed by Google Trends data, virality scoring, and competitor pattern analysis.",
    },
    {
      dimension: "AI Grounding & Voice Fidelity",
      fragmented: "Copy-pasting ungrounded prompts into generic AI bots, yielding robotic and generic fluff.",
      kindcrew: "Deterministic Creator Profile grounding that injects your niche, audience persona, tone, and avoid-topics.",
    },
    {
      dimension: "Multi-Platform Asset Production",
      fragmented: "Manually re-writing the same draft across LinkedIn, X/Twitter, and Instagram with inconsistent formats.",
      kindcrew: "One-click conversion into 4 platform-native assets with calibrated formatting, hooks, and hashtags.",
    },
    {
      dimension: "Publishing Cadence & Consistency",
      fragmented: "Sporadic posting whenever time permits, leading to audience drop-off and erratic reach.",
      kindcrew: "Integrated content calendar with AI-recommended engagement time slots and Google Calendar sync.",
    },
    {
      dimension: "Analytics & Continuous Improvement",
      fragmented: "Checking vanity like counts with zero actionable insight into why certain posts succeeded.",
      kindcrew: "Closed-loop telemetry that diagnoses hook velocity, pillar performance, and generates iteration suggestions.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative bg-zinc-950/60 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              System Architecture Comparison
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Stop stitching together disconnected creator tools.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            A structured comparison between ad-hoc creation workflows and the KindCrew unified operating system.
          </p>
        </div>

        {/* Comparison Matrix Table / Cards */}
        <div className="space-y-4">
          {comparisonRows.map((row, idx) => (
            <SpotlightCard
              key={idx}
              className="p-5 sm:p-6 border-zinc-800 bg-zinc-950/80 shadow-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Dimension Title */}
                <div className="md:col-span-3">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                    Capability {idx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                    {row.dimension}
                  </h3>
                </div>

                {/* The Fragmented Way */}
                <div className="md:col-span-4 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                    <FiX className="w-3.5 h-3.5" />
                    <span>The Fragmented Stack</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {row.fragmented}
                  </p>
                </div>

                {/* The KindCrew Way */}
                <div className="md:col-span-5 p-3.5 rounded-xl bg-amber-950/10 border border-amber-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                    <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>The KindCrew System</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    {row.kindcrew}
                  </p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
