"use client";

import { useState } from "react";
import apiClient from "@/lib/apiClient";

export default function Home() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const { data } = await apiClient.get("/health");
      setResponse(data);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      setResponse({
        error: "Failed to connect to backend",
        details: errorMessage,
        url: "http://localhost:5000/health",
        tip: "Make sure backend server is running: cd backend && npm run dev",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div
        className="max-w-2xl w-full mx-4 p-8 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          borderWidth: "1px",
        }}
      >
        <h1
          className="text-4xl font-bold text-center mb-2"
          style={{ color: "var(--color-text)" }}
        >
          AI-For-Bharat KindCrew
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Next.js + Express Full Stack App
        </p>

        <div className="space-y-4">
          <button
            onClick={testBackend}
            disabled={loading}
            className="w-full py-3 px-6 font-semibold rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--color-surface-hover)",
              color: "var(--color-text)",
            }}
          >
            {loading ? "Testing..." : "Test Backend Connection"}
          </button>

          {response && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor: "var(--color-border)",
                borderWidth: "1px",
              }}
            >
              <h3
                className="font-semibold mb-2"
                style={{ color: "var(--color-text)" }}
              >
                Response:
              </h3>
              <pre
                className="text-sm overflow-x-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          <div
            className="pt-6"
            style={{
              borderTopColor: "var(--color-divider)",
              borderTopWidth: "1px",
            }}
          >
            <h3
              className="font-semibold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              Tech Stack:
            </h3>
            <div
              className="grid grid-cols-2 gap-4 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <div>
                <strong style={{ color: "var(--color-text)" }}>
                  Frontend:
                </strong>
                <ul className="mt-1 space-y-1">
                  <li>- Next.js 16</li>
                  <li>- TypeScript</li>
                  <li>- Tailwind CSS</li>
                  <li>- Axios</li>
                  <li>- Zustand</li>
                </ul>
              </div>
              <div>
                <strong style={{ color: "var(--color-text)" }}>Backend:</strong>
                <ul className="mt-1 space-y-1">
                  <li>- Express.js</li>
                  <li>- ES6 Modules</li>
                  <li>- CORS</li>
                  <li>- Nodemon</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
