"use client";

import React from "react";
import { DefaultBadge } from "@/components/ui/DefaultBadge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface WritingToneTabProps {
  formData: {
    tones: string;
    formats: string;
    contentStyle: string;
    voiceTone: string;
    avoidTopics: string;
    formality: string;
    ctaStrength: string;
    emojiUsage: boolean;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  creatorProfile: any;
}

export function WritingToneTab({
  formData,
  onChange,
  creatorProfile,
}: WritingToneTabProps) {
  const isDefaultStyle =
    !creatorProfile?.preferences?.contentStyle &&
    formData.contentStyle === "Professional";
  const isDefaultFormality =
    !creatorProfile?.preferences?.constraints?.formality &&
    formData.formality === "semi-formal";
  const isDefaultCta =
    !creatorProfile?.preferences?.constraints?.ctaStrength &&
    formData.ctaStrength === "medium";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-zinc-100">
          Writing Style & AI Voice Tone
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Fine-tune the voice, formality, formats, and phrasing rules used by Bedrock when generating drafts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Preferred Tones */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Preferred Brand Tones (Comma-separated)
            </label>
            <InfoTooltip content="Tones to infuse into posts (e.g. insightful, witty, direct, conversational, inspirational)." />
          </div>
          <input
            type="text"
            name="tones"
            value={formData.tones}
            onChange={onChange}
            placeholder="e.g. analytical, candid, witty, encouraging"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Content Style Preset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Content Style
            </label>
            <div className="flex items-center gap-1.5">
              {isDefaultStyle && (
                <DefaultBadge description="Default style preset." />
              )}
              <InfoTooltip content="Determines overall posture (Educational breakdowns vs. Opinionated hot-takes)." />
            </div>
          </div>
          <select
            name="contentStyle"
            value={formData.contentStyle}
            onChange={onChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="Professional">Professional (Polished & Credible)</option>
            <option value="Conversational">Conversational (Authentic & Relatable)</option>
            <option value="Storyteller">Storyteller (Narrative-driven lessons)</option>
            <option value="Provocative">Provocative (Bold & Contrarian)</option>
            <option value="Educational">Educational (Tactical step-by-step)</option>
          </select>
        </div>

        {/* Formality Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Formality Level
            </label>
            <div className="flex items-center gap-1.5">
              {isDefaultFormality && (
                <DefaultBadge description="Default formality set to Semi-Formal." />
              )}
              <InfoTooltip content="Sets vocabulary style: Casual (slang allowed) vs. Strict Academic." />
            </div>
          </div>
          <select
            name="formality"
            value={formData.formality}
            onChange={onChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="casual">Casual (Relaxed, colloquial)</option>
            <option value="semi-formal">Semi-Formal (Approachable yet professional)</option>
            <option value="formal">Formal (Structured & authoritative)</option>
          </select>
        </div>

        {/* Call to Action Strength */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              CTA Aggressiveness
            </label>
            <div className="flex items-center gap-1.5">
              {isDefaultCta && (
                <DefaultBadge description="Default CTA strength set to Medium." />
              )}
              <InfoTooltip content="Controls whether closing hooks ask soft questions or strong direct conversion links." />
            </div>
          </div>
          <select
            name="ctaStrength"
            value={formData.ctaStrength}
            onChange={onChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="soft">Soft (Open-ended question, conversation starter)</option>
            <option value="medium">Medium (Engaging action: follow, repost, comment)</option>
            <option value="strong">Strong (Conversion prompt: newsletter, link in bio)</option>
          </select>
        </div>

        {/* Preferred Content Formats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Preferred Formats (Comma-separated)
            </label>
            <InfoTooltip content="Preferred structure styles (e.g. threads, carousels, how-to guides, teardowns)." />
          </div>
          <input
            type="text"
            name="formats"
            value={formData.formats}
            onChange={onChange}
            placeholder="e.g. Thread, Carousel, Story, Teardown"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Topics to Avoid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              Topics to Avoid / Guardrails
            </label>
            <InfoTooltip content="Topics, buzzwords, or sensitive themes you never want included in your drafts." />
          </div>
          <input
            type="text"
            name="avoidTopics"
            value={formData.avoidTopics}
            onChange={onChange}
            placeholder="e.g. Politics, get-rich-quick, crypto speculation"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Emoji Toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800/80 bg-zinc-950 cursor-pointer hover:border-zinc-700 transition-colors">
          <input
            type="checkbox"
            name="emojiUsage"
            checked={formData.emojiUsage}
            onChange={onChange}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-200">
              Allow Tasteful Emojis in Content Drafts
            </p>
            <p className="text-[11px] text-zinc-500">
              When checked, AI will sprinkle relevant contextual icons to enhance formatting and readability.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
