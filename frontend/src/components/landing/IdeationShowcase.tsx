"use client";

import React, { useState } from "react";
import {
  FiZap,
  FiEdit3,
  FiTarget,
  FiTrendingUp,
  FiCheck,
  FiArrowRight,
  FiCompass,
} from "react-icons/fi";
import { SpotlightCard } from "./Spotlight";

export function IdeationShowcase() {
  const [activeTab, setActiveTab] = useState<"zero" | "refine" | "evaluate">("refine");

  const pathwayData = {
    zero: {
      tag: "Pathway 1: From Complete Scratch",
      title: "Generate 10 Structured Concepts From Niche",
      inputPrompt: "Niche: 'Developer Productivity' • Audience: 'Full-Stack Engineers'",
      outputConcept: "The Hidden Cost of Micro-Services: Why Monoliths Are Making a Silent Comeback in 2026",
      angle: "Contrarian engineering breakdown analyzing serverless maintenance overhead vs modular monolith simplicity.",
      score: "8.9",
      virality: "9.1",
      clarity: "8.8",
      comp: "8.6",
      hook: "We broke our monolith into 42 micro-services in 2023. Here is why we spent the last 6 months putting it back together:",
    },
    refine: {
      tag: "Pathway 2: Rough Concept Refinement",
      title: "Turn 1 Raw Thought into 5 Strategic Angles",
      inputPrompt: "Raw Note: 'I feel like people spend too much time reading productivity books instead of doing work.'",
      outputConcept: "The Action-Consumption Paradox: Why Your 10th Productivity Book Is Actually Procrastination",
      angle: "Psychological framework contrasting 'passive learning loops' with 'immediate feedback systems'.",
      score: "9.2",
      virality: "9.4",
      clarity: "9.0",
      comp: "8.9",
      hook: "Reading 50 books a year is a status symbol. Applying 3 principles a year is a superpower.",
    },
    evaluate: {
      tag: "Pathway 3: Diagnostic Scoring",
      title: "Pre-Publishing Concept Diagnostic & Hook Audit",
      inputPrompt: "Pitch: 'Guide on how to hire your first 5 founding engineers without an agency.'",
      outputConcept: "How to Land Elite Founding Engineers in 2026 Without Paying $30k Headhunter Fees",
      angle: "Step-by-step founder playbook with technical vetting rubric and compensation equity models.",
      score: "8.7",
      virality: "8.5",
      clarity: "9.2",
      comp: "8.4",
      hook: "The best founding engineers never apply to job postings. Here's how we sourced 5 senior devs via cold Loom messages:",
    },
  };

  const current = pathwayData[activeTab];

  return (
    <section id="ideation" className="py-24 sm:py-32 relative bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Stage 1 — Ideation Engine
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            3 distinct pathways to eliminate creator block.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Whether starting with zero direction, an unpolished note, or a full pitch—the engine scores, refines, and formats concepts before you ever write a line.
          </p>
        </div>

        {/* 3 Pathway Tabs Header */}
        <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-2xl bg-zinc-950 border border-zinc-800 max-w-xl">
          <button
            type="button"
            onClick={() => setActiveTab("zero")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "zero"
                ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FiCompass className="w-4 h-4 text-amber-400" />
            <span>Zero Idea</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("refine")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "refine"
                ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FiEdit3 className="w-4 h-4 text-amber-400" />
            <span>Refine Idea</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evaluate")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "evaluate"
                ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FiTarget className="w-4 h-4 text-amber-400" />
            <span>Evaluate Pitch</span>
          </button>
        </div>

        {/* Pathway Interactive Demonstration Box */}
        <SpotlightCard className="p-6 sm:p-10 border-zinc-800 bg-zinc-950 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Input & Concept Transformation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {current.tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-100">
                  {current.title}
                </h3>
              </div>

              {/* Input Prompt Card */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 font-mono space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block font-sans">
                  Creator Input
                </span>
                <p className="text-zinc-200">{current.inputPrompt}</p>
              </div>

              {/* Synthesized Output Card */}
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-bold uppercase">
                    AI Output Concept
                  </span>
                </div>
                <h4 className="text-base font-bold text-zinc-100 leading-snug">
                  {current.outputConcept}
                </h4>
                <p className="text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Strategic Angle: </span>
                  {current.angle}
                </p>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                  <span className="font-semibold text-amber-400">Optimized Hook: </span>
                  &ldquo;{current.hook}&rdquo;
                </div>
              </div>
            </div>

            {/* Right: Telemetry Scoring Gauge */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-5 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Pre-Validation Scorecard
              </span>

              <div className="space-y-1">
                <p className="text-5xl font-black text-amber-400 tracking-tight">
                  {current.score}
                </p>
                <p className="text-[11px] font-medium text-emerald-400">
                  Top 5% Predictive Virality Score
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-zinc-800">
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase block">Virality</span>
                  <span className="font-bold text-emerald-400">{current.virality}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase block">Clarity</span>
                  <span className="font-bold text-zinc-200">{current.clarity}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase block">Comp Edge</span>
                  <span className="font-bold text-amber-400">{current.comp}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-[11px] text-zinc-400">
                Concepts scoring ≥8.0 advance directly into automatic research blueprints.
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
