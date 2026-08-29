"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { FiSave, FiAlertCircle, FiSettings, FiFeather, FiTrendingUp, FiLock, FiEye, FiEyeOff, FiCheck, FiCircle } from "react-icons/fi";
import { buildApiUrl } from "@/lib/constants";
import { authenticatedFetch } from "@/lib/apiClient";

type TabId = "creator" | "style" | "strategy" | "security";

export default function SettingsPage() {
  const router = useRouter();
  const { token, userInfo, authReady, logout } = useAuth();
  const authenticated = !!token && !!userInfo;
  const {
    creatorProfile,
    profileLoading,
    profileError,
    profileChecked,
    fetchProfile,
    updateProfile,
    createProfile,
    hasProfile,
  } = useCreatorProfile();

  const [activeTab, setActiveTab] = useState<TabId>("creator");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Connection Providers state (Checkpoint 2D & 2E)
  const [providers, setProviders] = useState<{ type: string; connected: boolean }[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [linkPasswordInput, setLinkPasswordInput] = useState("");
  const [linkPasswordConfirm, setLinkPasswordConfirm] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [linkingActionLoading, setLinkingActionLoading] = useState(false);

  const fetchProviders = async () => {
    if (!token || activeTab !== "security" || providersLoading) return;
    setProvidersLoading(true);
    setProvidersError(null);
    try {
      const response = await authenticatedFetch(buildApiUrl("/api/auth/providers"));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.providers) {
          setProviders(data.data.providers);
        } else {
          setProvidersError(data.message || "Failed to load provider connections.");
        }
      } else {
        setProvidersError("Failed to load provider connections.");
      }
    } catch (err: any) {
      console.error("Failed to fetch provider connections:", err);
      setProvidersError(err?.message || "Failed to load provider connections.");
    } finally {
      setProvidersLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeTab === "security") {
      fetchProviders();
    }
  }, [token, activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const linkingParam = params.get("linking");
      const loginErrorParam = params.get("login_error");
      const reasonParam = params.get("reason");
      if (linkingParam === "success") {
        setActiveTab("security");
        setSuccessMessage("Google account connected successfully!");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (linkingParam === "error") {
        setActiveTab("security");
        let displayError = reasonParam || "Failed to connect Google account.";
        if (displayError.toLowerCase().includes("family_name")) {
          displayError = "Your Google account is missing a Last Name (family_name), which is required by Cognito. Please ensure your Google account has a last name configured or check Google attribute mapping in AWS Cognito.";
        }
        setErrorMessage(displayError);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (loginErrorParam === "method_conflict") {
        setErrorMessage(
          "This email is already connected to another login method. Please sign in using your original login method. Once signed in, you can connect additional login methods from Settings \u2192 Security.",
        );
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleConnectGoogle = () => {
    // This is a browser-navigation endpoint — no Bearer token needed.
    // The backend authenticates via the session cookie and redirects directly
    // to the Cognito Hosted UI.
    window.location.href = buildApiUrl("/api/auth/link-google");
  };

  // Password complexity live validation
  const hasMinLength = linkPasswordInput.length >= 8;
  const hasUppercase = /[A-Z]/.test(linkPasswordInput);
  const hasLowercase = /[a-z]/.test(linkPasswordInput);
  const hasNumber = /[0-9]/.test(linkPasswordInput);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(linkPasswordInput);
  const passwordsMatch = linkPasswordInput.length > 0 && linkPasswordInput === linkPasswordConfirm;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol && passwordsMatch;

  const handleLinkPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!hasMinLength) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
      setErrorMessage("Password must include uppercase, lowercase, numbers, and special symbols.");
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLinkingActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await authenticatedFetch(buildApiUrl("/api/auth/link-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: linkPasswordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowPasswordModal(false);
        setLinkPasswordInput("");
        setLinkPasswordConfirm("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setSuccessMessage(data.message || "Email & Password linked successfully!");
        if (data.data?.requireRelogin || data.data?.requireReloginWithPassword) {
          setTimeout(() => {
            logout();
          }, 2000);
        } else {
          fetchProviders();
        }
      } else {
        setErrorMessage(data.message || "Failed to link password credential.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLinkingActionLoading(false);
    }
  };

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
    if (authReady && !authenticated) {
      router.replace("/");
    }
  }, [authReady, authenticated, router]);

  // Fetch profile once on mount/token ready when not yet checked
  useEffect(() => {
    if (token && authenticated && !profileChecked && !profileLoading) {
      fetchProfile(token);
    }
  }, [token, authenticated, profileChecked, profileLoading, fetchProfile]);

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
              type="button"
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

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg text-left transition-colors w-full ${
                activeTab === "security"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FiLock className="w-4 h-4" />
              Security
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

              {/* Tab 4: Security (Login Methods) */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-slate-700 pb-3 text-white">
                    Login Methods
                  </h3>
                  <p className="text-sm text-slate-400">
                    Manage your connected authentication credentials.
                  </p>

                  {providersLoading ? (
                    <div className="text-sm text-slate-500 py-6 text-center">
                      Loading connected credentials...
                    </div>
                  ) : providersError ? (
                    <div className="p-4 rounded-xl border border-red-900/50 bg-red-950/30 text-red-400 text-sm text-center">
                      {providersError}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Google Provider Card */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white text-base">
                            G
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white text-left">Google Account</h4>
                            <p className="text-xs text-slate-400 text-left mt-0.5">
                              {providers.find((p) => p.type === "google")?.connected
                                ? "Connected to Google"
                                : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <div>
                          {providers.find((p) => p.type === "google")?.connected ? (
                            <span className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-emerald-900 bg-emerald-950/50 text-emerald-400 inline-block">
                              ✓ Connected
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={linkingActionLoading}
                              onClick={handleConnectGoogle}
                              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                              {linkingActionLoading ? "Connecting..." : "Connect Google"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Email & Password Provider Card */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white text-base">
                            @
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white text-left">Email & Password</h4>
                            <p className="text-xs text-slate-400 text-left mt-0.5">
                              {providers.find((p) => p.type === "password")?.connected
                                ? "Connected to Cognito Pool"
                                : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <div>
                          {providers.find((p) => p.type === "password")?.connected ? (
                            <span className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-emerald-900 bg-emerald-950/50 text-emerald-400 inline-block">
                              ✓ Connected
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={linkingActionLoading}
                              onClick={() => setShowPasswordModal(true)}
                              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                              Add Password
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              {activeTab !== "security" && (
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
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Password modal — OUTSIDE the main <form> to avoid nested-form HTML violation */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Email & Password Login</h3>
            <p className="text-xs text-slate-400">
              Create a password for your account to enable direct email & password sign-in.
            </p>
            <form onSubmit={handleLinkPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={linkPasswordInput}
                    onChange={(e) => setLinkPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-white"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded transition-colors"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={linkPasswordConfirm}
                    onChange={(e) => setLinkPasswordConfirm(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-white"
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                <p className="font-medium text-slate-300 mb-1">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                    {hasMinLength ? <FiCheck className="w-3.5 h-3.5 flex-shrink-0" /> : <FiCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                    {hasUppercase ? <FiCheck className="w-3.5 h-3.5 flex-shrink-0" /> : <FiCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>Uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                    {hasLowercase ? <FiCheck className="w-3.5 h-3.5 flex-shrink-0" /> : <FiCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>Lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                    {hasNumber ? <FiCheck className="w-3.5 h-3.5 flex-shrink-0" /> : <FiCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSymbol ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                    {hasSymbol ? <FiCheck className="w-3.5 h-3.5 flex-shrink-0" /> : <FiCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>Special symbol (!@#$...)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                    {passwordsMatch ? <FiCheck className="w-3.5 h-3.5 flex-shrink-0" /> : <FiCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={linkingActionLoading}
                  onClick={() => {
                    setShowPasswordModal(false);
                    setLinkPasswordInput("");
                    setLinkPasswordConfirm("");
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkingActionLoading || !isPasswordValid}
                  className="px-4 py-2 text-xs font-semibold bg-white text-slate-950 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linkingActionLoading ? "Saving..." : "Add Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
