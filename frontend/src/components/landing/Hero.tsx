"use client";

import React from "react";
import Link from "next/link";
import { FiArrowRight, FiShield, FiTrendingUp, FiLayers, FiCheck } from "react-icons/fi";
import { ShinyText } from "./ShinyText";

interface HeroProps {
  onLogin: () => void;
  loading: boolean;
}

export function Hero({ onLogin, loading }: HeroProps) {
  return (
    <section className="relative pt-36 sm:pt-44 pb-24 sm:pb-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-zinc-300 font-medium">Next-Gen Creator Engine</span>
          <span className="text-zinc-600">•</span>
          <ShinyText text="Powered by AWS Bedrock" className="font-semibold text-zinc-200" />
        </div>

        {/* Hero Headline */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            The creative workspace engineered for{" "}
            <span className="text-zinc-400 font-light">serious creators.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            KindCrew researches trending demand, validates concept virality, and drafts platform-native content deeply grounded in your authentic voice.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onLogin}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-sm font-semibold transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Connecting..." : "Start Creating Free"}</span>
            <FiArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-sm font-medium transition-all"
          >
            Explore Platform
          </a>
        </div>

        {/* Clean, Refined Product Interface Mockup Preview */}
        <div className="pt-12 sm:pt-16 max-w-5xl mx-auto text-left">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 sm:p-6 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Mockup Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-xs text-zinc-500 font-mono ml-2">kindcrew-studio // workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                  Profile: B2B Technology
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300">
                  Virality: 9.1 / 10
                </span>
              </div>
            </div>

            {/* Mockup Content Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">01 / Ideation</span>
                  <FiTrendingUp className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100">
                  The Architecture Behind 10x Developer Productivity
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Verified against 12-month Google Trends interest. High organic curiosity among tech leads.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">02 / Content Studio</span>
                  <FiLayers className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100">
                  Multi-Channel Synthesis
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automatically tailored into LinkedIn teardowns, X threads, and newsletter briefs in under 10 seconds.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">03 / Growth Loop</span>
                  <FiShield className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100">
                  Closed-Loop Feedback
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time engagement telemetry feeds directly back to improve future topic recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
