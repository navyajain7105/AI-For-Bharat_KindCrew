import assert from "node:assert/strict";
import test from "node:test";
import { getProviders } from "../controllers/authController.js";
import userService from "../services/user.service.js";

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

// Mock User DB stores
const mockUsers = new Map();

// Save original getUserById
const originalGetUserById = userService.getUserById;

test("Checkpoint 2D - Auth Providers Tests Setup", () => {
  // Mock userService.getUserById
  userService.getUserById = async (userId) => {
    return mockUsers.get(userId) || null;
  };
});

test("Test 1: authenticated user with Google provider", async () => {
  mockUsers.set("user-google", {
    userId: "user-google",
    authProviders: [{ type: "google", providerId: "google-sub-123" }],
  });

  const req = { userId: "user-google" };
  const res = makeMockResponse();

  await getProviders(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.providers);

  const google = res.body.data.providers.find((p) => p.type === "google");
  const password = res.body.data.providers.find((p) => p.type === "password");

  assert.equal(google.connected, true);
  assert.equal(password.connected, false);
});

test("Test 2: authenticated user with password provider", async () => {
  mockUsers.set("user-password", {
    userId: "user-password",
    authProviders: [{ type: "cognito", providerId: "cognito-sub-123" }],
  });

  const req = { userId: "user-password" };
  const res = makeMockResponse();

  await getProviders(req, res);

  assert.equal(res.statusCode, 200);

  const google = res.body.data.providers.find((p) => p.type === "google");
  const password = res.body.data.providers.find((p) => p.type === "password");

  assert.equal(google.connected, false);
  assert.equal(password.connected, true);
});

test("Test 3: authenticated user with both providers", async () => {
  mockUsers.set("user-both", {
    userId: "user-both",
    authProviders: [
      { type: "google", providerId: "google-sub-123" },
      { type: "cognito", providerId: "cognito-sub-123" },
    ],
  });

  const req = { userId: "user-both" };
  const res = makeMockResponse();

  await getProviders(req, res);

  assert.equal(res.statusCode, 200);

  const google = res.body.data.providers.find((p) => p.type === "google");
  const password = res.body.data.providers.find((p) => p.type === "password");

  assert.equal(google.connected, true);
  assert.equal(password.connected, true);
});

test("Test 4: authenticated user with no provider metadata", async () => {
  mockUsers.set("user-none", {
    userId: "user-none",
    authProviders: [],
  });

  const req = { userId: "user-none" };
  const res = makeMockResponse();

  await getProviders(req, res);

  assert.equal(res.statusCode, 200);

  const google = res.body.data.providers.find((p) => p.type === "google");
  const password = res.body.data.providers.find((p) => p.type === "password");

  assert.equal(google.connected, false);
  assert.equal(password.connected, false);
});

test("Test 5: unauthenticated request -> 401", async () => {
  const req = { userId: null };
  const res = makeMockResponse();

  await getProviders(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Unauthorized");
});

test("Test 6: client cannot request another user's provider state (IDOR check)", async () => {
  mockUsers.set("user-target", {
    userId: "user-target",
    authProviders: [{ type: "google", providerId: "google-sub-123" }],
  });

  // Client attempts to pass a target user ID inside the body or query,
  // but backend must strictly use req.userId and ignore query/body userId.
  const req = {
    userId: "user-target",
    query: { userId: "user-other" },
    body: { userId: "user-other" },
  };
  const res = makeMockResponse();

  await getProviders(req, res);

  assert.equal(res.statusCode, 200);

  const google = res.body.data.providers.find((p) => p.type === "google");
  assert.equal(google.connected, true); // Still returns target user state (ignoring client requests)
});

test("Test 7: provider IDs (sub) are not exposed", async () => {
  mockUsers.set("user-check-leak", {
    userId: "user-check-leak",
    authProviders: [{ type: "google", providerId: "google-sub-sensitive-123" }],
  });

  const req = { userId: "user-check-leak" };
  const res = makeMockResponse();

  await getProviders(req, res);

  assert.equal(res.statusCode, 200);
  const jsonStr = JSON.stringify(res.body);
  assert.equal(jsonStr.includes("google-sub-sensitive-123"), false);
});

test("Test 8: tokens are not exposed", async () => {
  mockUsers.set("user-check-tokens", {
    userId: "user-check-tokens",
    authProviders: [{ type: "google", providerId: "google-sub-123" }],
    tokens: { access_token: "jwt-leak-token" },
  });

  const req = { userId: "user-check-tokens" };
  const res = makeMockResponse();

  await getProviders(req, res);

  assert.equal(res.statusCode, 200);
  const jsonStr = JSON.stringify(res.body);
  assert.equal(jsonStr.includes("jwt-leak-token"), false);
});

test("Checkpoint 2D - Auth Providers Tests Teardown", () => {
  // Restore original getUserById
  userService.getUserById = originalGetUserById;
});
