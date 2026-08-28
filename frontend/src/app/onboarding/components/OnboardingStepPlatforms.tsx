"use client";

import React, { useState } from "react";
import type { Platform } from "@/lib/api/creatorProfile";
import { toast } from "sonner";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface OnboardingStepPlatformsProps {
  platforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export default function OnboardingStepPlatforms({
  platforms,
  onChange,
}: OnboardingStepPlatformsProps) {
  const [newPlatform, setNewPlatform] = useState({ name: "", handle: "" });

  const handleAddPlatform = () => {
    if (!newPlatform.name.trim() || !newPlatform.handle.trim()) {
      toast.error("Please provide both platform name and account handle");
      return;
    }

    const name = newPlatform.name.trim().toLowerCase();
    const handle = newPlatform.handle.trim();

    // Check duplicate
    if (platforms.some((p) => p.name.toLowerCase() === name)) {
      toast.error("This platform has already been added.");
      return;
    }

    const updated = [...platforms, { name, handle, active: true }];
    onChange(updated);
    setNewPlatform({ name: "", handle: "" });
    toast.success("Platform added!");
  };

  const handleRemovePlatform = (index: number) => {
    const updated = platforms.filter((_, i) => i !== index);
    onChange(updated);
  };

  const presetPlatforms = ["linkedin", "youtube", "instagram", "twitter", "reddit", "medium"];

  return (
    <div
      className="p-6 rounded-xl space-y-6"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-white">
          Where do you publish?
        </h2>
        <p className="text-sm text-slate-400">
          Add the social media channels where you distribute your work
        </p>
      </div>

      <div className="space-y-4">
        {/* Preset selections */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-300">
            QUICK ADD PLATFORM
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {presetPlatforms.map((preset) => {
              const isAdded = platforms.some((p) => p.name.toLowerCase() === preset);
              return (
                <button
                  key={preset}
                  type="button"
                  disabled={isAdded}
                  onClick={() => setNewPlatform({ name: preset, handle: "@" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                    isAdded
                      ? "border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed"
                      : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  + {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newPlatform.name}
            onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
            placeholder="Platform Name (e.g. Substack)"
            className="flex-1 px-4 py-3 rounded-lg outline-none text-white text-sm sm:text-base border border-slate-700 bg-slate-950"
          />
          <input
            type="text"
            value={newPlatform.handle}
            onChange={(e) => setNewPlatform({ ...newPlatform, handle: e.target.value })}
            placeholder="@handle or profile link"
            className="flex-1 px-4 py-3 rounded-lg outline-none text-white text-sm sm:text-base border border-slate-700 bg-slate-950"
          />
          <button
            type="button"
            onClick={handleAddPlatform}
            className="px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-slate-200 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Channel
          </button>
        </div>

        {/* Added Platforms List */}
        {platforms.length > 0 && (
          <div className="mt-6 border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-950/40 px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
              ADDED CHANNELS ({platforms.length})
            </div>
            <div className="divide-y divide-slate-800">
              {platforms.map((platform, index) => (
                <div key={index} className="flex justify-between items-center px-4 py-3 bg-slate-950/20">
                  <div>
                    <span className="capitalize font-semibold text-white mr-3">
                      {platform.name}
                    </span>
                    <span className="text-slate-400 text-sm">{platform.handle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePlatform(index)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
