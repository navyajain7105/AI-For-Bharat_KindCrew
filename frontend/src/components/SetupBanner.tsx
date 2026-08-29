"use client";

import Link from "next/link";
import { FiCheckCircle, FiCircle, FiTrendingUp } from "react-icons/fi";
import { useAppStore } from "@/store/useAppStore";

type SetupBannerProps = {
  onDismiss?: () => void;
};

export default function SetupBanner({ onDismiss }: SetupBannerProps) {
  const creatorProfile = useAppStore((state) => state.creatorProfile);
  const hasProfile = useAppStore((state) => state.hasProfile);

  // Derived Checklist values
  const hasNiche = !!creatorProfile?.niche?.primary;
  const hasAudience = !!creatorProfile?.targetAudience;
  const hasPlatforms = !!(creatorProfile?.platforms && creatorProfile.platforms.length > 0);
  const hasStrategy = !!(
    creatorProfile?.strategy?.postingFrequency &&
    creatorProfile.strategy.postingFrequency !== "1/week"
  );
  const hasVoice = !!(
    creatorProfile?.preferences?.voiceTone ||
    (creatorProfile?.preferences?.tones && creatorProfile.preferences.tones.length > 1)
  );

  const checklistItems = [
    { label: "Account Setup", completed: true },
    { label: "Niche Focus", completed: hasNiche },
    { label: "Audience Target", completed: hasAudience },
    { label: "Platforms Linked", completed: hasPlatforms },
    { label: "Content Strategy", completed: hasStrategy },
    { label: "Brand Voice", completed: hasVoice },
  ];

  const completedCount = checklistItems.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div
      className="p-5 sm:p-6 rounded-xl mb-6 border border-slate-800"
      style={{
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Personalize KindCrew ({progressPercent}% Complete)
            </h3>
          </div>

          <p className="text-sm text-slate-400 max-w-xl">
            Baseline your audience and brand settings to unlock customized AI ideas, specific post variants, and smart suggestions tailored to your voice.
          </p>

          {/* Progress checklist line */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
            {checklistItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                {item.completed ? (
                  <FiCheckCircle className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <FiCircle className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={item.completed ? "text-slate-300 font-medium" : "text-slate-500"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row md:flex-col lg:flex-row gap-3 min-w-[200px]">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium border border-slate-700 text-slate-300 hover:bg-slate-900 transition-colors text-sm"
            >
              Dismiss
            </button>
          )}
          <Link
            href={hasProfile ? "/settings" : "/onboarding"}
            className="flex-1 px-5 py-2.5 rounded-lg font-medium text-center bg-white text-slate-950 hover:bg-slate-200 transition-colors text-sm flex items-center justify-center gap-1"
          >
            {hasProfile ? "Optimize Settings" : "Configure Wizard"}
          </Link>
        </div>
      </div>
    </div>
  );
}
