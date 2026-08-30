"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserIdeas, IdeaBrief } from "@/lib/api/ideation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  FiArrowRight,
  FiCompass,
  FiEdit3,
  FiTarget,
  FiZap,
  FiList,
  FiLayers,
} from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function IdeationPage() {
  const router = useRouter();
  const { userInfo, token, authReady } = useAuth();
  const authenticated = !!token && !!userInfo;
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [recentIdeas, setRecentIdeas] = useState<IdeaBrief[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  const paths = [
    {
      id: "zero",
      step: "Pathway A",
      title: "I have no idea what to create",
      description:
        "Let AI generate high-potential concepts matched directly to your niche, audience, and platform goals.",
      icon: FiZap,
      path: "/ideation/zero",
      highlight: "Zero to Concepts",
    },
    {
      id: "some",
      step: "Pathway B",
      title: "I have a rough thought or topic",
      description:
        "Take a seed hook or observation and refine it into strategic, structured angles and formats.",
      icon: FiEdit3,
      path: "/ideation/some",
      highlight: "Refine & Shape",
    },
    {
      id: "full",
      step: "Pathway C",
      title: "I have a complete concept",
      description:
        "Score and critically evaluate your idea against virality, engagement, and brand alignment rubrics.",
      icon: FiTarget,
      path: "/ideation/full",
      highlight: "Score & Evaluate",
    },
  ];

  const handleSelect = (path: string) => {
    setSelectedPath(path);
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

  useEffect(() => {
    const loadRecentIdeas = async () => {
      if (!token) return;
      setIdeasLoading(true);
      try {
        const result = await getUserIdeas(token);
        if (result.success && Array.isArray(result.ideas)) {
          setRecentIdeas(result.ideas.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load ideas:", error);
      } finally {
        setIdeasLoading(false);
      }
    };

    if (authReady && authenticated && token) {
      loadRecentIdeas();
    }
  }, [authReady, authenticated, token]);

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Stage 1 — Ideation Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Research & Ideation
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Select the ideation pathway that matches your current creative clarity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/ideation/my-ideas")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs sm:text-sm font-medium transition-all shadow-sm self-start sm:self-auto"
          >
            <FiList className="w-4 h-4" />
            My Ideas Library
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paths.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedPath === option.path;
            return (
              <div
                key={option.id}
                onClick={() => handleSelect(option.path)}
                className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6 group ${
                  isSelected
                    ? "bg-zinc-900 border-zinc-500 scale-[1.01]"
                    : "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-amber-400 transition-colors">
                      {option.step}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                      {option.highlight}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 group-hover:scale-105 group-hover:border-zinc-700 transition-all shadow-sm">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>

                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors leading-snug">
                    {option.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors pt-3 border-t border-zinc-800/60">
                  <span>Start flow</span>
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Ideas Quick Access */}
        <div className="p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <FiLayers className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
                Recently Generated Ideas
              </h2>
            </div>
            <button
              type="button"
              onClick={() => router.push("/ideation/my-ideas")}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              View all
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {ideasLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : recentIdeas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentIdeas.map((idea) => {
                const ideaTitle = idea.topic || (idea as any).title || "Content Concept";
                const score = typeof idea.scores?.overall === "number"
                  ? idea.scores.overall
                  : typeof (idea as any).score === "number"
                  ? (idea as any).score
                  : 0;
                return (
                  <div
                    key={idea.ideaId}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {ideaTitle}
                        </span>
                        {score > 0 && (
                          <span className="text-xs font-bold text-amber-400">
                            {score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {idea.angle || idea.hookIdea || (idea as any).description || "Structured concept ready for drafting"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/content/create?ideaId=${idea.ideaId}`)}
                      className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                    >
                      Draft Content
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FiCompass}
              title="No ideas created yet"
              description="Pick one of the three pathways above to start generating concepts."
            />
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
