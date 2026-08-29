"use client";

import React, { useState } from "react";
import {
  FiCompass,
  FiEdit3,
  FiCalendar,
  FiBarChart2,
  FiArrowRight,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";
import { SpotlightCard } from "./Spotlight";

export function WorkflowPipeline() {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      id: 1,
      number: "01",
      title: "Trend-Backed Ideation & Scoring",
      tagline: "Stage 1 — Ideation Engine",
      icon: FiCompass,
      description:
        "Extract high-velocity topics using Google Trends and AWS Bedrock reasoning. Test rough concepts through 3 distinct pathways and receive instant virality, clarity, and competitive saturation scores.",
      features: [
        "Zero-Idea generator synthesizing 10 structured concepts",
        "Rough concept refiner generating 5 strategic angles",
        "AI diagnostic scorecard evaluating virality & clarity",
      ],
      previewSnippet: "Virality Score: 8.9 • Verified against 12-month Google Trends volume",
    },
    {
      id: 2,
      number: "02",
      title: "Adaptive Multi-Platform Studio",
      tagline: "Stage 2 — Content Studio",
      icon: FiEdit3,
      description:
        "Transform approved ideas into platform-native distribution formats. Calibrated to your creator context, audience persona, custom tone, and formatting constraints.",
      features: [
        "LinkedIn insight posts with high-converting hooks",
        "X / Twitter multi-tweet threads with engagement hooks",
        "Instagram carousels, captions & YouTube video scripts",
      ],
      previewSnippet: "1 Idea → 4 Formatted Platform Assets in under 15 seconds",
    },
    {
      id: 3,
      number: "03",
      title: "Cadence Planning & Calendar Sync",
      tagline: "Stage 3 — Publishing",
      icon: FiCalendar,
      description:
        "Eliminate inconsistent distribution. Schedule content across verified time slots, align optimal posting windows, and synchronize directly with your calendar.",
      features: [
        "Visual month and week scheduling canvas",
        "AI-suggested peak engagement time slots",
        "Google Calendar bidirectional sync",
      ],
      previewSnippet: "Queue 14 days of multi-channel content with zero friction",
    },
    {
      id: 4,
      number: "04",
      title: "Growth Telemetry & Feedback Loop",
      tagline: "Stage 4 — Analytics",
      icon: FiBarChart2,
      description:
        "Analyze reach velocity and content pillar performance. The AI identifies your highest-converting hooks and feeds learnings back into your next ideation cycle.",
      features: [
        "Real-time impressions & engagement rate computation",
        "Content pillar and distribution channel attribution",
        "AI diagnostic recycling engine for underperforming posts",
      ],
      previewSnippet: "Feedback loop automatically improves future idea generation",
    },
  ];

  return (
    <section id="workflow" className="py-24 sm:py-32 relative bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Unified Operating System
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            An unbroken loop from raw idea to verified growth.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Disconnected tools create fragmented creator brands. KindCrew unites every phase of content operations into one continuous AI-driven system.
          </p>
        </div>

        {/* 4 Interactive Connected Stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className="cursor-pointer transition-all duration-300"
              >
                <SpotlightCard
                  className={`h-full flex flex-col justify-between space-y-6 ${
                    isActive
                      ? "border-amber-500/60 bg-zinc-950 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5"
                      : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-zinc-700 group-hover:text-zinc-500 font-mono">
                        {stage.number}
                      </span>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block mb-1">
                        {stage.tagline}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                        {stage.title}
                      </h3>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {stage.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-xs text-zinc-300">
                      {stage.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                    {stage.previewSnippet}
                  </div>
                </SpotlightCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
