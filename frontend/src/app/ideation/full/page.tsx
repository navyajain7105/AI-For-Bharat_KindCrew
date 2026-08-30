"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { evaluateIdea, IdeaEvaluation } from "@/lib/api/ideation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Badge } from "@/components/ui/Badge";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiTarget,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

const formatScore = (score: number | string | undefined): string => {
  if (typeof score === "number") return score.toFixed(1);
  if (typeof score === "string") return parseFloat(score).toFixed(1);
  return "0.0";
};

export default function FullIdeaPage() {
  const router = useRouter();
  const { userInfo, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<IdeaEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    idea: "",
    audience: "startup founders",
    platform: "linkedin",
  });

  const handleEvaluate = async () => {
    if (!userInfo?.userId || !token) {
      setError("Your session is not ready. Please refresh and try again.");
      return;
    }

    if (!formData.idea.trim()) {
      setError("Please enter your content idea");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await evaluateIdea(token, formData);
      if (result.success && result.evaluation) {
        setEvaluation(result.evaluation);
      } else {
        setError(result.error || "Failed to evaluate idea");
      }
    } catch (err: unknown) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (!evaluation) return;

    sessionStorage.setItem(
      "selectedIdea",
      JSON.stringify({
        topic: evaluation.improvedTitle || formData.idea,
        angle: "full idea",
        platform: formData.platform,
        contentType: evaluation.format || "post",
        targetAudience: formData.audience,
        hookIdea: evaluation.suggestedHook || "",
        scores: evaluation.scores,
      }),
    );

    router.push("/ideation/research");
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return { color: "text-emerald-400", badge: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40", label: "High Viral Potential" };
    if (score >= 6) return { color: "text-amber-400", badge: "bg-amber-950/40 text-amber-300 border-amber-800/40", label: "Good Concept" };
    return { color: "text-rose-400", badge: "bg-rose-950/40 text-rose-300 border-rose-800/40", label: "Needs Optimization" };
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
              Pathway 3 — Concept Diagnostic & Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Evaluate Your Content Idea
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Run an AI diagnostic to score virality, clarity, and competitive saturation with actionable hooks.
          </p>
        </div>

        {/* Input Form */}
        {!evaluation && (
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Your Content Idea or Pitch
              </label>
              <textarea
                value={formData.idea}
                onChange={(e) =>
                  setFormData({ ...formData, idea: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600 resize-y min-h-[120px]"
                rows={4}
                placeholder="e.g., Top 5 AI tools founders can use to automate repetitive work and save 10 hours per week"
              />
              <p className="text-[11px] text-zinc-500">
                Be specific about your topic, core thesis, and primary takeaway.
              </p>
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
                  placeholder="e.g., startup founders, indie hackers"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Target Platform
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
              onClick={handleEvaluate}
              disabled={loading || !formData.idea.trim()}
              className="w-full py-3 px-6 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              <FiTarget className="w-4 h-4" />
              {loading ? "Running AI Evaluation Diagnostics..." : "Evaluate Idea"}
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

        {/* Evaluation Results */}
        {evaluation && (
          <div className="space-y-6">
            {/* Overall Score Banner */}
            <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Evaluation Scorecard
              </span>
              <div className={`text-6xl font-extrabold tracking-tight ${getScoreBadge(evaluation.scores.overall).color}`}>
                {formatScore(evaluation.scores.overall)}
              </div>
              <div className="inline-flex">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreBadge(evaluation.scores.overall).badge}`}>
                  {getScoreBadge(evaluation.scores.overall).label}
                </span>
              </div>
            </div>

            {/* Score Breakdown Matrix */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
                Metric Diagnostics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Virality Potential",
                    score: evaluation.scores.virality,
                    desc: "Estimated audience shareability",
                  },
                  {
                    label: "Clarity & Resonance",
                    score: evaluation.scores.clarity,
                    desc: "Core thesis crispness",
                  },
                  {
                    label: "Competitive Edge",
                    score: evaluation.scores.competition,
                    desc: "Differentiation vs saturated niches",
                  },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2 text-center">
                    <p className="text-xs font-semibold text-zinc-400">{item.label}</p>
                    <p className={`text-3xl font-extrabold ${getScoreBadge(item.score).color}`}>
                      {formatScore(item.score)}
                    </p>
                    <p className="text-[11px] text-zinc-500">{item.desc}</p>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, item.score * 10))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improved Version & Hook */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
                  AI-Optimized Title & Hook
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px]">{formData.platform}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{evaluation.format || "post"}</Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="text-sm font-bold text-zinc-100">
                  <MarkdownRenderer content={evaluation.improvedTitle || formData.idea} />
                </div>
                {evaluation.suggestedHook && (
                  <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-start gap-2.5">
                    <FiTarget className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-300 flex-1">
                      <span className="font-semibold text-amber-400">Suggested Hook: </span>
                      <MarkdownRenderer content={evaluation.suggestedHook} className="inline" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setEvaluation(null)}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                Evaluate Another Concept
              </button>
              <button
                type="button"
                onClick={handleProceed}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 shadow-sm"
              >
                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Proceed to Research & Drafting</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
