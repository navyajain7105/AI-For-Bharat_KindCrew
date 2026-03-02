"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { handleCognitoCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        // Log for debugging
        console.log("Callback URL:", window.location.href);
        console.log("Query params:", Object.fromEntries(params.entries()));

        // Check if Cognito sent an error
        if (error) {
          setError(
            `Cognito Error: ${error}${errorDescription ? ` - ${errorDescription}` : ""}`,
          );
          return;
        }

        if (!code) {
          setError(
            "Missing authorization code. Please check AWS Cognito App Client settings.",
          );
          return;
        }

        const redirectUri =
          process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ||
          `${window.location.origin}/api/auth/callback`;
        await handleCognitoCallback(code, redirectUri);
        router.replace("/dashboard");
      } catch (err: unknown) {
        const message =
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: string }).message || "Authentication failed"
            : "Authentication failed";
        setError(message);
      }
    };

    run();
  }, [handleCognitoCallback, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div
        className="max-w-md w-full mx-4 p-8 rounded-2xl text-center"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          borderWidth: "1px",
        }}
      >
        {error ? (
          <>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              Login Failed
            </h2>
            <p style={{ color: "var(--color-text-secondary)" }}>{error}</p>
          </>
        ) : (
          <p style={{ color: "var(--color-text-secondary)" }}>
            Completing login...
          </p>
        )}
      </div>
    </div>
  );
}
