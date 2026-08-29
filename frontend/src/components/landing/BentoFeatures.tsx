"use client";

import React from "react";
import {
  FiTarget,
  FiZap,
  FiEdit3,
  FiCalendar,
  FiTrendingUp,
  FiShield,
  FiCheckCircle,
  FiLayers,
} from "react-icons/fi";
import { SpotlightCard } from "./Spotlight";

export function BentoFeatures() {
  return (
    <section id="features" className="py-28 sm:py-36 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header with Generous Spacing */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            End-to-End Operating System
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Everything serious creators need. Nothing they don&apos;t.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Stop juggling fragmented tools. KindCrew consolidates ideation, drafting, scheduling, and analytics into one unified intelligence engine.
          </p>
        </div>

        {/* Spacious Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Creator Context Grounding (8-col) */}
          <div className="md:col-span-8">
            <SpotlightCard className="h-full p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <FiTarget className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-100">
                    Deterministic Creator Context
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                    Generic prompts produce generic output. KindCrew grounds AWS Bedrock in your established niche, target audience persona, and tone of voice.
                  </p>
                </div>
              </div>

              {/* Context Chips Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Niche Grounding</span>
                  <span className="text-xs font-semibold text-zinc-200">AI Infrastructure</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Audience Persona</span>
                  <span className="text-xs font-semibold text-zinc-200">Technical Founders</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Tone Calibration</span>
                  <span className="text-xs font-semibold text-amber-300">Contrarian & Deep</span>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Card 2: Predictive Scoring (4-col) */}
          <div className="md:col-span-4">
            <SpotlightCard className="h-full p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <FiZap className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-zinc-100">
                    Predictive Virality
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    AI diagnostic scorecards evaluate virality, clarity, and market competition before drafting.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
                <span className="text-3xl font-black text-amber-400">9.2 / 10</span>
                <span className="text-[11px] text-emerald-400 block font-medium">Top Tier Concept Resonance</span>
              </div>
            </SpotlightCard>
          </div>

          {/* Card 3: Multi-Platform Studio (4-col) */}
          <div className="md:col-span-4">
            <SpotlightCard className="h-full p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <FiEdit3 className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-zinc-100">
                    Platform-Native Studio
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Generate tailored drafts formatted for LinkedIn posts, X threads, Instagram carousels, and video scripts.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["LinkedIn", "Twitter / X", "Instagram", "YouTube"].map((plat) => (
                  <span
                    key={plat}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </SpotlightCard>
          </div>

          {/* Card 4: Publishing & Feedback Loop (8-col) */}
          <div className="md:col-span-8">
            <SpotlightCard className="h-full p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <FiCalendar className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-100">
                    Cadence Calendar & Analytics Loop
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                    Schedule content across verified engagement windows with Google Calendar synchronization. Real-time impressions feed directly back into your next ideation cycle.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-zinc-300 font-medium">Google Calendar Sync</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3">
                  <FiCheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-zinc-300 font-medium">Closed-Loop Learning</span>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
