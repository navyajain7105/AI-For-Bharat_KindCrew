"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { buildApiUrl } from "@/lib/constants";
import { toast } from "sonner";

import { GridBackground } from "@/components/landing/GridBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, userInfo, initializeAuth, authReady } = useAuth();
  const authenticated = !!token && !!userInfo;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const linking = searchParams.get("linking");
    const reason = searchParams.get("reason");
    const loginError = searchParams.get("login_error");

    if (linking === "error" && reason) {
      toast.error(reason);
    } else if (loginError === "method_conflict") {
      toast.error(
        "This email is already connected to another login method. Please sign in using your original login method. Once signed in, you can connect additional login methods from Settings → Security.",
        { duration: 8000 }
      );
    }
  }, [searchParams]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (authReady && authenticated) {
      router.replace("/dashboard");
    }
  }, [authReady, authenticated, router]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const backendLoginUrl = buildApiUrl("/api/auth/login");
      window.location.href = backendLoginUrl;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <GridBackground className="min-h-screen selection:bg-amber-400 selection:text-black">
      {/* Sticky Navigation Header */}
      <Navbar
        authenticated={authenticated}
        onLogin={handleLogin}
        loading={loading}
      />

      {/* Main Content Flow */}
      <main className="flex-1 w-full relative">
        {/* 1. Hero & Product Interface Preview */}
        <Hero onLogin={handleLogin} loading={loading} />

        {/* 2. Spacious 4-Card Bento Grid */}
        <BentoFeatures />

        {/* 3. Final Call to Action */}
        <FinalCTA onLogin={handleLogin} loading={loading} />
      </main>

      {/* Fully Visible High-Contrast Engineering Footer */}
      <Footer />
    </GridBackground>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-xs">
          Loading KindCrew...
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}
