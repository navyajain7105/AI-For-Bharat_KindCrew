"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import {
  FiSave,
  FiAlertCircle,
  FiSettings,
  FiFeather,
  FiTrendingUp,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi";
import { buildApiUrl } from "@/lib/constants";
import { authenticatedFetch } from "@/lib/apiClient";
import { CreatorDetailsTab } from "@/components/settings/CreatorDetailsTab";
import { WritingToneTab } from "@/components/settings/WritingToneTab";
import { StrategyGoalsTab } from "@/components/settings/StrategyGoalsTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { PasswordModal } from "@/components/settings/PasswordModal";

type TabId = "creator" | "style" | "strategy" | "security";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;

  const { token, userInfo, authReady, logout } = useAuth();
  const authenticated = !!token && !!userInfo;
  const {
    creatorProfile,
    profileLoading,
    profileChecked,
    fetchProfile,
    updateProfile,
    createProfile,
    hasProfile,
  } = useCreatorProfile();

  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && ["creator", "style", "strategy", "security"].includes(tabParam)
      ? tabParam
      : "creator"
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync tab with URL query parameter changes
  useEffect(() => {
    if (tabParam && ["creator", "style", "strategy", "security"].includes(tabParam)) {
      setActiveTab(tabParam);
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [tabParam]);

  // Connection Providers state (Checkpoint 2D, 2E, 2I)
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
          displayError =
            "Your Google account is missing a Last Name (family_name), which is required by Cognito. Please ensure your Google account has a last name configured or check Google attribute mapping in AWS Cognito.";
        }
        setErrorMessage(displayError);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (loginErrorParam === "method_conflict") {
        setErrorMessage(
          "This email is already connected to another login method. Please sign in using your original login method. Once signed in, you can connect additional login methods from Settings → Security.",
        );
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleConnectGoogle = () => {
    window.location.href = buildApiUrl("/api/auth/link-google");
  };

  // Password submission for modal
  const handleLinkPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (linkPasswordInput.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (linkPasswordInput !== linkPasswordConfirm) {
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

  useEffect(() => {
    if (token && authenticated && !profileChecked && !profileLoading) {
      fetchProfile(token);
    }
  }, [token, authenticated, profileChecked, profileLoading, fetchProfile]);

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
          ctaStrength: formData.ctaStrength as any,
          formality: formData.formality as any,
          emojiUsage: formData.emojiUsage,
        },
      },
    };

    try {
      if (hasProfile && creatorProfile?.creatorId) {
        await updateProfile(token, creatorProfile.creatorId, payload);
        setSuccessMessage("Settings updated successfully!");
      } else {
        await createProfile(token, payload);
        setSuccessMessage("Creator profile created successfully!");
      }
    } catch (err: any) {
      console.error("Save settings error:", err);
      setErrorMessage(err?.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case "creator":
        return {
          title: "Creator Details",
          description: "Define your primary niche, secondary focus, and target audience persona.",
        };
      case "style":
        return {
          title: "Writing & AI Tone",
          description: "Calibrate voice tone, formality, formats, and guardrails for Bedrock generation.",
        };
      case "strategy":
        return {
          title: "Strategy & Goals",
          description: "Configure core content pillars, primary growth metrics, and planned publishing cadence.",
        };
      case "security":
        return {
          title: "Account Security & Login Methods",
          description: "Manage connected Google OAuth and Email/Password credentials.",
        };
    }
  };

  const tabInfo = getActiveTabTitle();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            System Settings
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          {tabInfo.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {tabInfo.description}
        </p>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
          <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-800/40 bg-rose-950/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
          <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Card */}
      {activeTab === "security" ? (
        <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-sm">
          <SecurityTab
            providers={providers}
            providersLoading={providersLoading}
            providersError={providersError}
            onConnectGoogle={handleConnectGoogle}
            onOpenPasswordModal={() => setShowPasswordModal(true)}
          />
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-8 backdrop-blur-sm shadow-sm"
        >
          {activeTab === "creator" && (
            <CreatorDetailsTab
              formData={formData}
              onChange={handleInputChange}
              creatorProfile={creatorProfile}
            />
          )}

          {activeTab === "style" && (
            <WritingToneTab
              formData={formData}
              onChange={handleInputChange}
              creatorProfile={creatorProfile}
            />
          )}

          {activeTab === "strategy" && (
            <StrategyGoalsTab
              formData={formData}
              onChange={handleInputChange}
              creatorProfile={creatorProfile}
            />
          )}

          {/* Form Save Button Footer */}
          <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Settings are immediately synced with your AI creation engine.
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <FiSave className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        passwordInput={linkPasswordInput}
        setPasswordInput={setLinkPasswordInput}
        confirmInput={linkPasswordConfirm}
        setConfirmInput={setLinkPasswordConfirm}
        showPassword={showNewPassword}
        setShowPassword={setShowNewPassword}
        showConfirm={showConfirmPassword}
        setShowConfirm={setShowConfirmPassword}
        onSubmit={handleLinkPasswordSubmit}
        loading={linkingActionLoading}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthenticatedLayout>
      <Suspense
        fallback={
          <div className="p-12 text-center text-zinc-500 text-xs">
            Loading Settings...
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </AuthenticatedLayout>
  );
}
