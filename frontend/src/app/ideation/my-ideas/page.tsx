"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  enrichIdeaResearch,
  getUserIdeas,
  IdeaBrief,
} from "@/lib/api/ideation";
import { createContentFromIdea } from "@/lib/api/content";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Badge } from "@/components/ui/Badge";
import {
  FiArrowLeft,
  FiCheck,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiFolder,
  FiPlus,
  FiSearch,
  FiEdit3,
  FiTarget,
  FiAlertCircle,
  FiLayers,
  FiShare2,
} from "react-icons/fi";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function safeText(val: any): string {
  if (val == null) return "";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

const formatScore = (score: number | string | undefined): string => {
  if (typeof score === "number") return score.toFixed(1);
  if (typeof score === "string") return parseFloat(score).toFixed(1);
  return "0.0";
};

type NormalizedResearch = {
  audiencePainPoints: string[];
  competitorPatterns: string[];
  keyPoints: string[];
  recommendedStructure: string;
  yourAngleStrength: string;
};

function normalizeResearchData(idea: IdeaBrief): NormalizedResearch {
  const toRecord = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch (_error) {
        return {};
      }
    }
    return {};
  };

  const asStringArray = (value: unknown): string[] => {
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

  const getFirstArray = (
    obj: Record<string, unknown>,
    keys: string[],
  ): string[] => {
    for (const key of keys) {
      const value = asStringArray(obj[key]);
      if (value.length > 0) return value;
    }
    return [];
  };

  const getFirstString = (
    obj: Record<string, unknown>,
    keys: string[],
  ): string => {
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
    return "";
  };

  const research = toRecord(idea.research);

  return {
    audiencePainPoints: getFirstArray(research, [
      "audiencePainPoints",
      "audience_pain_points",
      "painPoints",
    ]),
    competitorPatterns: getFirstArray(research, [
      "competitorPatterns",
      "competitor_patterns",
      "competitors",
    ]),
    keyPoints: getFirstArray(research, [
      "keyPoints",
      "key_points",
      "keyInsights",
      "insights",
    ]).length
      ? getFirstArray(research, [
          "keyPoints",
          "key_points",
          "keyInsights",
          "insights",
        ])
      : (Array.isArray(idea.keyPoints) ? idea.keyPoints : [])
          .map((item) => String(item).trim())
          .filter(Boolean),
    recommendedStructure: getFirstString(research, [
      "recommendedStructure",
      "recommended_structure",
      "structure",
    ]),
    yourAngleStrength: getFirstString(research, [
      "yourAngleStrength",
      "your_angle_strength",
      "angleStrength",
    ]),
  };
}

export default function MyIdeasPage() {
  const router = useRouter();
  const { userInfo, token, authReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<IdeaBrief[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [copiedIdeaId, setCopiedIdeaId] = useState<string | null>(null);
  const [researchingIdeaId, setResearchingIdeaId] = useState<string | null>(null);
  const [generatingContentIdeaId, setGeneratingContentIdeaId] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && userInfo?.userId && token) {
      loadIdeas();
    } else if (authReady && !userInfo?.userId) {
      setLoading(false);
      setError("Not authenticated");
    }
  }, [authReady, userInfo?.userId, token]);

  const loadIdeas = async () => {
    if (!userInfo?.userId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getUserIdeas(token);
      if (result.success && result.ideas) {
        setIdeas(result.ideas);
      } else {
        setError(result.error || "Failed to load ideas");
      }
    } catch (err: unknown) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    return "text-rose-400";
  };

  const formatDate = (dateString: string | number | undefined) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recent";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const buildIdeaExportText = (idea: IdeaBrief) => {
    const lines = [
      `Title: ${idea.topic || "N/A"}`,
      `Platform: ${idea.platform || "N/A"}`,
      `Content Type: ${idea.contentType || "N/A"}`,
      `Audience: ${idea.targetAudience || "N/A"}`,
      `Angle: ${idea.angle || "N/A"}`,
      `Hook: ${idea.hookIdea || "N/A"}`,
      "",
      "Scores:",
      `- Overall: ${formatScore(idea.scores?.overall)}/10`,
      `- Virality: ${formatScore(idea.scores?.virality)}/10`,
      `- Clarity: ${formatScore(idea.scores?.clarity)}/10`,
      `- Competition: ${formatScore(idea.scores?.competition)}/10`,
    ];
    return lines.join("\n");
  };

  const handleCopyIdea = async (idea: IdeaBrief) => {
    try {
      await navigator.clipboard.writeText(buildIdeaExportText(idea));
      setCopiedIdeaId(idea.ideaId);
      setTimeout(() => setCopiedIdeaId(null), 1500);
    } catch (_error) {
      setError("Unable to copy content.");
    }
  };

  const handleGenerateResearch = async (idea: IdeaBrief) => {
    if (!userInfo?.userId || !token) return;
    setError(null);
    setResearchingIdeaId(idea.ideaId);
    try {
      const result = await enrichIdeaResearch(token, idea.ideaId);
      if (!result.success) {
        setError(result.error || "Failed to generate research");
        return;
      }
      await loadIdeas();
      setExpandedIdeaId(idea.ideaId);
    } catch (err: unknown) {
      setError(toErrorMessage(err));
    } finally {
      setResearchingIdeaId(null);
    }
  };

  const handleGenerateContent = async (idea: IdeaBrief) => {
    if (!userInfo?.userId || !token) return;
    setError(null);
    setGeneratingContentIdeaId(idea.ideaId);
    try {
      const result = await createContentFromIdea(token, idea.ideaId);
      if (!result.success) {
        setError(result.error || "Failed to generate content");
        return;
      }
      router.push("/content/library");
    } catch (err: unknown) {
      setError(toErrorMessage(err));
    } finally {
      setGeneratingContentIdeaId(null);
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      !searchQuery.trim() ||
      idea.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.angle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform =
      selectedPlatform === "all" ||
      idea.platform?.toLowerCase() === selectedPlatform.toLowerCase();
    return matchesSearch && matchesPlatform;
  });

  const highScoringCount = ideas.filter((i) => Number(i.scores?.overall || 0) >= 8).length;
  const readyCount = ideas.filter((i) => i.hasContent).length;

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Stage 1 — Ideation Vault
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              My Approved Ideas
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Browse curated ideas, inspect research foundations, and launch full multi-platform drafting.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/ideation")}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 hover:bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-950 shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4" />
            <span>Generate New Ideas</span>
          </button>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <p className="text-xs text-zinc-400 font-medium">Total Saved Ideas</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{ideas.length}</p>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <p className="text-xs text-zinc-400 font-medium">High Potential (8.0+ Score)</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{highScoringCount}</p>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <p className="text-xs text-zinc-400 font-medium">Drafts Generated</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{readyCount}</p>
          </div>
        </div>

        {/* Search & Platform Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas by topic, keyword, or angle..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-full sm:w-auto overflow-x-auto">
            {["all", "linkedin", "twitter", "instagram", "youtube"].map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                  selectedPlatform === plat
                    ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {plat === "all" ? "All Platforms" : plat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-rose-800/40 bg-rose-950/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
            <FiAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Ideas Grid / List */}
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs sm:text-sm">
            Loading your ideas vault...
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-3">
            <FiFolder className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No ideas found</p>
            <p className="text-xs text-zinc-500">
              {searchQuery ? "Try refining your search query." : "Generate ideas using our AI ideation engine."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIdeas.map((idea) => {
              const isExpanded = expandedIdeaId === idea.ideaId;
              const research = normalizeResearchData(idea);
              const hasResearch =
                research.audiencePainPoints.length > 0 ||
                research.competitorPatterns.length > 0 ||
                research.keyPoints.length > 0 ||
                !!research.recommendedStructure ||
                !!research.yourAngleStrength;

              return (
                <div
                  key={idea.ideaId}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isExpanded
                      ? "border-zinc-700 bg-zinc-950 shadow-md"
                      : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-[10px]">
                          {safeText(idea.platform) || "linkedin"}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {safeText(idea.contentType) || "post"}
                        </Badge>
                      </div>
                      <span className={`text-lg font-extrabold ${getScoreColor(Number(idea.scores?.overall || 0))}`}>
                        {formatScore(idea.scores?.overall)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-zinc-100 leading-snug">
                      {safeText(idea.topic)}
                    </h3>

                    {idea.hookIdea && (
                      <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300">
                        <span className="font-semibold text-amber-400">Hook: </span>
                        <MarkdownRenderer content={safeText(idea.hookIdea)} className="inline" />
                      </div>
                    )}

                    {idea.angle && (
                      <div className="text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">Angle: </span>
                        <MarkdownRenderer content={safeText(idea.angle)} className="inline" />
                      </div>
                    )}
                  </div>

                  {/* Expanded Research Details */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-zinc-800/80 space-y-3.5">
                      {hasResearch ? (
                        <div className="space-y-3 text-xs">
                          {research.audiencePainPoints.length > 0 && (
                            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Audience Pain Points
                              </p>
                              <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                                {research.audiencePainPoints.map((pt, idx) => (
                                  <li key={idx}>
                                    <MarkdownRenderer content={pt} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {research.keyPoints.length > 0 && (
                            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Key Insights
                              </p>
                              <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                                {research.keyPoints.map((kp, idx) => (
                                  <li key={idx}>
                                    <MarkdownRenderer content={kp} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {research.recommendedStructure && (
                            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Recommended Structure
                              </p>
                              <MarkdownRenderer content={research.recommendedStructure} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-center space-y-2">
                          <p className="text-xs text-zinc-400">No enriched research data yet.</p>
                          <button
                            type="button"
                            onClick={() => handleGenerateResearch(idea)}
                            disabled={researchingIdeaId === idea.ideaId}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                          >
                            {researchingIdeaId === idea.ideaId ? "Enriching..." : "Enrich Research"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions & Card Footer */}
                  <div className="space-y-3 pt-3 border-t border-zinc-800/60">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Created {formatDate(idea.createdAt)}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyIdea(idea)}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                          title="Copy Idea"
                        >
                          {copiedIdeaId === idea.ideaId ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedIdeaId(isExpanded ? null : idea.ideaId)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateContent(idea)}
                      disabled={generatingContentIdeaId === idea.ideaId || idea.hasContent}
                      className="w-full py-2 px-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" />
                      <span>
                        {generatingContentIdeaId === idea.ideaId
                          ? "Drafting Content..."
                          : idea.hasContent
                          ? "Content Generated (View in Library)"
                          : "Generate Content From Idea"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
