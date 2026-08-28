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

test("identity conflict returns a generic response without fallback identity data", () => {
  let response;
  const res = {
    status: (statusCode) => ({
      json: (body) => {
        response = { statusCode, body };
      },
    }),
  };

  assert.equal(
    handleIdentityLinkingRequired(res, {
      code: "IDENTITY_LINKING_REQUIRED",
      existingUserId: "must-not-leak",
      identity: { provider: "google", providerUserId: "must-not-leak" },
    }),
    true,
  );
  assert.deepEqual(response, {
    statusCode: 409,
    body: {
      success: false,
      code: "IDENTITY_LINKING_REQUIRED",
      message: "This email is already associated with another login method.",
    },
  });
  assert.equal(response.body.userId, undefined);
  assert.equal(response.body.token, undefined);
});
