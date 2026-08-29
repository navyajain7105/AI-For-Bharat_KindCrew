"use client";

import React from "react";
import { DefaultBadge } from "@/components/ui/DefaultBadge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface StrategyGoalsTabProps {
  formData: {
    primaryGoal: string;
    contentStrategy: string;
    postingFrequency: string;
    contentPillars: string;
    contentApproach: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  creatorProfile: any;
}

export function StrategyGoalsTab({
  formData,
  onChange,
  creatorProfile,
}: StrategyGoalsTabProps) {
  const isDefaultGoal =
    !creatorProfile?.goals?.primaryGoal && formData.primaryGoal === "growth";
  const isDefaultStrategy =
    !creatorProfile?.strategy?.contentStrategy &&
    formData.contentStrategy === "educational";
  const isDefaultFrequency =
    !creatorProfile?.strategy?.postingFrequency &&
    formData.postingFrequency === "1/week";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-zinc-100">
          Strategy & Growth Objectives
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Specify your growth targets, core content pillars, and publishing frequency for pipeline scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Primary Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Primary Goal
            </label>
            <div className="flex items-center gap-1.5">
              {isDefaultGoal && (
                <DefaultBadge description="Default primary goal set to Audience Growth." />
              )}
              <InfoTooltip content="Your #1 priority metric (e.g. growing impressions, community engagement, leads, or brand authority)." />
            </div>
          </div>
          <select
            name="primaryGoal"
            value={formData.primaryGoal}
            onChange={onChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="growth">Audience Growth (Reach & Impressions)</option>
            <option value="engagement">Community Engagement (Discussions & Saves)</option>
            <option value="monetization">Monetization (Products, Consulting & Sales)</option>
            <option value="thought-leadership">Thought Leadership (Authority & Press)</option>
          </select>
        </div>

        {/* Content Strategy Framework */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Strategy Archetype
            </label>
            <div className="flex items-center gap-1.5">
              {isDefaultStrategy && (
                <DefaultBadge description="Default strategy set to Educational." />
              )}
              <InfoTooltip content="Defines the overarching approach: Teaching tactical skills, sharing stories, or deep analytical teardowns." />
            </div>
          </div>
          <select
            name="contentStrategy"
            value={formData.contentStrategy}
            onChange={onChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="educational">Educational (Actionable tutorials & guides)</option>
            <option value="inspirational">Inspirational (Founder journey & mindsets)</option>
            <option value="entertaining">Entertaining (Relatable humor & observations)</option>
            <option value="analytical">Analytical (Data teardowns & case studies)</option>
            <option value="curation">Curation (Top tools, summaries & roundups)</option>
          </select>
        </div>

        {/* Posting Frequency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Target Publishing Cadence
            </label>
            <div className="flex items-center gap-1.5">
              {isDefaultFrequency && (
                <DefaultBadge description="Default cadence set to 1 post per week." />
              )}
              <InfoTooltip content="Informs Google Calendar auto-scheduler on your planned posting rhythm." />
            </div>
          </div>
          <select
            name="postingFrequency"
            value={formData.postingFrequency}
            onChange={onChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="1/week">1 post per week (Consistent baseline)</option>
            <option value="3/week">3 posts per week (Recommended growth pacing)</option>
            <option value="daily">Daily posting (High-velocity volume)</option>
            <option value="multiple/daily">Multiple posts per day (Aggressive blitz)</option>
          </select>
        </div>

        {/* Content Approach */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Core Content Approach
            </label>
            <InfoTooltip content="The primary value mechanism you offer your audience (e.g. Value-driven, Framework-first, Experience-based)." />
          </div>
          <input
            type="text"
            name="contentApproach"
            value={formData.contentApproach}
            onChange={onChange}
            placeholder="e.g. Actionable Frameworks & Real Experiments"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Content Pillars */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Content Pillars (Comma-separated)
            </label>
            <InfoTooltip content="The 3-5 core themes that rotate in your content (e.g. AI Prompt Engineering, SaaS Pricing Models, Creator Workflows)." />
          </div>
          <input
            type="text"
            name="contentPillars"
            value={formData.contentPillars}
            onChange={onChange}
            placeholder="e.g. AI Agent Architecture, Open Source Tools, Solopreneur Playbooks"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
