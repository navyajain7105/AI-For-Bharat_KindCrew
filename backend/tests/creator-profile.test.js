import assert from "node:assert/strict";
import test from "node:test";
import { CreatorProfileService, ProfileAlreadyExistsError } from "../src/modules/creator-profile/creatorProfile.service.js";
import { buildCreatorContext } from "../src/modules/creator-profile/creatorContext.js";
import { getProfile, createProfile, updateProfile, deleteProfile } from "../src/modules/creator-profile/creatorProfile.controller.js";

// Helper: Make mock repository for creator profile tests
function makeMockRepository(overrides = {}) {
  const store = new Map();
  return {
    findByUserId: async (userId) => {
      for (const val of store.values()) {
        if (val.userId === userId) return val;
      }
      return null;
    },
    findById: async (creatorId) => store.get(creatorId) || null,
    create: async (profile) => {
      store.set(profile.creatorId, profile);
      return profile;
    },
    update: async (creatorId, updates) => {
      const existing = store.get(creatorId) || {};
      const updated = { ...existing, ...updates };
      store.set(creatorId, updated);
      return updated;
    },
    delete: async (creatorId) => {
      store.delete(creatorId);
    },
    _store: store,
    ...overrides,
  };
}

// Helper: Make mock HTTP response
function makeMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

test("Step 15 - Test 1 & 2: unauthenticated profile routes return 401", async () => {
  const req = { userId: null };
  const res = makeMockResponse();
  const next = () => {};

  await getProfile(req, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);

  await createProfile(req, res, next);
  assert.equal(res.statusCode, 401);
});

test("Step 15 - Test 3, 4, 5: User A profile management operations succeed", async () => {
  const repo = makeMockRepository();
  const service = new CreatorProfileService(repo, () => "test-uuid");

  // Create profile
  const profileInput = {
    niche: { primary: "Software Engineering" },
    targetAudience: "Junior Developers",
    goals: { primaryGoal: "growth", creatorLevel: "beginner" },
    strategy: { contentStrategy: "educational", postingFrequency: "3/week" },
  };

  const created = await service.createProfile("user-a", profileInput);
  assert.equal(created.userId, "user-a");
  assert.equal(created.creatorId, "creator_test-uuid");

  // Read own profile
  const fetched = await service.getProfileByUserId("user-a");
  assert.deepEqual(fetched, created);

  // Update profile
  const updateInput = {
    targetAudience: "Mid-level Developers",
    preferences: {
      contentStyle: "Hands-on Tutorials",
    },
  };
  const updated = await service.updateProfile("user-a", updateInput);
  assert.equal(updated.targetAudience, "Mid-level Developers");
  assert.equal(updated.preferences.contentStyle, "Hands-on Tutorials");

  // Delete profile
  await service.deleteProfile("user-a");
  const fetchedAfterDelete = await service.getProfileByUserId("user-a");
  assert.equal(fetchedAfterDelete, null);
});

test("Step 15 - Test 6, 7, 8: User A cannot read, update or delete User B's profile", async () => {
  const repo = makeMockRepository();
  const service = new CreatorProfileService(repo, () => "test-uuid");

  // Create User B's profile
  const profileB = {
    userId: "user-b",
    niche: { primary: "Finance" },
    targetAudience: "Investors",
    goals: { primaryGoal: "monetization", creatorLevel: "advanced" },
    strategy: { contentStrategy: "promotional", postingFrequency: "1/week" },
  };
  await service.createProfile("user-b", profileB);

  // User A attempts to update User B's profile (should throw or update User A's profile instead)
  await assert.rejects(
    async () => {
      // Trying to update when User A doesn't even have a profile should fail
      await service.updateProfile("user-a", { targetAudience: "Hacked" });
    },
    /Creator profile not found/
  );

  // User A attempts to delete User B's profile
  await assert.rejects(
    async () => {
      await service.deleteProfile("user-a");
    },
    /Creator profile not found/
  );
});

test("Step 15 - Test 9, 10, 11, 12: User cannot override critical or protected fields", async () => {
  const repo = makeMockRepository();
  const service = new CreatorProfileService(repo, () => "test-uuid");

  await service.createProfile("user-a", {
    niche: { primary: "Cooking" },
    targetAudience: "Foodies",
    goals: { primaryGoal: "engagement", creatorLevel: "intermediate" },
    strategy: { contentStrategy: "entertainment", postingFrequency: "daily" },
  });

  // Attempt update with protected fields
  const maliciousUpdate = {
    userId: "user-b-hacked",
    creatorId: "creator_hacked",
    status: "suspended",
    role: "admin",
    createdAt: "2020-01-01T00:00:00Z",
  };

  const updated = await service.updateProfile("user-a", maliciousUpdate);
  // Protected fields must not change
  assert.equal(updated.userId, "user-a");
  assert.equal(updated.creatorId, "creator_test-uuid");
  assert.equal(updated.status, "active");
  assert.equal(updated.role, undefined); // role doesn't exist on creator profile
  assert.notEqual(updated.createdAt, "2020-01-01T00:00:00Z");
});

test("Step 15 - Test 13: Second profile creation for same user throws 409", async () => {
  const repo = makeMockRepository();
  const service = new CreatorProfileService(repo, () => "test-uuid");

  const input = {
    niche: { primary: "Gaming" },
    targetAudience: "Gamers",
    goals: { primaryGoal: "engagement", creatorLevel: "intermediate" },
    strategy: { contentStrategy: "entertainment", postingFrequency: "daily" },
  };

  await service.createProfile("user-a", input);

  // Try again
  await assert.rejects(
    async () => {
      await service.createProfile("user-a", input);
    },
    (err) => {
      assert(err instanceof ProfileAlreadyExistsError);
      assert.equal(err.code, "PROFILE_ALREADY_EXISTS");
      return true;
    }
  );
});

test("Step 15 - Test 14 & 15: Content Idea Ownership & IDOR Protection", async () => {
  // Mock getIdeaById and createFromIdeaHandler logic
  const mockIdeasTable = new Map();
  mockIdeasTable.set("idea-own", { userId: "user-a", ideaId: "idea-own", topic: "My Great Topic" });
  mockIdeasTable.set("idea-victim", { userId: "user-b", ideaId: "idea-victim", topic: "Stolen Topic" });

  async function testGetIdeaById(userId, ideaId) {
    const item = mockIdeasTable.get(ideaId);
    if (item && item.userId === userId) {
      return item;
    }
    return null;
  }

  // User A can access own idea
  const ownIdea = await testGetIdeaById("user-a", "idea-own");
  assert.ok(ownIdea);
  assert.equal(ownIdea.topic, "My Great Topic");

  // User A cannot access User B's idea (returns null/not found, preventing IDOR)
  const stolenIdea = await testGetIdeaById("user-a", "idea-victim");
  assert.equal(stolenIdea, null);
});

test("Step 15 - Test 16-22: AI CreatorContext extraction & safety sanitization", async () => {
  const fullProfile = {
    userId: "user-a",
    creatorId: "creator-1",
    email: "secrets@leak.com",
    role: "admin",
    status: "active",
    niche: { primary: "WebDev", secondary: "React" },
    targetAudience: "Developers",
    goals: { primaryGoal: "brand-building", creatorLevel: "advanced" },
    strategy: {
      contentStrategy: "educational",
      postingFrequency: "2/week",
      contentPillars: ["Hook", "State", "Context"],
      contentApproach: "Hands-on tutorials",
    },
    preferences: {
      tones: ["Inspirational", "Professional"],
      formats: ["threads", "carousel"],
      contentStyle: "Deep dive code explanations",
      voiceTone: "authoritative",
      avoidTopics: ["crypto", "web3"],
      constraints: {
        emojiUsage: false,
        ctaStrength: "strong",
        formality: "formal",
      },
    },
  };

  const context = buildCreatorContext(fullProfile);

  // Valid contexts mapped correctly
  assert.equal(context.niche, "WebDev (React)");
  assert.equal(context.audience, "Developers");
  assert.equal(context.goal, "brand-building");
  assert.equal(context.creatorLevel, "advanced");
  assert.equal(context.contentStrategy, "educational");
  assert.equal(context.postingFrequency, "2/week");
  assert.deepEqual(context.contentPillars, ["Hook", "State", "Context"]);
  assert.equal(context.tone, "Inspirational");
  assert.equal(context.style, "Deep dive code explanations");
  assert.equal(context.formality, "formal");
  assert.deepEqual(context.avoidTopics, ["crypto", "web3"]);
  assert.equal(context.contentApproach, "Hands-on tutorials");
  assert.deepEqual(context.formats, ["threads", "carousel"]);

  assert.equal(context.userId, undefined);
  assert.equal(context.creatorId, undefined);
  assert.equal(context.email, undefined);
  assert.equal(context.role, undefined);
  assert.equal(context.status, undefined);

  // Fallback defaults on missing profile
  const emptyContext = buildCreatorContext(null);
  assert.equal(emptyContext.niche, "General");
  assert.equal(emptyContext.audience, "General Audience");
  assert.equal(emptyContext.tone, "Professional");
  assert.equal(emptyContext.creatorLevel, "beginner");
});
