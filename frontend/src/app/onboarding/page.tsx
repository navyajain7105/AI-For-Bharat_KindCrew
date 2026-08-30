"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import type { CreatorProfileData, Platform } from "@/lib/api/creatorProfile";
import OnboardingProgress from "./components/OnboardingProgress";
import OnboardingStepNiche from "./components/OnboardingStepNiche";
import OnboardingStepPlatforms from "./components/OnboardingStepPlatforms";

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const { token, userInfo, authReady } = useAuth();
  const authenticated = !!token && !!userInfo;
  const createProfile = useAppStore((state) => state.createProfile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const profileLoading = useAppStore((state) => state.profileLoading);
  const hasProfile = useAppStore((state) => state.hasProfile);
  const profileChecked = useAppStore((state) => state.profileChecked);
  const fetchProfile = useAppStore((state) => state.fetchProfile);
  const creatorProfile = useAppStore((state) => state.creatorProfile);
  const skipOnboarding = useAppStore((state) => state.skipOnboarding);

  const [currentStep, setCurrentStep] = useState(1);

  // Form state holding minimum onboarding profile + defaults for advanced fields
  const [formData, setFormData] = useState<CreatorProfileData>({
    niche: {
      primary: "",
      secondary: "",
    },
    targetAudience: "",
    platforms: [],
    goals: {
      primaryGoal: "growth",
      creatorLevel: "beginner",
    },
    strategy: {
      contentStrategy: "educational",
      postingFrequency: "1/week",
      contentPillars: ["General Topics"],
    },
    preferences: {
      tones: ["Professional"],
      formats: ["post"],
      constraints: {
        emojiUsage: true,
        ctaStrength: "medium",
        formality: "semi-formal",
      },
      timeCommitment: "medium",
    },
    competitors: [],
  });

  const [customNiche, setCustomNiche] = useState("");
  const [isOtherNiche, setIsOtherNiche] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (authReady && token && authenticated && !profileChecked && !profileLoading) {
      fetchProfile(token);
    }
  }, [authReady, token, authenticated, profileChecked, profileLoading, fetchProfile]);

  // Load existing profile details if editing
  useEffect(() => {
    if (hasProfile && creatorProfile && !profileLoaded) {
      setFormData({
        niche: creatorProfile.niche || { primary: "", secondary: "" },
        targetAudience: creatorProfile.targetAudience || "",
        platforms: creatorProfile.platforms || [],
        goals: creatorProfile.goals || {
          primaryGoal: "growth",
          creatorLevel: "beginner",
        },
        strategy: creatorProfile.strategy || {
          contentStrategy: "educational",
          postingFrequency: "1/week",
          contentPillars: ["General Topics"],
        },
        preferences: creatorProfile.preferences || {
          tones: ["Professional"],
          formats: ["post"],
          constraints: {
            emojiUsage: true,
            ctaStrength: "medium",
            formality: "semi-formal",
          },
          timeCommitment: "medium",
        },
        competitors: creatorProfile.competitors || [],
      });

      const standardNiches = [
        "ai-ml",
        "web-dev",
        "mobile-dev",
        "cybersecurity",
        "devops",
        "data-science",
        "tech-general",
        "yoga",
        "weightlifting",
        "running",
        "nutrition",
        "fitness-general",
        "marketing",
        "sales",
        "leadership",
        "entrepreneurship",
        "finance",
        "business-general",
        "personal-dev",
        "productivity",
        "lifestyle",
        "education",
        "entertainment",
        "food",
        "travel",
        "fashion",
        "gaming",
        "art",
        "music",
        "photography",
        "parenting",
        "pets",
        "sustainability",
      ];
      if (
        creatorProfile.niche?.primary &&
        !standardNiches.includes(creatorProfile.niche.primary)
      ) {
        setIsOtherNiche(true);
        setCustomNiche(creatorProfile.niche.primary);
      }

      setProfileLoaded(true);
    }
  }, [hasProfile, creatorProfile, profileLoaded]);

  useEffect(() => {
    if (authReady && !authenticated) {
      router.replace("/");
    }
  }, [authReady, authenticated, router]);

  useEffect(() => {
    // Only auto-redirect if profile exists, not in edit mode, AND onboarding is completed
    if (
      profileChecked &&
      hasProfile &&
      !isEditMode &&
      creatorProfile?.settings?.onboardingCompleted
    ) {
      router.replace("/dashboard");
    }
  }, [
    profileChecked,
    hasProfile,
    isEditMode,
    creatorProfile?.settings?.onboardingCompleted,
    router,
  ]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep1 = (): boolean => {
    const nicheVal = formData.niche.primary;
    if (!nicheVal || (isOtherNiche && !customNiche.trim())) {
      toast.error("Please select or specify your primary niche");
      return false;
    }
    if (!formData.targetAudience) {
      toast.error("Please select your target audience");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (profileLoading) return;
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const handleBack = () => {
    if (profileLoading) return;
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSaveAndContinue = async () => {
    if (profileLoading) return;
    if (currentStep === 1 && !validateStep1()) return;
    if (!token) return;

    try {
      let profile;

      if (hasProfile && creatorProfile?.creatorId) {
        profile = await updateProfile(
          token,
          creatorProfile.creatorId,
          formData,
        );
      } else {
        profile = await createProfile(token, formData);
      }

      if (profile?.creatorId) {
        try {
          await completeOnboarding(token, profile.creatorId);
        } catch (onboardingError) {
          console.error("❌ Failed to complete onboarding:", onboardingError);
        }
      }
      toast.success("Profile saved successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to save profile";
      toast.error(message);
      console.error(error);
    }
  };

  const handleSkipAction = async () => {
    if (profileLoading) return;
    if (!token) return;
    try {
      // Save skip preference in User settings via API
      await skipOnboarding(token);
      toast.success("Skipped onboarding setup. You can complete it anytime in Settings.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to persist skip onboarding:", error);
      // Fallback redirect even if API fails to prevent blocking user
      router.push("/dashboard");
    }
  };

  if (!authReady || profileLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div style={{ color: "var(--color-text-secondary)" }}>Loading Wizard...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-32"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Welcome to KindCrew
          </h1>
          <p
            className="text-base text-slate-400"
          >
            Baseline your creative focus so the AI models can customize outlines, ideas, and strategies for you
          </p>
        </div>

        {/* Step Progress Tracker */}
        <OnboardingProgress currentStep={currentStep} />

        {/* Step Inputs */}
        <div className="mt-6 mb-8">
          {currentStep === 1 ? (
            <OnboardingStepNiche
              primaryNiche={formData.niche.primary}
              secondaryNiche={formData.niche.secondary || ""}
              targetAudience={formData.targetAudience}
              isOtherNiche={isOtherNiche}
              customNiche={customNiche}
              onChange={handleFieldChange}
              onNicheToggle={setIsOtherNiche}
              onCustomNicheChange={setCustomNiche}
            />
          ) : (
            <OnboardingStepPlatforms
              platforms={formData.platforms || []}
              onChange={(plats) => handleFieldChange("platforms", plats)}
            />
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-6">
          <button
            type="button"
            disabled={profileLoading}
            onClick={handleSkipAction}
            className="text-sm font-semibold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Skip for now
          </button>

          <div className="flex gap-3">
            {currentStep === 2 && (
              <button
                type="button"
                disabled={profileLoading}
                onClick={handleBack}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-700 text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}

            {currentStep === 1 ? (
              <button
                type="button"
                disabled={profileLoading}
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={profileLoading}
                onClick={handleSaveAndContinue}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {profileLoading ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthenticatedLayout>
      <Suspense
        fallback={
          <div
            className="min-h-screen flex items-center justify-center text-slate-400"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            Loading...
          </div>
        }
      >
        <OnboardingPageContent />
      </Suspense>
    </AuthenticatedLayout>
  );
}
