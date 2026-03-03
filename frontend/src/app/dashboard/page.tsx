"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { extractUserFromToken } from "@/lib/jwtDecode";

export default function DashboardPage() {
  const router = useRouter();
  const {
    userInfo,
    authReady,
    initializeAuth,
    logout,
    isAuthenticated,
    setAuth,
  } = useAuth();

  // Handle token from OAuth callback
  useEffect(() => {
    // Use window.location.search instead of useSearchParams (which requires Suspense)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // Extract user info from token
      const user = extractUserFromToken(token);

      if (user) {
        // Directly set auth state with token and user
        setAuth({ token, user });
        // Remove token from URL
        router.replace("/dashboard");
      } else {
        // Invalid token, redirect to root
        router.replace("/");
      }
    }
  }, [router, setAuth]);

  // Initialize auth on mount (loads from localStorage)
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect to root if not authenticated
  useEffect(() => {
    if (authReady && !isAuthenticated()) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, router]);

  const handleLogout = () => {
    // Logout will redirect to backend which clears session and Cognito cookies
    logout();
  };

  if (!authReady) {
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

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1
            className="text-4xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="py-2 px-6 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--color-surface-hover)",
              color: "var(--color-text)",
            }}
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div
          className="p-8 rounded-2xl mb-8"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            borderWidth: "1px",
          }}
        >
          <h2
            style={{ color: "var(--color-text)" }}
            className="text-xl font-semibold mb-4"
          >
            Welcome, {userInfo?.name}!
          </h2>
          <div
            style={{ color: "var(--color-text-secondary)" }}
            className="space-y-2"
          >
            <p>Email: {userInfo?.email}</p>
            <p>User ID: {userInfo?.userId}</p>
            <p>Role: {userInfo?.role}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Create Content", "Analytics", "Settings"].map((item) => (
            <div
              key={item}
              className="p-6 rounded-lg cursor-pointer transition-all"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderWidth: "1px",
              }}
            >
              <h3
                style={{ color: "var(--color-text)" }}
                className="font-semibold"
              >
                {item}
              </h3>
              <p
                style={{ color: "var(--color-text-secondary)" }}
                className="text-sm mt-2"
              >
                Coming soon...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
