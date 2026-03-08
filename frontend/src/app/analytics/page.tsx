"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuth();

  useEffect(() => {
    if (authReady && !isAuthenticated()) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, router]);

  if (!authReady) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div style={{ color: "var(--color-text-secondary)" }}>Loading...</div>
      </div>
    );
  }

  // sample published posts with metrics
  const initialPosts = [
    { id: "1", title: "Your SaaS is Leaking Money", platform: "Twitter", views: 5430, likes: 1200 },
    { id: "2", title: "The 'Lazy' Way to Build a Startup", platform: "LinkedIn", views: 1205, likes: 234 },
    { id: "3", title: "From 0 to 10k Followers", platform: "Instagram", views: 0, likes: 0 },
  ];
  const [posts, setPosts] = useState(initialPosts);

  const updateMetrics = (id: string, views: number, likes: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, views, likes } : p)),
    );
  };

  const [selectedForSuggestions, setSelectedForSuggestions] = useState<string | null>(null);

  return (
    <AuthenticatedLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-1"
            style={{ color: "var(--color-text)" }}
          >
            Analysis & Feedback
          </h1>
          <p className="text-gray-600">Learn what works and improve future content.</p>
        </div>

        {/* Performance overview and suggestions side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-surface rounded p-4 shadow">
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text)" }}>
              Performance Overview
            </h2>
            {/* dark chart container */}
            <div className="w-full h-40 bg-surface rounded">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={posts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="title"
                    tick={{ fill: "var(--color-text)", fontSize: 12 }}
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                  />
                  <YAxis tick={{ fill: "var(--color-text)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                    labelStyle={{ color: "var(--color-text)" }}
                    itemStyle={{ color: "var(--color-text)" }}
                  />
                  <Bar dataKey="views" fill="#6366F1" />
                  <Bar dataKey="likes" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              Views and likes by post. Click a row below to add/update data.
            </p>
          </div>
          <div className="bg-surface rounded p-4 shadow">
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text)" }}>
              AI Improvement Suggestions
            </h2>
            {selectedForSuggestions ? (
              <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Suggestions for: {posts.find((p) => p.id === selectedForSuggestions)?.title}
                <p className="mt-2">[AI tips would appear here based on metrics]</p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                Select a post to get AI‑powered suggestions.
              </p>
            )}
          </div>
        </div>

        {/* Content performance list */}
        <div className="bg-surface rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Content Performance
          </h2>
          <div className="space-y-3">
            {posts.map((p) => (
              <div
                key={p.id}
                className="p-3 border border-gray-600 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-gray-400">{p.platform}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Views"
                    value={p.views}
                    onChange={(e) =>
                      updateMetrics(p.id, Number(e.target.value), p.likes)
                    }
                    className="w-24 bg-surface border border-gray-600 text-white rounded p-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Likes"
                    value={p.likes}
                    onChange={(e) =>
                      updateMetrics(p.id, p.views, Number(e.target.value))
                    }
                    className="w-24 bg-surface border border-gray-600 text-white rounded p-1 text-sm"
                  />
                  {p.views === 0 && p.likes === 0 ? (
                    <button
                      onClick={() => setSelectedForSuggestions(p.id)}
                      className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      Add Performance
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedForSuggestions(p.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                    >
                      Get Suggestions
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
