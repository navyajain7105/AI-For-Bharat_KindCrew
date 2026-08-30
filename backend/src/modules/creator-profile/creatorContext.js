/**
 * Sanitize and build a complete, safe creator context for Bedrock AI services.
 * Excludes sensitive user details (emails, credentials, identifiers) and fallback defaults are set.
 *
 * @param {Object|null} profile - Raw CreatorProfile object from database
 * @returns {Object} Normalized profile details for prompt generation
 */
export function buildCreatorContext(profile) {
  if (!profile) {
    return {
      niche: "General",
      audience: "General Audience",
      goal: "growth",
      creatorLevel: "beginner",
      contentStrategy: "educational",
      postingFrequency: "1/week",
      contentPillars: [],
      tone: "Professional",
      style: "Standard",
      formality: "semi-formal",
      avoidTopics: [],
      contentApproach: "Value-driven",
      formats: ["static"],
    };
  }

  const nichePrimary = profile.niche?.primary || "General";
  const nicheSecondary = profile.niche?.secondary || "";

  return {
    niche: `${nichePrimary}${nicheSecondary ? ` (${nicheSecondary})` : ""}`,
    audience: profile.targetAudience || "General Audience",
    goal: profile.goals?.primaryGoal || "growth",
    creatorLevel: profile.goals?.creatorLevel || "beginner",
    contentStrategy: profile.strategy?.contentStrategy || "educational",
    postingFrequency: profile.strategy?.postingFrequency || "1/week",
    contentPillars: Array.isArray(profile.strategy?.contentPillars)
      ? profile.strategy.contentPillars
      : [],
    tone: Array.isArray(profile.preferences?.tones) && profile.preferences.tones.length > 0
      ? profile.preferences.tones[0]
      : profile.preferences?.voiceTone || "Professional",
    style: profile.preferences?.contentStyle || "Standard",
    formality: profile.preferences?.constraints?.formality || "semi-formal",
    avoidTopics: Array.isArray(profile.preferences?.avoidTopics)
      ? profile.preferences.avoidTopics
      : [],
    contentApproach: profile.strategy?.contentApproach || "Value-driven",
    formats: Array.isArray(profile.preferences?.formats)
      ? profile.preferences.formats
      : ["static"],
  };
}
