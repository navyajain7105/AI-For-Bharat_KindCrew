"use client";

import React from "react";
import {
  FiEdit,
  FiCalendar,
  FiTrendingUp,
  FiEye,
  FiHeart,
  FiLayers,
  FiCheck,
  FiArrowUpRight,
} from "react-icons/fi";
import { SpotlightCard } from "./Spotlight";

export function StudioAnalyticsPreview() {
  return (
    <section id="studio" className="py-24 sm:py-32 relative bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Stages 2, 3 & 4 — Execution & Telemetry
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Draft, distribute, and calibrate with live telemetry.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            A cohesive control room where content generation connects seamlessly with scheduled calendar slots and real-time performance analytics.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Multi-Platform Studio & Calendar Sync */}
          <SpotlightCard className="p-6 sm:p-8 space-y-6 border-zinc-800 bg-zinc-950/70 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <FiEdit className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Stage 2 & 3: Studio & Cadence
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  Google Calendar Active
                </span>
              </div>

              <h3 className="text-xl font-bold text-zinc-100">
                Automated Multi-Platform Generation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate 4 platform-tailored drafts simultaneously with formatted copy, optimized reading lengths, and high-converting calls to action.
              </p>

              {/* Scheduled Calendar Cards Preview */}
              <div className="space-y-2.5 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-200">
                      IN
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">LinkedIn Authority Case Study</p>
                      <p className="text-[10px] text-zinc-500">Scheduled: Tuesday • 09:00 AM IST</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                    Queued
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-200">
                      X
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">5-Part Playbook Thread</p>
                      <p className="text-[10px] text-zinc-500">Scheduled: Thursday • 04:30 PM IST</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/40">
                    Optimized Slot
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-[11px] text-zinc-400">
              Eliminate publishing inconsistency through automated weekly time-slot suggestions.
            </div>
          </SpotlightCard>

          {/* Column 2: Live Growth Telemetry & Feedback */}
          <SpotlightCard className="p-6 sm:p-8 space-y-6 border-zinc-800 bg-zinc-950/70 shadow-2xl flex flex-col justify-between" id="analytics">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Stage 4: Growth Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40">
                  Feedback Active
                </span>
              </div>

              <h3 className="text-xl font-bold text-zinc-100">
                Engagement Velocity & Pillar Feedback
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Telemetry that grades what connects with your audience. The AI identifies top-converting hooks and suggests immediate repurposing avenues.
              </p>

              {/* 4 Mini KPI Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Impressions</span>
                    <FiEye className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-xl font-bold text-zinc-100">18,420</p>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                    <FiArrowUpRight className="w-3 h-3" /> +16.4%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Engagement</span>
                    <FiHeart className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-xl font-bold text-zinc-100">4.6%</p>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                    <FiArrowUpRight className="w-3 h-3" /> Top 10%
                  </span>
                </div>
              </div>

              {/* AI Diagnostic Recycling Suggestion Box */}
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">
                  AI Feedback Recommendation
                </span>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  High comment volume on your &apos;AI Automation&apos; thesis indicates prime candidate for expanding into a detailed YouTube video blueprint.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-[11px] text-zinc-400">
              Your analytics directly reinforce future ideation algorithms for higher predictable reach.
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
