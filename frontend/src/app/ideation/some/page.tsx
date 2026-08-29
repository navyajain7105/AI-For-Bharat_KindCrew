"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import { useIdeation } from "@/hooks/useIdeation";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Badge } from "@/components/ui/Badge";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEdit3,
  FiTarget,
  FiZap,
  FiLayers,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

const formatScore = (score: number | string | undefined): string => {
  if (typeof score === "number") return score.toFixed(1);
  if (typeof score === "string") return parseFloat(score).toFixed(1);
  return "0.0";
};

export default function SomeIdeaPage() {
  const router = useRouter();
  const { userInfo } = useAuth();
  const {
    ideas,
    selectedIdea,
    loading,
    error,
    refineIdea: refineIdeaAction,
    selectIdea,
    clearIdeas,
  } = useIdeation();

  const [formData, setFormData] = useState({
    roughIdea: "",
    audience: "startup founders",
    platform: "linkedin",
  });

  const handleRefine = async () => {
    if (!userInfo?.userId || !formData.roughIdea.trim()) return;
    await refineIdeaAction(userInfo.userId, "", formData);
  };

  const handleSelectIdea = (idea: (typeof ideas)[0]) => {
    sessionStorage.setItem(
      "selectedIdea",
      JSON.stringify({
        topic: (idea.title || formData.roughIdea).trim(),
        angle: (idea.angle || "Unique perspective for this audience").trim(),
        platform: (idea.platform || formData.platform).trim(),
        contentType: (idea.format || idea.contentType || "post").trim(),
        targetAudience: formData.audience,
        hookIdea: idea.hook || idea.hookIdea || "",
        scores: idea.scores,
      }),
    );

    router.push("/ideation/research");
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.push("/ideation")}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Ideation Hub
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Pathway 2 — Angle Refinement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Refine Your Rough Idea
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Transform a raw concept into 5 high-converting strategic angles tailored for your audience.
          </p>
        </div>

        {/* Input Form */}
        {ideas.length === 0 && (
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Your Rough Idea or Thesis
              </label>
              <textarea
                value={formData.roughIdea}
                onChange={(e) =>
                  setFormData({ ...formData, roughIdea: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600 resize-y min-h-[110px]"
                rows={4}
                placeholder="e.g., AI productivity tools, early-stage fundraising heuristics, or social distribution frameworks..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
                  placeholder="e.g., startup founders, product engineers"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Primary Platform
                </label>
                <select
                  title="Platform"
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefine}
              disabled={loading || !formData.roughIdea.trim()}
              className="w-full py-3 px-6 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              <FiEdit3 className="w-4 h-4" />
              {loading ? "Generating 5 Strategic Angles..." : "Refine into 5 Angles"}
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-800/40 bg-rose-950/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
            <FiAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Refined Ideas Result List */}
        {ideas.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">
                  5 Refined Strategic Angles
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select your strongest angle to advance into automated research and drafting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => clearIdeas()}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                Try Different Idea
              </button>
            </div>

            <div className="space-y-4">
              {ideas.map((idea, index) => {
                const isSelected = selectedIdea === idea;
                return (
                  <div
                    key={index}
                    onClick={() => selectIdea(idea)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                      isSelected
                        ? "border-amber-500/60 bg-zinc-950 shadow-md ring-1 ring-amber-500/20"
                        : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="default" className="text-[10px]">
                            {idea.platform}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {idea.format}
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-zinc-100">
                          {idea.title}
                        </h3>
                        <div className="text-xs text-zinc-300">
                          <span className="font-semibold text-zinc-400">Angle: </span>
                          <MarkdownRenderer content={idea.angle || ""} className="inline" />
                        </div>
                        {idea.hook && (
                          <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/80 flex items-start gap-2.5">
                            <FiTarget className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-zinc-300 flex-1">
                              <span className="font-semibold text-amber-400">Hook: </span>
                              <MarkdownRenderer content={idea.hook} className="inline" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Overall Score Meter */}
                      <div className="flex sm:flex-col items-center justify-between sm:justify-center p-3 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 min-w-[90px]">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                          Overall Score
                        </span>
                        <span
                          className={`text-2xl font-black ${getScoreColor(
                            Number(idea.scores?.overall || 0),
                          )}`}
                        >
                          {formatScore(idea.scores?.overall)}
                        </span>
                      </div>
                    </div>

                    {/* Sub-Scores Matrix */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/60 text-center">
                      <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase">
                          Virality
                        </p>
                        <p className={`text-sm font-bold mt-0.5 ${getScoreColor(Number(idea.scores?.virality || 0))}`}>
                          {formatScore(idea.scores?.virality)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase">
                          Clarity
                        </p>
                        <p className={`text-sm font-bold mt-0.5 ${getScoreColor(Number(idea.scores?.clarity || 0))}`}>
                          {formatScore(idea.scores?.clarity)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase">
                          Comp Edge
                        </p>
                        <p className={`text-sm font-bold mt-0.5 ${getScoreColor(10 - Number(idea.scores?.competition || 0))}`}>
                          {formatScore(idea.scores?.competition)}
                        </p>
                      </div>
                    </div>

                    {/* Select / Advance Action Button */}
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectIdea(idea);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] shadow-sm mt-2"
                      >
                        <span>Select Angle & Proceed to Research</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
