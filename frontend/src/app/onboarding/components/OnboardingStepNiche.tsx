"use client";

import React from "react";
import { FiInfo } from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnboardingStepNicheProps {
  primaryNiche: string;
  secondaryNiche: string;
  targetAudience: string;
  isOtherNiche: boolean;
  customNiche: string;
  onChange: (name: string, value: any) => void;
  onNicheToggle: (isOther: boolean) => void;
  onCustomNicheChange: (val: string) => void;
}

export default function OnboardingStepNiche({
  primaryNiche,
  secondaryNiche,
  targetAudience,
  isOtherNiche,
  customNiche,
  onChange,
  onNicheToggle,
  onCustomNicheChange,
}: OnboardingStepNicheProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Niche Section */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <h2
            className="text-xl sm:text-2xl font-semibold text-white"
          >
            Your Focus & Niche
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex items-center">
                  <FiInfo
                    className="w-4 h-4 text-slate-400"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select the main topic areas you create content about</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2 text-slate-300"
            >
              Primary Niche *
            </label>
            <select
              value={isOtherNiche ? "other" : primaryNiche}
              onChange={(e) => {
                if (e.target.value === "other") {
                  onNicheToggle(true);
                  onChange("niche", { primary: customNiche, secondary: secondaryNiche });
                } else {
                  onNicheToggle(false);
                  onCustomNicheChange("");
                  onChange("niche", { primary: e.target.value, secondary: secondaryNiche });
                }
              }}
              className="w-full px-4 py-3 rounded-lg outline-none text-white text-sm sm:text-base border border-slate-700 bg-slate-950"
            >
              <option value="">Select a niche</option>
              <option value="ai-ml">AI & Machine Learning</option>
              <option value="web-dev">Web Development</option>
              <option value="mobile-dev">Mobile Development</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="devops">DevOps & Cloud</option>
              <option value="data-science">Data Science</option>
              <option value="tech-general">Technology (General)</option>
              <option value="yoga">Yoga & Meditation</option>
              <option value="weightlifting">Weightlifting & Strength</option>
              <option value="running">Running & Cardio</option>
              <option value="nutrition">Nutrition & Diet</option>
              <option value="fitness-general">Fitness & Health (General)</option>
              <option value="marketing">Marketing & Advertising</option>
              <option value="sales">Sales & Business Development</option>
              <option value="leadership">Leadership & Management</option>
              <option value="entrepreneurship">Entrepreneurship & Startups</option>
              <option value="finance">Personal Finance & Investing</option>
              <option value="business-general">Business (General)</option>
              <option value="personal-dev">Personal Development</option>
              <option value="productivity">Productivity & Time Management</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="education">Education & Teaching</option>
              <option value="entertainment">Entertainment</option>
              <option value="food">Food & Cooking</option>
              <option value="travel">Travel & Adventure</option>
              <option value="fashion">Fashion & Beauty</option>
              <option value="gaming">Gaming & Esports</option>
              <option value="art">Art & Design</option>
              <option value="music">Music & Audio</option>
              <option value="photography">Photography & Videography</option>
              <option value="parenting">Parenting & Family</option>
              <option value="pets">Pets & Animals</option>
              <option value="sustainability">Sustainability & Eco-Living</option>
              <option value="other">Other (Specify below)</option>
            </select>

            {isOtherNiche && (
              <input
                type="text"
                value={customNiche}
                onChange={(e) => {
                  onCustomNicheChange(e.target.value);
                  onChange("niche", { primary: e.target.value, secondary: secondaryNiche });
                }}
                placeholder="Specify your niche..."
                className="w-full px-4 py-3 rounded-lg outline-none text-white text-sm sm:text-base mt-3 border border-slate-700 bg-slate-950"
              />
            )}
          </div>
        </div>
      </div>

      {/* Target Audience Section */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2
          className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-white"
        >
          Target Audience
        </h2>
        <label
          className="block text-sm font-medium mb-2 text-slate-300"
        >
          Who is your content for? *
        </label>
        <select
          value={targetAudience}
          onChange={(e) => onChange("targetAudience", e.target.value)}
          className="w-full px-4 py-3 rounded-lg outline-none text-white text-sm sm:text-base border border-slate-700 bg-slate-950"
        >
          <option value="">Select your target audience</option>
          <option value="students-general">Students (General)</option>
          <option value="high-school-students">High School Students</option>
          <option value="college-students">College/University Students</option>
          <option value="graduate-students">Graduate Students</option>
          <option value="recent-graduates">Recent Graduates</option>
          <option value="career-changers">Career Changers</option>
          <option value="entry-level-professionals">Entry-Level Professionals</option>
          <option value="mid-level-professionals">Mid-Level Professionals</option>
          <option value="senior-professionals">Senior Professionals/Executives</option>
          <option value="entrepreneurs">Entrepreneurs/Founders</option>
          <option value="solopreneurs">Solopreneurs/Freelancers</option>
          <option value="small-business-owners">Small Business Owners</option>
          <option value="corporate-enterprise">Corporate/Enterprise</option>
          <option value="content-creators">Content Creators/Influencers</option>
          <option value="coaches-consultants">Coaches/Consultants</option>
          <option value="educators">Educators/Teachers</option>
          <option value="parents">Parents</option>
          <option value="retirees">Retirees</option>
          <option value="hobbyists">Hobbyists/Enthusiasts</option>
          <option value="general-audience">General Audience</option>
        </select>
      </div>
    </div>
  );
}
