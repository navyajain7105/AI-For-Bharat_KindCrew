"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { extractUserFromToken } from "@/lib/jwtDecode";
import SetupBanner from "@/components/SetupBanner";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { FiEdit3, FiBarChart2, FiUser } from "react-icons/fi";

export default function DashboardPage() {
  const router = useRouter();
  const {
    userInfo,
    authReady,
    initializeAuth,
    isAuthenticated,
    setAuth,
    token,
  } = useAuth();

  const {
    creatorProfile,
    hasProfile,
    profileChecked,
    fetchProfile,
    profileLoading,
  } = useAppStore();

  const [showSetupBanner, setShowSetupBanner] = useState(true);

  // Handle token from OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      const user = extractUserFromToken(urlToken);

      if (user) {
        setAuth({ token: urlToken, user });
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [router, setAuth]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Fetch creator profile when authenticated
  useEffect(() => {
    if (token && isAuthenticated() && !profileChecked) {
      fetchProfile(token);
    }
  }, [token, isAuthenticated, profileChecked, fetchProfile]);

  // Redirect to root if not authenticated
  useEffect(() => {
    if (authReady && !isAuthenticated()) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, router]);

  if (!authReady || profileLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "var(--color-background)",
          color: "var(--color-text-secondary)",
        }}
      >
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  const shouldShowSetupBanner =
    profileChecked && !hasProfile && showSetupBanner;

  const dashboardContent = (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden">
      {/* Setup Banner */}
      {shouldShowSetupBanner && (
        <SetupBanner onDismiss={() => setShowSetupBanner(false)} />
      )}

      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Welcome back, {userInfo?.givenName?.split(" ")[0] || "User"}!
        </h1>
        <p
          className="text-base sm:text-lg"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {hasProfile
            ? "Ready to create something amazing today?"
            : "Complete your profile to get started with personalized content."}
        </p>
      </div>

      {/* Profile Summary Card (if profile exists) */}
      {hasProfile && creatorProfile && (
        <div
          className="p-4 sm:p-6 rounded-xl mb-5 sm:mb-6"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              Your Creator Profile
            </h2>
            <button
              onClick={() => router.push("/profile")}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--color-surface-hover)",
                color: "var(--color-text)",
              }}
            >
              View Details
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Primary Niche
              </p>
              <p
                className="font-medium capitalize break-words"
                style={{ color: "var(--color-text)" }}
              >
                {creatorProfile.niche.primary}
              </p>
            </div>
            <div className="min-w-0">
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Creator Level
              </p>
              <p
                className="font-medium capitalize break-words"
                style={{ color: "var(--color-text)" }}
              >
                {creatorProfile.goals.creatorLevel}
              </p>
            </div>
            <div className="min-w-0">
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Primary Goal
              </p>
              <p
                className="font-medium capitalize break-words"
                style={{ color: "var(--color-text)" }}
              >
                {creatorProfile.goals.primaryGoal.replace("-", " ")}
              </p>
            </div>
            <div className="min-w-0">
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Posting Frequency
              </p>
              <p
                className="font-medium break-words"
                style={{ color: "var(--color-text)" }}
              >
                {creatorProfile.strategy.postingFrequency}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <button
          onClick={() => router.push("/content")}
          className="p-4 sm:p-6 rounded-xl text-left transition-all sm:hover:scale-[1.02]"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
            style={{
              backgroundColor: "var(--color-surface-hover)",
              color: "var(--color-text)",
            }}
          >
            <FiEdit3 className="w-5 h-5" />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Create Content
          </h3>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Generate AI-powered content for your audience
          </p>
        </button>

        <button
          onClick={() => router.push("/analytics")}
          className="p-4 sm:p-6 rounded-xl text-left transition-all sm:hover:scale-[1.02]"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
            style={{
              backgroundColor: "var(--color-surface-hover)",
              color: "var(--color-text)",
            }}
          >
            <FiBarChart2 className="w-5 h-5" />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            View Analytics
          </h3>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Track your content performance
          </p>
        </button>

        <button
          onClick={() => router.push("/profile")}
          className="p-4 sm:p-6 rounded-xl text-left transition-all sm:hover:scale-[1.02]"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
            style={{
              backgroundColor: "var(--color-surface-hover)",
              color: "var(--color-text)",
            }}
          >
            <FiUser className="w-5 h-5" />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Your Profile
          </h3>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {hasProfile
              ? "View and edit your profile"
              : "Complete your creator profile"}
          </p>
        </button>
      </div>
    </div>
  );

  return <AuthenticatedLayout>{dashboardContent}</AuthenticatedLayout>;
}
