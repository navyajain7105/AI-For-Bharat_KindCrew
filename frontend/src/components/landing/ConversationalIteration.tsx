"use client";

import React, { useState } from "react";
import { FiMessageSquare, FiCornerDownRight, FiZap, FiRefreshCw, FiCheck } from "react-icons/fi";
import { SpotlightCard } from "./Spotlight";

export function ConversationalIteration() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const iterations = [
    {
      userPrompt: "Make this opening hook more provocative for seed-stage tech founders.",
      aiResponse:
        "Updated thesis from a passive suggestion into an operational challenge:\n\n*Old*: 'AI tools can help founders work faster.'\n*New Hook*: 'Founders working 70-hour weeks in 2026 are either managing poorly or ignoring $0 software leverage.'",
      telemetry: "Predicted Hook Retention: +38% • Viral Resonance: 9.3",
    },
    {
      userPrompt: "Target this specifically to CTOs and engineers. Strip all marketing jargon.",
      aiResponse:
        "Adjusted technical vocabulary:\n\n1. Replaced 'easy integration' with 'Zero-Downtime WebSocket Stream & Redis Cache'.\n2. Replaced 'fast performance' with 'Sub-15ms p99 latency under concurrent load'.",
      telemetry: "B2B Technical Resonance: 9.6 • Fluff Penalty: 0%",
    },
    {
      userPrompt: "Convert this thesis into a high-converting LinkedIn post and a Twitter thread.",
      aiResponse:
        "Generated 2 platform-tailored distribution variants:\n\n• **LinkedIn Asset**: 1,200 character story-driven case study with bulleted takeaways.\n• **Twitter/X Asset**: 5-tweet thread with punchy 1-line transitions and closing engagement hook.",
      telemetry: "Multi-Platform Asset Readiness: 100%",
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative bg-zinc-950/60 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Conversational Collaboration
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Never settle for the first output. Iterate in seconds.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Great content is sculpted through refinement. Seamlessly adjust tone, sharpen contrarian hooks, or convert formats through natural instructions.
          </p>
        </div>

        {/* Iteration Interactive Simulation Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Preset Instruction Triggers */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
              Select Feedback Adjustment
            </span>
            {iterations.map((item, idx) => {
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? "border-amber-500/60 bg-zinc-900 shadow-md ring-1 ring-amber-500/20"
                      : "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiMessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      Adjustment {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 italic">
                    &ldquo;{item.userPrompt}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Chat / Response Box */}
          <div className="lg:col-span-8">
            <SpotlightCard className="p-6 sm:p-8 space-y-5 border-zinc-800 bg-zinc-950 shadow-2xl">
              {/* User Instruction Bubble */}
              <div className="flex items-start gap-3 justify-end">
                <div className="p-4 rounded-2xl bg-zinc-800 text-zinc-100 text-xs sm:text-sm font-medium max-w-lg border border-zinc-700/60 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                    Creator Directive
                  </span>
                  &ldquo;{iterations[activeStep].userPrompt}&rdquo;
                </div>
              </div>

              {/* AI Synthesized Output Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                  KC
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed max-w-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      KindCrew Bedrock Engine
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      ✓ Calibrated
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-zinc-300">
                    {iterations[activeStep].aiResponse}
                  </div>
                </div>
              </div>

              {/* Telemetry Output Tag */}
              <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-mono text-amber-400/90 text-[11px]">
                  {iterations[activeStep].telemetry}
                </span>
                <span className="text-[10px] text-zinc-500">Instant Re-synthesis</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
