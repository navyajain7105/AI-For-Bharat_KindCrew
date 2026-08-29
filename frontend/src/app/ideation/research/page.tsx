"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  researchIdea,
  selectIdea,
  ResearchData,
  IdeaBrief,
} from "@/lib/api/ideation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Badge } from "@/components/ui/Badge";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiSearch,
  FiTarget,
  FiZap,
  FiLayers,
} from "react-icons/fi";

type SelectedIdea = Pick<
  IdeaBrief,
  | "topic"
  | "angle"
  | "platform"
  | "contentType"
  | "targetAudience"
  | "hookIdea"
  | "scores"
>;

function normalizeSelectedIdea(raw: unknown): SelectedIdea {
  const data =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    topic: String(data.topic || data.title || "").trim(),
    angle: String(data.angle || "General strategic angle").trim(),
    platform: String(data.platform || "linkedin").trim(),
    contentType: String(data.contentType || data.format || "post").trim(),
    targetAudience: String(
      data.targetAudience || data.audience || "General audience",
    ).trim(),
    hookIdea: String(data.hookIdea || data.hook || "").trim(),
    scores: {
      virality: Number(
        (data.scores as Record<string, unknown> | undefined)?.virality ?? 0,
      ),
      clarity: Number(
        (data.scores as Record<string, unknown> | undefined)?.clarity ?? 0,
      ),
      competition: Number(
        (data.scores as Record<string, unknown> | undefined)?.competition ?? 0,
      ),
      overall: Number(
        (data.scores as Record<string, unknown> | undefined)?.overall ?? 0,
      ),
    },
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

const formatScore = (score: number | string | undefined): string => {
  if (typeof score === "number") return score.toFixed(1);
  if (typeof score === "string") return parseFloat(score).toFixed(1);
  return "0.0";
};

function normalizeResearchResponse(raw: unknown): ResearchData {
  const data =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const normalizeArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item ?? "").trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(/\n|\||,|;/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const normalizeString = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
  };

  return {
    audiencePainPoints: normalizeArray(
      data.audiencePainPoints ?? data.audience_pain_points ?? data.painPoints,
    ),
    competitorPatterns: normalizeArray(
      data.competitorPatterns ?? data.competitor_patterns ?? data.competitors,
    ),
    keyPoints: normalizeArray(
      data.keyPoints ?? data.key_points ?? data.keyInsights ?? data.insights,
    ),
    recommendedStructure: normalizeString(
      data.recommendedStructure ?? data.recommended_structure ?? data.structure,
    ),
    yourAngleStrength: normalizeString(
      data.yourAngleStrength ?? data.your_angle_strength ?? data.angleStrength,
    ),
  };
}

export default function ResearchPage() {
  const router = useRouter();
  const { userInfo, token, authReady } = useAuth();
  const [loading, setLoading] = useState(false);
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<SelectedIdea | null>(null);

  useEffect(() => {
    const storedIdea = sessionStorage.getItem("selectedIdea");
    if (!storedIdea) {
      router.push("/ideation");
      return;
    }
    try {
      const parsed = JSON.parse(storedIdea);
      setSelectedIdea(normalizeSelectedIdea(parsed));
    } catch {
      router.push("/ideation");
    }
  }, [router]);

  const handleResearch = async () => {
    if (!selectedIdea || !userInfo?.userId || !token) {
      setError("Your session is not ready. Please refresh and try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await researchIdea(token, {
        idea: selectedIdea.topic,
        audience: selectedIdea.targetAudience,
      });

      if (result.success && result.research) {
        const normalized = normalizeResearchResponse(result.research);
        setResearch(normalized);
      } else {
        setError(result.error || "Failed to generate research");
      }
    } catch (err: unknown) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (!selectedIdea || !userInfo?.userId || !token) return;
    setLoading(true);
    setError(null);

    try {
      const payload: Partial<IdeaBrief> = {
        topic: selectedIdea.topic,
        angle: selectedIdea.angle,
        platform: selectedIdea.platform,
        contentType: selectedIdea.contentType,
        targetAudience: selectedIdea.targetAudience,
        hookIdea: selectedIdea.hookIdea || undefined,
        scores: selectedIdea.scores,
        research: research || undefined,
      };

      const selectResult = await selectIdea(token, payload);
      if (!selectResult.success) {
        setError(selectResult.error || "Failed to save idea");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("ideaId", selectResult.ideaId || "");
      sessionStorage.setItem("selectedIdea", JSON.stringify(payload));
      router.push("/ideation/success");
    } catch (err: unknown) {
      setError(toErrorMessage(err));
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    return "text-rose-400";
  };

  if (!selectedIdea) {
    return (
      <AuthenticatedLayout>
        <div className="p-12 text-center text-zinc-500 text-xs">
          Loading concept context...
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Stage 1.5 — Deep Market Research & Validation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Concept Research & Competitive Angles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Synthesize audience pain points, proven viral hooks, and structural blueprints before drafting.
          </p>
        </div>

        {/* Selected Concept Overview Card */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">
                {selectedIdea.platform}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {selectedIdea.contentType}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {selectedIdea.targetAudience}
              </Badge>
            </div>
            {selectedIdea.scores && (
              <span className={`text-base font-bold ${getScoreColor(selectedIdea.scores.overall)}`}>
                Score: {formatScore(selectedIdea.scores.overall)}
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <h2 className="text-base font-bold text-zinc-100">
              {selectedIdea.topic}
            </h2>
            {selectedIdea.hookIdea && (
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-start gap-2.5">
                <FiTarget className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 flex-1">
                  <span className="font-semibold text-amber-400">Hook: </span>
                  <MarkdownRenderer content={selectedIdea.hookIdea} className="inline" />
                </div>
              </div>
            )}
            {selectedIdea.angle && (
              <div className="text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Angle: </span>
                <MarkdownRenderer content={selectedIdea.angle} className="inline" />
              </div>
            )}
          </div>

          {!research && (
            <button
              type="button"
              onClick={handleResearch}
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              {loading ? "Conducting Deep Market Research..." : "Start Research & Competitive Analysis"}
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-rose-800/40 bg-rose-950/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
            <FiAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Research Results Grid */}
        {research && (
          <div className="space-y-6">
            {/* Audience Pain Points */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
                  Audience Pain Points & Trigger Points
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {research.audiencePainPoints?.map((pain: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-md bg-rose-950/60 text-rose-400 border border-rose-800/40 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-xs text-zinc-300 flex-1">
                      <MarkdownRenderer content={pain} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Patterns */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <div className="flex items-center gap-2">
                <FiTarget className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
                  Proven Frameworks & What Works
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {research.competitorPatterns?.map((pat: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3"
                  >
                    <FiCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-300 flex-1">
                      <MarkdownRenderer content={pat} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Angle Strength & Structure */}
            {(research.yourAngleStrength || research.recommendedStructure) && (
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                <div className="flex items-center gap-2">
                  <FiZap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
                    Strategy & Recommended Structure
                  </h3>
                </div>

                {research.yourAngleStrength && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Why Your Angle Wins
                    </p>
                    <MarkdownRenderer content={research.yourAngleStrength} />
                  </div>
                )}

                {research.recommendedStructure && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Recommended Outline Flow
                    </p>
                    <MarkdownRenderer content={research.recommendedStructure} />
                  </div>
                )}
              </div>
            )}

            {/* Next Step Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceed}
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-sm flex items-center justify-center gap-2"
              >
                <span>Save Concept & Proceed to Content Studio</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
