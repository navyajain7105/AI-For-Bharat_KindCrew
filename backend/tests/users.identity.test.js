import assert from "node:assert/strict";
import test from "node:test";
import {
  getStoredProviderUserId,
  hasMatchingProviderIdentity,
  normalizeEmail,
} from "../src/modules/users/userIdentity.js";
import { createUsersRepository } from "../src/modules/users/users.repository.js";
import {
  IdentityLinkingRequiredError,
  LoginMethodConflictError,
  UsersService,
} from "../src/modules/users/users.service.js";
import { filterDefinedEntries } from "../services/dynamodb.service.js";
import { handleIdentityLinkingRequired } from "../controllers/authController.js";

const identity = {
  provider: "google",
  providerUserId: "google-sub-1",
  email: "person@example.com",
  emailVerified: true,
};

function makeRepository(overrides = {}) {
  return {
    findById: async () => null,
    findByEmail: async () => null,
    findByProviderIdentity: async () => null,
    create: async (user) => user,
    update: async () => null,
    updateOnLogin: async () => null,
    ...overrides,
  };
}

test("normalizes email for application lookup", () => {
  assert.equal(normalizeEmail("  Person@Example.COM "), "person@example.com");
  assert.equal(normalizeEmail("person+tag@example.com"), "person+tag@example.com");
});

test("repository exposes ID, email, and provider identity lookups", async () => {
  const user = { userId: "user-1", email: "person@example.com" };
  const database = {
    getUserById: async () => user,
    getUserByEmail: async () => user,
    getUserByProviderIdentity: async () => user,
  };
  const repository = createUsersRepository(database);

  assert.equal(await repository.findById("user-1"), user);
  assert.equal(await repository.findByEmail("person@example.com"), user);
  assert.equal(
    await repository.findByProviderIdentity("google", "google-sub-1"),
    user,
  );
});

test("undefined Cognito fields are excluded while null is preserved", () => {
  assert.deepEqual(filterDefinedEntries({
    profileImage: undefined,
    givenName: null,
    locale: "en-IN",
  }), [
    ["givenName", null],
    ["locale", "en-IN"],
  ]);
});

test("matches provider and provider ID, including legacy providerId records", () => {
  const user = {
    authProviders: [
      { type: "google", providerId: "google-sub-1" },
      { type: "cognito", providerUserId: "native-sub-1" },
    ],
  };

  assert.equal(hasMatchingProviderIdentity(user, identity), true);
  assert.equal(
    hasMatchingProviderIdentity(user, {
      ...identity,
      providerUserId: "different-sub",
    }),
    false,
  );
  assert.equal(getStoredProviderUserId(user.authProviders[1]), "native-sub-1");
});

test("resolves an existing user by provider identity before email", async () => {
  const existingUser = {
    userId: "user-1",
    email: "other@example.com",
    authProviders: [{ type: "google", providerId: "google-sub-1" }],
  };
  const calls = [];
  const repository = makeRepository({
    findByProviderIdentity: async (...args) => {
      calls.push(["provider", ...args]);
      return existingUser;
    },
    updateOnLogin: async (...args) => calls.push(["login", ...args]),
    findById: async () => existingUser,
    findByEmail: async () => {
      calls.push(["email"]);
      return null;
    },
  });

  const service = new UsersService(repository, () => "unused");
  const result = await service.findOrCreateUser(
    identity.email,
    "Person",
    identity.provider,
    { cognitoId: identity.providerUserId, emailVerified: true },
  );

  assert.equal(result, existingUser);
  assert.equal(calls[0][0], "provider");
  assert.equal(calls.some(([type]) => type === "email"), false);
});

test("does not silently link a different provider with the same email", async () => {
  const repository = makeRepository({
    findByEmail: async () => ({
      userId: "user-1",
      email: identity.email,
      authProviders: [{ type: "cognito", providerId: "native-sub-1" }],
    }),
  });
  const service = new UsersService(repository, () => "unused");

  await assert.rejects(
    service.findOrCreateUser(
      identity.email,
      "Person",
      identity.provider,
      { cognitoId: identity.providerUserId, emailVerified: true },
    ),
    (error) =>
      error instanceof IdentityLinkingRequiredError &&
      error.code === "IDENTITY_LINKING_REQUIRED" &&
      error.existingUserId === "user-1",
  );
});

test("does not treat a different provider ID as the same identity", async () => {
  const user = {
    userId: "user-1",
    authProviders: [{ type: "google", providerId: "google-sub-1" }],
  };
  const updatedProviders = [];
  const repository = makeRepository({
    findById: async () => user,
    update: async (_userId, updates) => {
      updatedProviders.push(...updates.authProviders);
      return user;
    },
  });
  const service = new UsersService(repository, () => "unused");

  await service.addAuthProvider("user-1", "google", "google-sub-2");

  assert.deepEqual(updatedProviders, [
    { type: "google", providerId: "google-sub-1" },
    {
      type: "google",
      providerId: "google-sub-2",
      linkedAt: updatedProviders[1].linkedAt,
    },
  ]);
});

test("creates one application user with backend-controlled defaults", async () => {
  let generatedIds = 0;
  let createdUser;
  const repository = makeRepository({
    create: async (user) => {
      createdUser = user;
      return user;
    },
  });
  const service = new UsersService(repository, () => {
    generatedIds += 1;
    return "user-1";
  });

  const result = await service.findOrCreateUser(
    " Person@Example.COM ",
    "Person",
    "cognito",
    {
      cognitoId: "native-sub-1",
      emailVerified: true,
      role: "admin",
      status: "suspended",
    },
  );

  assert.equal(result, createdUser);
  assert.equal(generatedIds, 1);
  assert.equal(createdUser.userId, "user-1");
  assert.equal(createdUser.email, "person@example.com");
  assert.equal(createdUser.role, "user");
  assert.equal(createdUser.status, "active");
});

test("does not create a fake user when persistence fails", async () => {
  const persistenceError = new Error("database unavailable");
  const repository = makeRepository({
    create: async () => {
      throw persistenceError;
    },
  });
  const service = new UsersService(repository, () => "user-1");

  await assert.rejects(
    service.findOrCreateUser(
      identity.email,
      "Person",
      identity.provider,
      { cognitoId: identity.providerUserId, emailVerified: true },
    ),
    persistenceError,
  );
});

test("identity conflict redirects user to settings with generic error", () => {
  let redirectUrl;
  const res = {
    redirect: (url) => {
      redirectUrl = url;
    },
  };

  assert.equal(
    handleIdentityLinkingRequired(res, {
      code: "IDENTITY_LINKING_REQUIRED",
      existingUserId: "must-not-leak",
      identity: { provider: "google", providerUserId: "must-not-leak" },
    }),
    true,
  );
  assert.ok(redirectUrl.includes("/?linking=error&reason="));
  assert.ok(!redirectUrl.includes("must-not-leak"));
});

test("migrates legacy Google provider record from Cognito sub to Google userId upon fallback match", async () => {
  let updatedUserId = null;
  let updatedPayload = null;

  const legacyUser = {
    userId: "user-legacy-123",
    email: "legacy@example.com",
    authProviders: [
      { type: "google", providerId: "old-cognito-sub-111", linkedAt: "2026-01-01" },
    ],
  };

  const repository = makeRepository({
    findByProviderIdentity: async (provider, id) => {
      // Primary lookup (google + google-numeric-id) misses
      if (provider === "google" && id === "google-numeric-id-222") {
        return null;
      }
      // Legacy fallback (google + old-cognito-sub-111) matches
      if (provider === "google" && id === "old-cognito-sub-111") {
        return legacyUser;
      }
      return null;
    },
    findById: async (id) => {
      if (id === "user-legacy-123") {
        return {
          ...legacyUser,
          authProviders: [
            { type: "google", providerId: "google-numeric-id-222", linkedAt: "2026-01-01" },
          ],
        };
      }
      return null;
    },
    update: async (userId, updates) => {
      updatedUserId = userId;
      updatedPayload = updates;
      return true;
    },
    updateOnLogin: async () => true,
  });

  const service = new UsersService(repository);
  const resolved = await service.resolveAuthenticatedUser(
    {
      provider: "google",
      providerUserId: "google-numeric-id-222",
      cognitoSub: "old-cognito-sub-111",
      email: "legacy@example.com",
      emailVerified: true,
    },
    { name: "Legacy User" },
    { recordLogin: true }
  );

  assert.equal(updatedUserId, "user-legacy-123");
  assert.deepEqual(updatedPayload.authProviders, [
    { type: "google", providerId: "google-numeric-id-222", linkedAt: "2026-01-01" },
  ]);
  assert.equal(resolved.userId, "user-legacy-123");
});

test("resolveAuthenticatedUser throws LoginMethodConflictError for a genuine different-provider conflict", async () => {
  // An existing email/password (cognito-native) user tries to sign in with Google.
  // The Google sub does NOT match any existing provider record.
  // Should throw LoginMethodConflictError — not IdentityLinkingRequiredError.
  const existingNativeUser = {
    userId: "native-user-1",
    email: "shared@example.com",
    authProviders: [
      { type: "cognito", providerId: "native-sub-abc", linkedAt: "2026-01-01" },
    ],
  };

  const repository = makeRepository({
    findByProviderIdentity: async () => null, // Google ID not found anywhere
    findByEmail: async () => existingNativeUser,
    findById: async () => existingNativeUser,
    update: async () => null,
  });

  const service = new UsersService(repository);

  await assert.rejects(
    service.resolveAuthenticatedUser(
      {
        provider: "google",
        providerUserId: "google-sub-brand-new",
        email: "shared@example.com",
        emailVerified: true,
      },
      { name: "Google User" },
    ),
    (err) => {
      // Must be LoginMethodConflictError, not the old IdentityLinkingRequiredError
      assert.ok(
        err instanceof LoginMethodConflictError,
        `Expected LoginMethodConflictError, got ${err.constructor.name}`,
      );
      assert.equal(err.code, "LOGIN_METHOD_CONFLICT");
      // Must not leak user identity data
      assert.equal(err.existingUserId, undefined);
      assert.equal(err.identity, undefined);
      return true;
    },
  );
});

test("Checkpoint 2H - Linked password login preserves canonical user name, givenName, and familyName", async () => {
  const existingCanonicalUser = {
    userId: "kindcrew-canonical-user-88",
    email: "not.vedrathavi@gmail.com",
    name: "Ved Rathavi",
    givenName: "Ved",
    familyName: "Rathavi",
    profileImage: "https://avatar.google.com/ved",
    authProviders: [
      { type: "google", providerId: "101234567890", linkedAt: "2026-01-01" },
      { type: "cognito", providerId: "native-sub-88", linkedAt: "2026-01-02" },
    ],
  };

  let updateOnLoginCalledWith = null;

  const repository = makeRepository({
    findByProviderIdentity: async (provider, providerUserId) => {
      if (provider === "cognito" && providerUserId === "native-sub-88") {
        return existingCanonicalUser;
      }
      return null;
    },
    findById: async (userId) => {
      if (userId === "kindcrew-canonical-user-88") {
        return {
          ...existingCanonicalUser,
          ...(updateOnLoginCalledWith || {}),
        };
      }
      return null;
    },
    updateOnLogin: async (userId, updates) => {
      updateOnLoginCalledWith = updates;
      return { ...existingCanonicalUser, ...updates };
    },
  });

  const service = new UsersService(repository);

  // Incoming native Cognito password login claims (which lack given_name / family_name and have name fallback to email)
  const incomingCognitoIdentity = {
    provider: "cognito",
    providerUserId: "native-sub-88",
    email: "not.vedrathavi@gmail.com",
    emailVerified: true,
  };

  const incomingUserData = {
    name: "not.vedrathavi",
    givenName: null,
    familyName: null,
    profileImage: null,
    locale: null,
  };

  const resolved = await service.resolveAuthenticatedUser(
    incomingCognitoIdentity,
    incomingUserData,
    { recordLogin: true },
  );

  // Must resolve to the exact same canonical User.userId
  assert.equal(resolved.userId, "kindcrew-canonical-user-88");

  // Must preserve real canonical name, givenName, and familyName (NOT overwritten by email fallback "not.vedrathavi")
  assert.equal(resolved.name, "Ved Rathavi");
  assert.equal(resolved.givenName, "Ved");
  assert.equal(resolved.familyName, "Rathavi");
  assert.equal(resolved.profileImage, "https://avatar.google.com/ved");

  // Verify what was sent to updateOnLogin did NOT overwrite with null
  assert.equal(updateOnLoginCalledWith.name, "Ved Rathavi");
  assert.equal(updateOnLoginCalledWith.givenName, "Ved");
  assert.equal(updateOnLoginCalledWith.familyName, "Rathavi");
  assert.equal(updateOnLoginCalledWith.profileImage, "https://avatar.google.com/ved");
});

test("Checkpoint 2H - Both Google and Password logins for linked account return identical userId and name attributes", async () => {
  const linkedUser = {
    userId: "kindcrew-dual-user-99",
    email: "creator@example.com",
    name: "Alex Morgan",
    givenName: "Alex",
    familyName: "Morgan",
    profileImage: "https://avatar.example.com/alex",
    authProviders: [
      { type: "google", providerId: "google-alex-1", linkedAt: "2026-01-01" },
      { type: "cognito", providerId: "cognito-alex-1", linkedAt: "2026-01-02" },
    ],
  };

  const repository = makeRepository({
    findByProviderIdentity: async (provider, providerUserId) => {
      if (
        (provider === "google" && providerUserId === "google-alex-1") ||
        (provider === "cognito" && providerUserId === "cognito-alex-1")
      ) {
        return linkedUser;
      }
      return null;
    },
    findById: async () => linkedUser,
    updateOnLogin: async () => linkedUser,
  });

  const service = new UsersService(repository);

  // Login 1: Via Google
  const googleResolved = await service.resolveAuthenticatedUser(
    { provider: "google", providerUserId: "google-alex-1", email: "creator@example.com", emailVerified: true },
    { name: "Alex Morgan", givenName: "Alex", familyName: "Morgan" },
    { recordLogin: true },
  );

  // Login 2: Via Password
  const passwordResolved = await service.resolveAuthenticatedUser(
    { provider: "cognito", providerUserId: "cognito-alex-1", email: "creator@example.com", emailVerified: true },
    { name: "creator", givenName: null, familyName: null },
    { recordLogin: true },
  );

  // Identical identity invariants
  assert.equal(googleResolved.userId, passwordResolved.userId);
  assert.equal(googleResolved.name, passwordResolved.name);
  assert.equal(googleResolved.givenName, passwordResolved.givenName);
  assert.equal(googleResolved.familyName, passwordResolved.familyName);
  assert.equal(googleResolved.profileImage, passwordResolved.profileImage);
});
