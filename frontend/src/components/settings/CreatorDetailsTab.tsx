"use client";

import React from "react";
import { DefaultBadge } from "@/components/ui/DefaultBadge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface CreatorDetailsTabProps {
  formData: {
    primaryNiche: string;
    secondaryNiche: string;
    targetAudience: string;
    creatorLevel: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  creatorProfile: any;
}

export function CreatorDetailsTab({
  formData,
  onChange,
  creatorProfile,
}: CreatorDetailsTabProps) {
  const isDefaultAudience =
    !creatorProfile?.targetAudience && formData.targetAudience.length > 0;
  const isDefaultLevel =
    !creatorProfile?.goals?.creatorLevel && formData.creatorLevel === "beginner";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-zinc-100">
          Core Creator Details
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Define your primary domain, secondary interests, and target audience to orient all AI generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Primary Niche */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Primary Niche <span className="text-rose-400">*</span>
            </label>
            <InfoTooltip content="Your core industry or topic area (e.g. AI Engineering, Fitness, SaaS Growth)." />
          </div>
          <input
            type="text"
            name="primaryNiche"
            value={formData.primaryNiche}
            onChange={onChange}
            placeholder="e.g. Artificial Intelligence & SaaS"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            required
          />
        </div>

        {/* Secondary Niche */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Secondary Niche
            </label>
            <InfoTooltip content="Optional secondary niche or intersecting angle (e.g. Productivity, Solopreneurship)." />
          </div>
          <input
            type="text"
            name="secondaryNiche"
            value={formData.secondaryNiche}
            onChange={onChange}
            placeholder="e.g. Solo-founder Productivity"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Target Audience <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              {isDefaultAudience && (
                <DefaultBadge description="Default audience inferred from your initial setup." />
              )}
              <InfoTooltip content="Who this content is built for (e.g. Developers, Startup Founders, Busy Execs)." />
            </div>
          </div>
          <input
            type="text"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={onChange}
            placeholder="e.g. Early-stage Founders & Technical Creators"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            required
          />
        </div>

        {/* Creator Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Creator Stage / Level
            </label>
            <div className="flex items-center gap-1.5">
              {isDefaultLevel && (
                <DefaultBadge description="Initial stage defaulted to Beginner." />
              )}
              <InfoTooltip content="Helps calibrate complexity, vocabulary, and posting recommendations." />
            </div>
          </div>
          <select
            name="creatorLevel"
            value={formData.creatorLevel}
            onChange={onChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="beginner">Beginner (Building first 1K followers)</option>
            <option value="intermediate">Intermediate (Growing 1K-10K community)</option>
            <option value="advanced">Advanced (Established creator / 10K+)</option>
            <option value="expert">Expert / Authority (Industry leader)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
