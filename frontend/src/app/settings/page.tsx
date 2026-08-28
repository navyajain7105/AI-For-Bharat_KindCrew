"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { FiSave, FiAlertCircle, FiSettings, FiFeather, FiTrendingUp } from "react-icons/fi";

type TabId = "creator" | "style" | "strategy";

export default function SettingsPage() {
  const router = useRouter();
  const { token, isAuthenticated, authReady } = useAuth();
  const {
    creatorProfile,
    profileLoading,
    profileError,
    fetchProfile,
    updateProfile,
    createProfile,
    hasProfile,
  } = useCreatorProfile();

  const [activeTab, setActiveTab] = useState<TabId>("creator");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Local Form state
  const [formData, setFormData] = useState({
    primaryNiche: "",
    secondaryNiche: "",
    targetAudience: "",
    creatorLevel: "beginner",
    primaryGoal: "growth",
    contentStrategy: "educational",
    postingFrequency: "1/week",
    contentPillars: "",
    tones: "",
    formats: "",
    contentStyle: "Professional",
    voiceTone: "educational",
    avoidTopics: "",
    contentApproach: "Value-driven",
    ctaStrength: "medium",
    formality: "semi-formal",
    emojiUsage: true,
  });

  useEffect(() => {
    if (authReady && !isAuthenticated()) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, router]);

  // Fetch profile on mount/token ready
  useEffect(() => {
    if (token && isAuthenticated()) {
      fetchProfile(token);
    }
  }, [token, isAuthenticated, fetchProfile]);

  // Prepopulate form data when profile is loaded
  useEffect(() => {
    if (creatorProfile) {
      setFormData({
        primaryNiche: creatorProfile.niche?.primary || "",
        secondaryNiche: creatorProfile.niche?.secondary || "",
        targetAudience: creatorProfile.targetAudience || "",
        creatorLevel: creatorProfile.goals?.creatorLevel || "beginner",
        primaryGoal: creatorProfile.goals?.primaryGoal || "growth",
        contentStrategy: creatorProfile.strategy?.contentStrategy || "educational",
        postingFrequency: creatorProfile.strategy?.postingFrequency || "1/week",
        contentPillars: Array.isArray(creatorProfile.strategy?.contentPillars)
          ? creatorProfile.strategy.contentPillars.join(", ")
          : "",
        tones: Array.isArray(creatorProfile.preferences?.tones)
          ? creatorProfile.preferences.tones.join(", ")
          : "",
        formats: Array.isArray(creatorProfile.preferences?.formats)
          ? creatorProfile.preferences.formats.join(", ")
          : "",
        contentStyle: creatorProfile.preferences?.contentStyle || "Professional",
        voiceTone: creatorProfile.preferences?.voiceTone || "educational",
        avoidTopics: Array.isArray(creatorProfile.preferences?.avoidTopics)
          ? creatorProfile.preferences.avoidTopics.join(", ")
          : "",
        contentApproach: creatorProfile.strategy?.contentApproach || "Value-driven",
        ctaStrength: creatorProfile.preferences?.constraints?.ctaStrength || "medium",
        formality: creatorProfile.preferences?.constraints?.formality || "semi-formal",
        emojiUsage: creatorProfile.preferences?.constraints?.emojiUsage !== false,
      });
    }
  }, [creatorProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    if (!token) {
      setErrorMessage("Session has expired. Please refresh the page.");
      setIsSaving(false);
      return;
    }

    // Validation
    if (!formData.primaryNiche.trim()) {
      setErrorMessage("Primary niche is required.");
      setIsSaving(false);
      return;
    }
    if (!formData.targetAudience.trim()) {
      setErrorMessage("Target audience is required.");
      setIsSaving(false);
      return;
    }

    const payload = {
      niche: {
        primary: formData.primaryNiche.trim(),
        secondary: formData.secondaryNiche.trim() || undefined,
      },
      targetAudience: formData.targetAudience.trim(),
      goals: {
        primaryGoal: formData.primaryGoal as any,
        creatorLevel: formData.creatorLevel as any,
      },
      strategy: {
        contentStrategy: formData.contentStrategy as any,
        postingFrequency: formData.postingFrequency,
        contentPillars: formData.contentPillars
          ? formData.contentPillars.split(",").map((p) => p.trim()).filter(Boolean)
          : [],
        contentApproach: formData.contentApproach.trim(),
      },
      preferences: {
        tones: formData.tones
          ? formData.tones.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        formats: formData.formats
          ? formData.formats.split(",").map((f) => f.trim()).filter(Boolean)
          : [],
        contentStyle: formData.contentStyle.trim(),
        voiceTone: formData.voiceTone.trim(),
        avoidTopics: formData.avoidTopics
          ? formData.avoidTopics.split(",").map((a) => a.trim()).filter(Boolean)
          : [],
        constraints: {
          emojiUsage: formData.emojiUsage,
          ctaStrength: formData.ctaStrength as any,
          formality: formData.formality as any,
        },
      },
    };

    try {
      if (hasProfile && creatorProfile?.creatorId) {
        await updateProfile(token, creatorProfile.creatorId, payload);
        setSuccessMessage("Creator Profile updated successfully.");
      } else {
        await createProfile(token, payload as any);
        setSuccessMessage("Creator Profile created successfully.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!authReady || profileLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div style={{ color: "var(--color-text-secondary)" }}>Loading Settings...</div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-5xl mx-auto px-4">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
            Settings
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Configure your creator profile context and AI styling preferences
          </p>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3 border text-sm"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderColor: "rgba(16, 185, 129, 0.2)",
              color: "#10b981",
            }}
          >
            <span>{successMessage}</span>
          </div>
        )}

        {(errorMessage || profileError) && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3 border text-sm"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.2)",
              color: "#ef4444",
            }}
          >
            <FiAlertCircle className="w-5 h-5" />
            <span>{errorMessage || profileError}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6 border-slate-700">
            <button
              onClick={() => setActiveTab("creator")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg text-left transition-colors w-full ${
                activeTab === "creator"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FiSettings className="w-4 h-4" />
              Creator Details
            </button>

            <button
              onClick={() => setActiveTab("style")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg text-left transition-colors w-full ${
                activeTab === "style"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FiFeather className="w-4 h-4" />
              Writing & AI Tone
            </button>

            <button
              onClick={() => setActiveTab("strategy")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg text-left transition-colors w-full ${
                activeTab === "strategy"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FiTrendingUp className="w-4 h-4" />
              Strategy & Goals
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <form
              onSubmit={handleSave}
              className="p-8 rounded-xl space-y-6"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Tab 1: Creator Settings */}
              {activeTab === "creator" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-slate-700 pb-3 text-white">
                    Creator Profile Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        PRIMARY NICHE *
                      </label>
                      <input
                        type="text"
                        name="primaryNiche"
                        value={formData.primaryNiche}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        placeholder="e.g. AI Productivity Tools"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        SECONDARY NICHE
                      </label>
                      <input
                        type="text"
                        name="secondaryNiche"
                        value={formData.secondaryNiche}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        placeholder="e.g. SaaS marketing"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-300">
                      TARGET AUDIENCE *
                    </label>
                    <textarea
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      placeholder="Describe who you create content for"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-300">
                      CREATOR EXPERIENCE LEVEL
                    </label>
                    <select
                      name="creatorLevel"
                      value={formData.creatorLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="beginner">Beginner (Starting out)</option>
                      <option value="intermediate">Intermediate (Growing presence)</option>
                      <option value="advanced">Advanced (Established creator)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 2: Writing Tone & AI Styles */}
              {activeTab === "style" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-slate-700 pb-3 text-white">
                    Writing Styles & Brand Constraints
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        BRAND VOICE TONE (PRIMARY)
                      </label>
                      <input
                        type="text"
                        name="voiceTone"
                        value={formData.voiceTone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        placeholder="e.g. educational, witty, casual"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        AI STYLE MODE
                      </label>
                      <input
                        type="text"
                        name="contentStyle"
                        value={formData.contentStyle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        placeholder="e.g. Actionable, Storytelling, Academic"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        FORMALITY LEVEL
                      </label>
                      <select
                        name="formality"
                        value={formData.formality}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="casual">Casual (friendly, relaxed)</option>
                        <option value="semi-formal">Semi-formal (informative, clean)</option>
                        <option value="formal">Formal (authoritative, academic)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        CTA STRENGTH
                      </label>
                      <select
                        name="ctaStrength"
                        value={formData.ctaStrength}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="weak">Soft (non-pushy mentions)</option>
                        <option value="medium">Medium (standard action link)</option>
                        <option value="strong">Direct (clear pitch / high sales action)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-300">
                      TOPICS TO AVOID (COMMA SEPARATED)
                    </label>
                    <input
                      type="text"
                      name="avoidTopics"
                      value={formData.avoidTopics}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      placeholder="e.g. politics, gossip, specific competitors"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="emojiUsage"
                      name="emojiUsage"
                      checked={formData.emojiUsage}
                      onChange={handleInputChange}
                      className="w-4 h-4 bg-slate-950 border border-slate-700 rounded"
                    />
                    <label htmlFor="emojiUsage" className="text-sm font-medium text-slate-300 select-none">
                      Enable AI emojis usage in generated post drafts
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 3: Strategy & Goals */}
              {activeTab === "strategy" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-slate-700 pb-3 text-white">
                    Creator Strategy & Content Intent
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        PRIMARY GOAL
                      </label>
                      <select
                        name="primaryGoal"
                        value={formData.primaryGoal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="growth">Growth & Reach</option>
                        <option value="monetization">Direct Monetization</option>
                        <option value="engagement">Engagement & Relationship</option>
                        <option value="brand-building">Brand Building</option>
                        <option value="community-building">Community Building</option>
                        <option value="personal-brand">Personal Branding</option>
                        <option value="thought-leadership">Thought Leadership</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        CONTENT STRATEGY APPROACH
                      </label>
                      <input
                        type="text"
                        name="contentApproach"
                        value={formData.contentApproach}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        placeholder="e.g. Value-driven, Case-study, Storytelling"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        CONTENT STRATEGY CLASS
                      </label>
                      <select
                        name="contentStrategy"
                        value={formData.contentStrategy}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="educational">Educational / How-to</option>
                        <option value="entertainment">Entertainment / Viral</option>
                        <option value="promotional">Promotional / Sales</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-300">
                        POSTING FREQUENCY
                      </label>
                      <input
                        type="text"
                        name="postingFrequency"
                        value={formData.postingFrequency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        placeholder="e.g. 3/week, daily"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-300">
                      CONTENT PILLARS (COMMA SEPARATED)
                    </label>
                    <input
                      type="text"
                      name="contentPillars"
                      value={formData.contentPillars}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      placeholder="e.g. Next.js tricks, tech careers, productivity tips"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-colors bg-white text-slate-950 hover:bg-slate-200 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {isSaving ? "Saving Settings..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
