import assert from "node:assert/strict";
import test from "node:test";
import { CognitoLinkingService } from "../src/modules/auth/cognitoLinking.service.js";

function createMockCognitoClient(overrides = {}) {
  const sentCommands = [];
  return {
    sentCommands,
    send: async (command) => {
      const commandName = command.constructor.name;
      sentCommands.push({ name: commandName, input: command.input });

      if (overrides[commandName]) {
        return overrides[commandName](command.input);
      }

      if (commandName === "AdminCreateUserCommand") {
        return { User: { Attributes: [{ Name: "sub", Value: "new-native-sub-123" }] } };
      }
      if (commandName === "AdminSetUserPasswordCommand") {
        return {};
      }
      if (commandName === "AdminDeleteUserCommand") {
        return {};
      }
      if (commandName === "AdminLinkProviderForUserCommand") {
        return {};
      }
      return {};
    },
  };
}

function createMockRepository(users = []) {
  const store = new Map(users.map((u) => [u.userId, { ...u }]));
  return {
    store,
    findById: async (userId) => store.get(userId) || null,
    findByProviderIdentity: async (provider, providerId) => {
      for (const u of store.values()) {
        const match = (u.authProviders || []).some(
          (p) => p.type === provider && (p.providerId || p.providerUserId) === providerId,
        );
        if (match) return u;
      }
      return null;
    },
    update: async (userId, updates) => {
      const existing = store.get(userId);
      if (!existing) throw new Error("User not found");
      const updated = { ...existing, ...updates };
      store.set(userId, updated);
      return updated;
    },
  };
}

function createMockUsersService(repository) {
  return {
    getUserById: (userId) => repository.findById(userId),
  };
}

test("Google -> Password: Full successful linking flow", async () => {
  const googleUser = {
    userId: "user-g-1",
    email: "guser@example.com",
    authProviders: [{ type: "google", providerId: "google-num-123", linkedAt: "2026-01-01" }],
  };

  const repository = createMockRepository([googleUser]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient();
  const linkingService = new CognitoLinkingService(repository, service);

  const result = await linkingService.linkGoogleToPassword("user-g-1", "ValidPassword123!", { cognitoClient });

  assert.equal(result.success, true);
  assert.equal(result.state, "COMPLETED");

  const updatedUser = await repository.findById("user-g-1");
  assert.equal(updatedUser.authProviders.length, 2);
  const cognitoP = updatedUser.authProviders.find((p) => p.type === "cognito");
  const googleP = updatedUser.authProviders.find((p) => p.type === "google");

  assert.equal(cognitoP.providerId, "new-native-sub-123");
  assert.equal(googleP.providerId, "google-num-123");

  const commandNames = cognitoClient.sentCommands.map((c) => c.name);
  assert.deepEqual(commandNames, [
    "AdminCreateUserCommand",
    "AdminSetUserPasswordCommand",
    "AdminDeleteUserCommand",
    "AdminLinkProviderForUserCommand",
  ]);
});

test("Google -> Password: Native creation failure aborts without changing DB", async () => {
  const googleUser = {
    userId: "user-g-2",
    email: "guser2@example.com",
    authProviders: [{ type: "google", providerId: "google-num-456" }],
  };

  const repository = createMockRepository([googleUser]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient({
    AdminCreateUserCommand: () => {
      throw new Error("AWS quota exceeded");
    },
  });
  const linkingService = new CognitoLinkingService(repository, service);

  await assert.rejects(
    linkingService.linkGoogleToPassword("user-g-2", "ValidPassword123!", { cognitoClient }),
    { message: "AWS quota exceeded" },
  );

  const user = await repository.findById("user-g-2");
  assert.equal(user.authProviders.length, 1);
  assert.equal(user.authProviders[0].type, "google");
});

test("Google -> Password: Password setting failure rolls back native user creation", async () => {
  const googleUser = {
    userId: "user-g-3",
    email: "guser3@example.com",
    authProviders: [{ type: "google", providerId: "google-num-789" }],
  };

  const repository = createMockRepository([googleUser]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient({
    AdminSetUserPasswordCommand: () => {
      throw new Error("Invalid password policy");
    },
  });
  const linkingService = new CognitoLinkingService(repository, service);

  await assert.rejects(
    linkingService.linkGoogleToPassword("user-g-3", "WeakPass", { cognitoClient }),
    { message: "Invalid password policy" },
  );

  const commandNames = cognitoClient.sentCommands.map((c) => c.name);
  assert.deepEqual(commandNames, [
    "AdminCreateUserCommand",
    "AdminSetUserPasswordCommand",
    "AdminDeleteUserCommand", // Rollback deletion of created native user
  ]);
});

test("Google -> Password: Provider linking failure returns recovery state instructing re-login", async () => {
  const googleUser = {
    userId: "user-g-4",
    email: "guser4@example.com",
    authProviders: [{ type: "google", providerId: "google-num-101" }],
  };

  const repository = createMockRepository([googleUser]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient({
    AdminLinkProviderForUserCommand: () => {
      throw new Error("Link target locked");
    },
  });
  const linkingService = new CognitoLinkingService(repository, service);

  const result = await linkingService.linkGoogleToPassword("user-g-4", "ValidPassword123!", { cognitoClient });

  assert.equal(result.success, true);
  assert.equal(result.requireReloginWithPassword, true);
  assert.equal(result.state, "FEDERATED_REMOVED");
  assert.ok(result.warning.includes("Email & Password credential created successfully"));
});

test("Password -> Google: Full successful linking flow", async () => {
  const passwordUser = {
    userId: "user-p-1",
    email: "puser1@example.com",
    authProviders: [{ type: "cognito", providerId: "native-sub-100" }],
  };

  const repository = createMockRepository([passwordUser]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient();
  const linkingService = new CognitoLinkingService(repository, service);

  const result = await linkingService.linkPasswordToGoogle("user-p-1", "google-id-555", { cognitoClient });

  assert.equal(result.success, true);
  assert.equal(result.state, "COMPLETED");

  const updatedUser = await repository.findById("user-p-1");
  assert.equal(updatedUser.authProviders.length, 2);
  const googleP = updatedUser.authProviders.find((p) => p.type === "google");
  assert.equal(googleP.providerId, "google-id-555");
});

test("Password -> Google: Rejects Google account owned by another KindCrew user", async () => {
  const userA = {
    userId: "user-a",
    email: "usera@example.com",
    authProviders: [{ type: "cognito", providerId: "native-sub-a" }],
  };
  const userB = {
    userId: "user-b",
    email: "userb@example.com",
    authProviders: [{ type: "google", providerId: "google-id-claimed" }],
  };

  const repository = createMockRepository([userA, userB]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient();
  const linkingService = new CognitoLinkingService(repository, service);

  await assert.rejects(
    linkingService.linkPasswordToGoogle("user-a", "google-id-claimed", { cognitoClient }),
    (err) => {
      assert.equal(err.code, "GOOGLE_ACCOUNT_CONFLICT");
      assert.equal(err.message.includes("already connected to another KindCrew user"), true);
      assert.equal(err.message.includes("user-b"), false); // Never leaks other user's ID
      return true;
    },
  );
});

test("Password -> Google: Idempotent when already linked to same user", async () => {
  const passwordUser = {
    userId: "user-p-already",
    email: "palready@example.com",
    authProviders: [
      { type: "cognito", providerId: "native-sub-already" },
      { type: "google", providerId: "google-id-already" },
    ],
  };

  const repository = createMockRepository([passwordUser]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient();
  const linkingService = new CognitoLinkingService(repository, service);

  const result = await linkingService.linkPasswordToGoogle("user-p-already", "google-id-already", { cognitoClient });

  assert.equal(result.success, true);
  assert.equal(result.alreadyLinked, true);
  assert.equal(cognitoClient.sentCommands.length, 0); // No AWS calls made
});

test("Google -> Password: Strips Google_ prefix from providerId and passes clean ID to Cognito", async () => {
  const googleUser = {
    userId: "user-g-prefixed",
    email: "prefixed@example.com",
    authProviders: [{ type: "google", providerId: "Google_109876543210" }],
  };

  const repository = createMockRepository([googleUser]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient();
  const linkingService = new CognitoLinkingService(repository, service);

  const result = await linkingService.linkGoogleToPassword("user-g-prefixed", "ValidPassword123!", { cognitoClient });

  assert.equal(result.success, true);
  assert.equal(result.state, "COMPLETED");

  const deleteCmd = cognitoClient.sentCommands.find((c) => c.name === "AdminDeleteUserCommand");
  assert.equal(deleteCmd.input.Username, "Google_109876543210");

  const linkCmd = cognitoClient.sentCommands.find((c) => c.name === "AdminLinkProviderForUserCommand");
  assert.equal(linkCmd.input.SourceUser.ProviderAttributeValue, "109876543210");
  assert.equal(linkCmd.input.DestinationUser.ProviderAttributeValue, "prefixed@example.com");
});

test("Google -> Password: Password complexity failure provides clear message and cleans up", async () => {
  const googleUser = {
    userId: "user-g-weakpass",
    email: "weakpass@example.com",
    authProviders: [{ type: "google", providerId: "12345" }],
  };

  const repository = createMockRepository([googleUser]);
  const service = createMockUsersService(repository);
  const cognitoClient = createMockCognitoClient({
    AdminSetUserPasswordCommand: () => {
      const err = new Error("Password does not conform to policy");
      err.name = "InvalidPasswordException";
      throw err;
    },
  });
  const linkingService = new CognitoLinkingService(repository, service);

  await assert.rejects(
    linkingService.linkGoogleToPassword("user-g-weakpass", "simplepass", { cognitoClient }),
    (err) => {
      assert.equal(
        err.message,
        "Password does not meet complexity requirements. Please include uppercase, lowercase, numbers, and symbols.",
      );
      return true;
    },
  );

  // Verify AdminDeleteUserCommand was called to clean up native profile
  const deleteCmd = cognitoClient.sentCommands.find((c) => c.name === "AdminDeleteUserCommand");
  assert.equal(deleteCmd.input.Username, "weakpass@example.com");
});
