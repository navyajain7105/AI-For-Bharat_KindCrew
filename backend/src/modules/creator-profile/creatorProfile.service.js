import { v4 as uuidv4 } from "uuid";
import CreatorProfile from "../../../models/CreatorProfile.js";
import creatorProfileRepository from "./creatorProfile.repository.js";

export class ProfileAlreadyExistsError extends Error {
  constructor(userId) {
    super(`A creator profile already exists for user ID: ${userId}`);
    this.name = "ProfileAlreadyExistsError";
    this.code = "PROFILE_ALREADY_EXISTS";
    this.userId = userId;
  }
}

export class CreatorProfileService {
  constructor(repository = creatorProfileRepository, generateId = uuidv4) {
    this.repository = repository;
    this.generateId = generateId;
  }

  validateProfileInput(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      if (!data.userId || typeof data.userId !== "string") {
        errors.push("userId is required and must be a string");
      }
      if (!data.niche || !data.niche.primary || typeof data.niche.primary !== "string") {
        errors.push("Primary niche is required");
      }
      if (!data.targetAudience || typeof data.targetAudience !== "string" || !data.targetAudience.trim()) {
        errors.push("Target audience is required");
      }
      if (!data.goals || !data.goals.primaryGoal) {
        errors.push("Primary goal is required");
      }
      if (!data.strategy || !data.strategy.contentStrategy) {
        errors.push("Content strategy is required");
      }
    }

    // Validate enum boundaries if values are provided
    if (data.goals?.primaryGoal) {
      const allowedGoals = [
        "growth",
        "monetization",
        "engagement",
        "brand-building",
        "community-building",
        "personal-brand",
        "thought-leadership",
      ];
      if (!allowedGoals.includes(data.goals.primaryGoal)) {
        errors.push("Invalid primary goal");
      }
    }

    if (data.goals?.creatorLevel) {
      const allowedLevels = ["beginner", "intermediate", "advanced"];
      if (!allowedLevels.includes(data.goals.creatorLevel)) {
        errors.push("Invalid creator level");
      }
    }

    if (data.strategy?.contentPillars && !Array.isArray(data.strategy.contentPillars)) {
      errors.push("Content pillars must be an array");
    }

    if (data.platforms && !Array.isArray(data.platforms)) {
      errors.push("Platforms must be an array");
    }

    if (data.preferences?.constraints) {
      const { ctaStrength, formality } = data.preferences.constraints;
      if (ctaStrength && !["weak", "medium", "strong"].includes(ctaStrength)) {
        errors.push("CTA strength must be weak, medium, or strong");
      }
      if (formality && !["formal", "semi-formal", "casual"].includes(formality)) {
        errors.push("Formality must be formal, semi-formal, or casual");
      }
    }

    // Validate new prompt fields
    if (data.preferences?.avoidTopics && !Array.isArray(data.preferences.avoidTopics)) {
      errors.push("avoidTopics must be an array of strings");
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }

  async getProfileByUserId(userId) {
    if (!userId) throw new Error("User ID is required");
    return this.repository.findByUserId(userId);
  }

  async createProfile(userId, rawData) {
    if (!userId) throw new Error("User ID is required");

    // Enforce 1-to-1 profile constraint
    const existingProfile = await this.repository.findByUserId(userId);
    if (existingProfile) {
      throw new ProfileAlreadyExistsError(userId);
    }

    // Clean inputs and enforce owner userId
    const input = {
      ...rawData,
      userId,
    };

    this.validateProfileInput(input, false);

    const creatorId = `creator_${this.generateId()}`;
    
    // Build default creator profile structures including new prompt fields
    const profile = CreatorProfile.create(creatorId, userId, input);

    // Map new fields specifically in the created object
    profile.preferences.contentStyle = rawData.preferences?.contentStyle || "Professional";
    profile.preferences.voiceTone = rawData.preferences?.voiceTone || "educational";
    profile.preferences.avoidTopics = Array.isArray(rawData.preferences?.avoidTopics)
      ? rawData.preferences.avoidTopics.map((topic) => String(topic).trim()).filter(Boolean)
      : [];
    profile.strategy.contentApproach = rawData.strategy?.contentApproach || "Value-driven";

    return this.repository.create(profile);
  }

  async updateProfile(userId, rawData) {
    if (!userId) throw new Error("User ID is required");

    const profile = await this.repository.findByUserId(userId);
    if (!profile) {
      throw new Error("Creator profile not found");
    }

    // Verify ownership
    if (profile.userId !== userId) {
      throw new Error("Unauthorized to update this creator profile");
    }

    // Strictly validate inputs
    this.validateProfileInput(rawData, true);

    // Filter out client-provided protected fields to prevent mass assignment/takeover
    const allowedUpdates = {};
    const disallowedKeys = [
      "userId",
      "creatorId",
      "status",
      "role",
      "authProviders",
      "createdAt",
      "updatedAt",
    ];

    Object.keys(rawData).forEach((key) => {
      if (!disallowedKeys.includes(key) && rawData[key] !== undefined) {
        allowedUpdates[key] = rawData[key];
      }
    });

    // Special handling for nested parameters
    if (rawData.niche) {
      allowedUpdates["niche.primary"] = rawData.niche.primary;
      allowedUpdates["niche.secondary"] = rawData.niche.secondary || null;
    }
    if (rawData.goals) {
      if (rawData.goals.primaryGoal) allowedUpdates["goals.primaryGoal"] = rawData.goals.primaryGoal;
      if (rawData.goals.creatorLevel) allowedUpdates["goals.creatorLevel"] = rawData.goals.creatorLevel;
    }
    if (rawData.strategy) {
      if (rawData.strategy.contentStrategy) allowedUpdates["strategy.contentStrategy"] = rawData.strategy.contentStrategy;
      if (rawData.strategy.postingFrequency) allowedUpdates["strategy.postingFrequency"] = rawData.strategy.postingFrequency;
      if (rawData.strategy.contentPillars) allowedUpdates["strategy.contentPillars"] = rawData.strategy.contentPillars;
      if (rawData.strategy.contentApproach) allowedUpdates["strategy.contentApproach"] = rawData.strategy.contentApproach;
    }
    if (rawData.preferences) {
      if (rawData.preferences.tones) allowedUpdates["preferences.tones"] = rawData.preferences.tones;
      if (rawData.preferences.formats) allowedUpdates["preferences.formats"] = rawData.preferences.formats;
      if (rawData.preferences.timeCommitment) allowedUpdates["preferences.timeCommitment"] = rawData.preferences.timeCommitment;
      if (rawData.preferences.contentStyle) allowedUpdates["preferences.contentStyle"] = rawData.preferences.contentStyle;
      if (rawData.preferences.voiceTone) allowedUpdates["preferences.voiceTone"] = rawData.preferences.voiceTone;
      if (rawData.preferences.avoidTopics) allowedUpdates["preferences.avoidTopics"] = rawData.preferences.avoidTopics;
      
      if (rawData.preferences.constraints) {
        const constraints = rawData.preferences.constraints;
        if (constraints.emojiUsage !== undefined) allowedUpdates["preferences.constraints.emojiUsage"] = constraints.emojiUsage;
        if (constraints.ctaStrength) allowedUpdates["preferences.constraints.ctaStrength"] = constraints.ctaStrength;
        if (constraints.formality) allowedUpdates["preferences.constraints.formality"] = constraints.formality;
      }
    }

    allowedUpdates.updatedAt = new Date().toISOString();

    return this.repository.update(profile.creatorId, allowedUpdates);
  }

  async deleteProfile(userId) {
    if (!userId) throw new Error("User ID is required");

    const profile = await this.repository.findByUserId(userId);
    if (!profile) {
      throw new Error("Creator profile not found");
    }

    if (profile.userId !== userId) {
      throw new Error("Unauthorized to delete this creator profile");
    }

    return this.repository.delete(profile.creatorId);
  }
}

export default new CreatorProfileService();
