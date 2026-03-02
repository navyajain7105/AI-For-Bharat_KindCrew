"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { initializeAuth, authReady, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const cognitoDomain = (process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "").replace(
    /\/$/,
    "",
  );
  const redirectUri =
    process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ||
    `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/auth/callback`;

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (authReady && isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [authReady, isAuthenticated, router]);

  const handleCognitoLogin = async () => {
    setLoading(true);
    try {
      // Redirect to backend /login route which handles OAuth flow
      const backendLoginUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`;
      window.location.href = backendLoginUrl;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div
        className="max-w-md w-full mx-4 p-8 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          borderWidth: "1px",
        }}
      >
        <h1
          className="text-3xl font-bold text-center mb-2"
          style={{ color: "var(--color-text)" }}
        >
          KindCrew
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          AI-Powered Content Creator
        </p>

        <button
          onClick={handleCognitoLogin}
          disabled={loading}
          className="w-full py-3 px-6 font-semibold rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--color-surface-hover)",
            color: "var(--color-text)",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Connecting..." : "Sign in with AWS Cognito"}
        </button>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--color-text-muted)" }}
        >
          Secure authentication powered by AWS Cognito
        </p>
      </div>
    </div>
  );
}
