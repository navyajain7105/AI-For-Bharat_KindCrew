"use client";

import React, { useState } from "react";
import {
  FiShield,
  FiUser,
  FiSliders,
  FiTarget,
  FiFeather,
  FiCheck,
  FiZap,
} from "react-icons/fi";
import { SpotlightCard } from "./Spotlight";

export function CreatorContextEngine() {
  const [selectedPersona, setSelectedPersona] = useState<number>(0);

  const personas = [
    {
      role: "B2B SaaS Founder",
      niche: "AI Infrastructure & Enterprise Software",
      targetAudience: "Technical Founders, CTOs, VP Engineering",
      tone: "Authoritative, Contrarian & Data-Backed",
      strategy: "Deep-Dive Teardowns & Architecture Playbooks",
      ctaStyle: "Strategic Conversation / Direct DMs",
      avoidTopics: "Generic listicles, superficial buzzwords",
      sampleHook: "Why 80% of enterprise RAG pipelines fail in production (and the 3 architectural fixes that work):",
    },
    {
      role: "Growth & Product Leader",
      niche: "Product-Led Growth & Funnel Optimization",
      targetAudience: "Growth Managers, Product Leads, CMOs",
      tone: "Analytical, Pragmatic & Metric-Driven",
      strategy: "Before/After Experiment Case Studies",
      ctaStyle: "Template Download / Newsletter Deep Dive",
      avoidTopics: "Unsubstantiated claims, outdated SEO advice",
      sampleHook: "How we cut customer acquisition cost by 42% without increasing ad budget by 1 dollar:",
    },
    {
      role: "Systems & Leverage Creator",
      niche: "Solopreneurship, Automation & Creator Ops",
      targetAudience: "Indie Hackers, Digital Creators, Consultants",
      tone: "Transparent, High-Energy & Actionable",
      strategy: "Step-by-Step No-Code & Automation Guides",
      ctaStyle: "Community Discussion / Tool Recommendations",
      avoidTopics: "Get-rich-quick claims, gatekept advice",
      sampleHook: "The exact 4-tool stack that generates 200,000 monthly impressions with 2 hours of weekly effort:",
    },
  ];

  const current = personas[selectedPersona];

  return (
    <section id="creator-context" className="py-24 sm:py-32 relative bg-zinc-950/60 border-t border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Personalized AI Intelligence
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            The AI doesn&apos;t just generate text. It understands who you&apos;re creating for.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Uncalibrated AI writes generic fluff. KindCrew deeply anchors every generation in your established Creator Profile—maintaining consistent authority, formatting constraints, and targeted audience value.
          </p>
        </div>

        {/* Persona Switcher & Visual Engine Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Archetype Selector */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
              Select Creator Profile Context
            </span>
            {personas.map((persona, index) => {
              const isSelected = selectedPersona === index;
              return (
                <div
                  key={persona.role}
                  onClick={() => setSelectedPersona(index)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "border-amber-500/60 bg-zinc-900 shadow-md ring-1 ring-amber-500/20"
                      : "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-100">
                      {persona.role}
                    </h3>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {persona.niche}
                  </p>
                </div>
              );
            })}

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 text-xs text-zinc-400 space-y-2 mt-4">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <FiShield className="w-4 h-4 text-amber-400" />
                <span>Deterministic Grounding</span>
              </div>
              <p className="leading-relaxed">
                Parameters are injected directly into AWS Bedrock system prompts to guarantee voice fidelity across every output.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Engine Canvas */}
          <div className="lg:col-span-8">
            <SpotlightCard className="p-6 sm:p-8 space-y-6 border-zinc-800 bg-zinc-950 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <FiSliders className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Active Context Matrix: {current.role}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  Profile Grounded • 100% Calibrated
                </span>
              </div>

              {/* 4 Context Key-Value Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Target Audience</span>
                  <p className="font-semibold text-zinc-200">{current.targetAudience}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Writing Tone & Style</span>
                  <p className="font-semibold text-amber-300">{current.tone}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Content Strategy</span>
                  <p className="font-semibold text-zinc-200">{current.strategy}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Guardrails & Constraints</span>
                  <p className="font-semibold text-rose-300">Avoid: {current.avoidTopics}</p>
                </div>
              </div>

              {/* Resulting Grounded Output Preview */}
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                  Resulting Calibrated Hook Output
                </span>
                <p className="text-sm font-medium text-zinc-100 italic leading-relaxed">
                  &ldquo;{current.sampleHook}&rdquo;
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
