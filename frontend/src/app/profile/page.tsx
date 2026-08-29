"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import {
  FiTarget,
  FiEdit3,
  FiCheckCircle,
  FiUsers,
  FiClock,
  FiTag,
  FiLayers,
  FiShare2,
  FiSliders,
  FiAward,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { getDisplayName } from "@/lib/userUtils";
import { Badge } from "@/components/ui/Badge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export default function ProfilePage() {
  const router = useRouter();
  const { userInfo, token, authReady, logout } = useAuth();
  const authenticated = !!token && !!userInfo;
  const creatorProfile = useAppStore((state) => state.creatorProfile);
  const hasProfile = useAppStore((state) => state.hasProfile);
  const profileChecked = useAppStore((state) => state.profileChecked);
  const profileLoading = useAppStore((state) => state.profileLoading);
  const fetchProfile = useAppStore((state) => state.fetchProfile);

  useEffect(() => {
    if (authReady && !authenticated) {
      router.replace("/");
    }
  }, [authReady, authenticated, router]);

  useEffect(() => {
    if (token && authenticated && authReady && !profileChecked && !profileLoading) {
      fetchProfile(token);
    }
  }, [token, authenticated, authReady, profileChecked, profileLoading, fetchProfile]);

  const handleLogout = () => {
    logout();
  };

  const profileContent = (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Creator Profile
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your personalized identity, audience focus, and content strategy context.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs sm:text-sm font-medium transition-all shadow-sm"
          >
            <FiSettings className="w-4 h-4" />
            Edit Settings
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-800/60 text-zinc-400 hover:text-rose-300 text-xs sm:text-sm font-medium transition-all"
          >
            <FiLogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Identity Hero Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {userInfo?.profileImage ? (
            <img
              src={userInfo.profileImage}
              alt={getDisplayName(userInfo)}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-2 ring-zinc-700 object-cover shadow-md"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl font-bold text-zinc-200 uppercase shadow-md">
              {getDisplayName(userInfo).charAt(0) || "U"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 truncate">
                {getDisplayName(userInfo)}
              </h2>
              <Badge variant="success" className="gap-1 text-[11px]">
                <FiCheckCircle className="w-3 h-3 text-emerald-400" />
                Active Creator
              </Badge>
              {creatorProfile?.goals?.creatorLevel && (
                <Badge variant="default" className="capitalize text-[11px]">
                  {creatorProfile.goals.creatorLevel} Level
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 truncate">
              {userInfo?.email || "No email"}
            </p>

            {creatorProfile?.niche?.primary && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-zinc-800/80">
                <span className="text-xs text-zinc-400 font-medium">Core Focus:</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800/90 border border-zinc-700 text-xs font-semibold text-zinc-200">
                  {creatorProfile.niche.primary}
                </span>
                {creatorProfile.niche?.secondary && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                    {creatorProfile.niche.secondary}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasProfile && creatorProfile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Niche & Audience Card */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
              <FiTarget className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">
                Niche & Target Audience
              </h3>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Primary Niche</p>
                <p className="text-sm font-semibold text-zinc-200">
                  {creatorProfile.niche?.primary || "Not configured"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Secondary Niche</p>
                <p className="text-sm text-zinc-300">
                  {creatorProfile.niche?.secondary || "None specified"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Target Audience</p>
                <p className="text-sm font-medium text-zinc-200 capitalize">
                  {creatorProfile.targetAudience?.replace(/-/g, " ") || "General Audience"}
                </p>
              </div>
            </div>
          </div>

          {/* Strategy & Goals Card */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
              <FiAward className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">
                Strategy & Objectives
              </h3>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Primary Goal</p>
                <p className="text-sm font-semibold text-zinc-200 capitalize">
                  {creatorProfile.goals?.primaryGoal?.replace(/-/g, " ") || "Build Audience"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Content Strategy Framework</p>
                <p className="text-sm font-medium text-zinc-300 capitalize">
                  {creatorProfile.strategy?.contentStrategy?.replace(/-/g, " ") || "Growth Focused"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Posting Cadence</p>
                <p className="text-sm text-zinc-300">
                  {creatorProfile.strategy?.postingFrequency || "3-4 posts per week"}
                </p>
              </div>
            </div>
          </div>

          {/* Content Pillars & Voice */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
              <FiLayers className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">
                Content Pillars & AI Voice
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-2">Content Pillars</p>
                {Array.isArray(creatorProfile.strategy?.contentPillars) &&
                creatorProfile.strategy.contentPillars.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {creatorProfile.strategy.contentPillars.map((pillar: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-200"
                      >
                        {pillar}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No pillars added</p>
                )}
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-medium mb-2">Brand Voice & Tone</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    Formality: {creatorProfile.preferences?.constraints?.formality || "Semi-formal"}
                  </Badge>
                  {Array.isArray(creatorProfile.preferences?.tones) &&
                    creatorProfile.preferences.tones.map((t: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="capitalize">
                        {t}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Channels */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
              <FiShare2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">
                Distribution Platforms
              </h3>
            </div>

            <div className="space-y-2.5">
              {(creatorProfile.platforms || []).map((platform, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/60"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{platform.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{platform.handle}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      platform.active
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                        : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    {platform.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {(!creatorProfile.platforms || creatorProfile.platforms.length === 0) && (
                <p className="text-xs text-zinc-500 italic">No distribution platforms linked yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40">
          <FiTarget className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-200 mb-1">No Creator Details Configured</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Set up your niche, target audience, and content pillars to enable customized AI generation.
          </p>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all shadow-sm"
          >
            Configure Profile in Settings
          </button>
        </div>
      )}
    </div>
  );

  return <AuthenticatedLayout>{profileContent}</AuthenticatedLayout>;
}
