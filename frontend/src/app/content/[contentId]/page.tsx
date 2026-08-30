"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { getContentById } from "@/lib/api/content";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Badge } from "@/components/ui/Badge";
import {
  FiArrowLeft,
  FiCopy,
  FiCheck,
  FiTarget,
  FiAlertCircle,
  FiLayers,
} from "react-icons/fi";

interface PlatformVariant {
  platform: string;
  postText?: string;
  thread?: string[];
  caption?: string;
  hashtags?: string[];
  [key: string]: any;
}

interface ContentItem {
  contentId: string;
  userId: string;
  source: string;
  ideaId?: string;
  topic: string;
  angle?: string;
  targetAudience: string;
  contentType: string;
  outline: {
    title?: string;
    hook?: string;
    sections?: string[];
    cta?: string;
    contentFormat?: string;
    estimatedWordCount?: number;
  };
  draft: {
    text?: string;
  };
  platformVariants: Record<string, PlatformVariant>;
  scripts?: Record<string, any>;
  distribution: {
    status: string;
    platformTargets: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

type OutlineSection =
  | string
  | {
      title?: string;
      estimatedWordCount?: number;
      content?: string;
    };

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params?.contentId as string;
  const { authReady, userInfo, token } = useAuth();
  const authenticated = !!token && !!userInfo;

  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const safeText = (val: any): string => {
    if (val == null) return "";
    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  useEffect(() => {
    if (authReady && !authenticated) {
      router.replace("/");
    }
  }, [authReady, authenticated, router]);

  useEffect(() => {
    if (authReady && authenticated && userInfo?.userId && token && contentId) {
      loadContent();
    }
  }, [authReady, authenticated, userInfo?.userId, token, contentId]);

  useEffect(() => {
    if (content && content.platformVariants) {
      const platforms = Object.keys(content.platformVariants);
      if (platforms.length > 0 && !selectedPlatform) {
        setSelectedPlatform(platforms[0]);
      }
    }
  }, [content, selectedPlatform]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError("");
      const userId = userInfo?.userId;
      if (!userId || !token) return;

      const result = await getContentById(token, contentId);
      if (result.success && result.content) {
        setContent(result.content);
      } else {
        setError(result.error || "Content not found");
      }
    } catch (err: any) {
      console.error("Error loading content:", err);
      setError(err.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderPlatformContent = (platform: string, variant: PlatformVariant) => {
    return (
      <div className="space-y-4">
        {variant.postText && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Post Text
              </span>
              <button
                type="button"
                onClick={() => handleCopy(variant.postText!, `${platform}-post`)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60"
              >
                {copiedSection === `${platform}-post` ? (
                  <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FiCopy className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>{copiedSection === `${platform}-post` ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <MarkdownRenderer content={variant.postText} />
          </div>
        )}

        {variant.thread && Array.isArray(variant.thread) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Thread ({variant.thread.length} tweets)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(variant.thread!.join("\n\n"), `${platform}-thread-all`)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60"
              >
                {copiedSection === `${platform}-thread-all` ? (
                  <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FiCopy className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>Copy Entire Thread</span>
              </button>
            </div>
            {variant.thread.map((tweet, index) => (
              <div key={index} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    Tweet {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(tweet, `${platform}-tweet-${index}`)}
                    className="p-1 text-zinc-400 hover:text-zinc-200"
                  >
                    {copiedSection === `${platform}-tweet-${index}` ? (
                      <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <FiCopy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <MarkdownRenderer content={tweet} />
              </div>
            ))}
          </div>
        )}

        {variant.caption && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Caption
              </span>
              <button
                type="button"
                onClick={() => handleCopy(variant.caption!, `${platform}-caption`)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60"
              >
                {copiedSection === `${platform}-caption` ? (
                  <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FiCopy className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>Copy Caption</span>
              </button>
            </div>
            <MarkdownRenderer content={variant.caption} />
          </div>
        )}

        {variant.hashtags && variant.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {variant.hashtags.map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-medium text-amber-400"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="p-12 text-center text-zinc-500 text-xs sm:text-sm">
          Loading content studio details...
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !content) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            type="button"
            onClick={() => router.push("/content/library")}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Library
          </button>
          <div className="p-8 text-center rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-2">
            <FiAlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h2 className="text-base font-bold text-zinc-200">Content Not Found</h2>
            <p className="text-xs text-zinc-400">{error || "Requested content does not exist."}</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.push("/content/library")}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Content Library
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" className="text-[10px]">
                  {content.contentType}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {content.distribution?.status || "draft"}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {safeText(content.outline?.title) || safeText(content.topic)}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Target Audience: {content.targetAudience} • Created {formatDate(content.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Content Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Outline & Master Draft */}
          <div className="lg:col-span-1 space-y-6">
            {/* Outline Card */}
            {content.outline && (
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Content Blueprint & Hook
                </h2>

                {content.outline.hook && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-400">Master Hook</span>
                    <MarkdownRenderer content={content.outline.hook} />
                  </div>
                )}

                {content.outline.sections && content.outline.sections.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Key Sections</span>
                    <div className="space-y-1.5 text-xs text-zinc-300">
                      {content.outline.sections.map((sec, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                          <MarkdownRenderer content={typeof sec === "string" ? sec : safeText(sec)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Master Draft Card */}
            {content.draft?.text && (
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Master Draft
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleCopy(content.draft.text!, "master-draft")}
                    className="p-1 text-zinc-400 hover:text-zinc-200"
                  >
                    {copiedSection === "master-draft" ? (
                      <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <FiCopy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <MarkdownRenderer content={content.draft.text} />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Platform Variants Selector */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">
                Multi-Platform Distribution Variants
              </h2>
              <span className="text-xs text-zinc-500">Ready to Publish</span>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/60">
              {Object.keys(content.platformVariants || {}).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                    selectedPlatform === plat
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            {/* Platform Variant Content */}
            {content.platformVariants?.[selectedPlatform] ? (
              renderPlatformContent(selectedPlatform, content.platformVariants[selectedPlatform])
            ) : (
              <div className="p-12 text-center text-xs text-zinc-500">
                Select a platform variant above to inspect generated copy.
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
