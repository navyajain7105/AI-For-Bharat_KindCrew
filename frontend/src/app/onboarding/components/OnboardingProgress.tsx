"use client";

import React from "react";

interface OnboardingProgressProps {
  currentStep: number;
}

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const steps = [
    { label: "Creator Focus", desc: "Niche & Audience" },
    { label: "Distribution Channels", desc: "Your Platforms" },
  ];

  return (
    <div className="w-full max-w-lg mx-auto mb-8 sm:mb-12">
      <div className="flex justify-between items-center relative">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-10" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-white -z-10 transition-all duration-300"
          style={{ width: currentStep === 1 ? "0%" : "100%" }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border ${
                  isCompleted
                    ? "bg-white border-white text-slate-950"
                    : isActive
                    ? "bg-slate-900 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                {stepNumber}
              </div>
              <div className="mt-3 text-center">
                <div
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </div>
                <div
                  className={`text-[10px] hidden sm:block transition-colors mt-0.5 ${
                    isActive ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
