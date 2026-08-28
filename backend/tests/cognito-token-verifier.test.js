import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import jwt from "jsonwebtoken";
import { getVerifiedCognitoIdentity } from "../src/modules/auth/auth.identity.js";
import { createCognitoAuthMiddleware } from "../src/modules/auth/cognitoAuth.middleware.js";
import {
  CognitoTokenVerifier,
} from "../src/modules/auth/cognitoTokenVerifier.js";
import {
  IdentityLinkingRequiredError,
  UsersService,
} from "../src/modules/users/users.service.js";

const issuer = "https://cognito-idp.ap-south-1.amazonaws.com/pool-1";
const clientId = "client-1";
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const alternateKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });

function createToken(overrides = {}, key = privateKey, kid = "key-1") {
  const { tokenOptions = {}, ...payloadOverrides } = overrides;

  return jwt.sign(
    {
      sub: "cognito-sub-1",
      email: "person@example.com",
      email_verified: true,
      token_use: "access",
      client_id: clientId,
      iss: issuer,
      ...payloadOverrides,
    },
    key,
    {
      algorithm: "RS256",
      keyid: kid,
      expiresIn: tokenOptions.expiresIn || "10m",
    },
  );
}

function makeVerifier(keyMap = { "key-1": publicKey }) {
  const requestedKids = [];
  const keyClient = {
    getSigningKey: async (kid) => {
      requestedKids.push(kid);
      const key = keyMap[kid];
      if (!key) throw new Error("unknown key");
      return { getPublicKey: () => key };
    },
  };
  return {
    verifier: new CognitoTokenVerifier({ issuer, clientId, keyClient }),
    requestedKids,
  };
}

test("verifies a valid Cognito access token and selects its kid", async () => {
  const { verifier, requestedKids } = makeVerifier();
  const claims = await verifier.verify(createToken());

  assert.equal(claims.sub, "cognito-sub-1");
  assert.deepEqual(requestedKids, ["key-1"]);
});

test("rejects malformed, expired, wrong issuer, wrong key, and unsigned tokens", async () => {
  const { verifier } = makeVerifier({ "key-1": publicKey });

  await assert.rejects(verifier.verify("not-a-jwt"), /Malformed Cognito token/);
  await assert.rejects(
    verifier.verify(createToken({ tokenOptions: { expiresIn: -10 } })),
    /Invalid Cognito token/,
  );
  await assert.rejects(
    verifier.verify(createToken({ iss: `${issuer}-wrong` })),
    /Invalid Cognito token/,
  );
  await assert.rejects(
    verifier.verify(createToken({}, alternateKeys.privateKey)),
    /Invalid Cognito token/,
  );

  const unsigned = [
    Buffer.from(JSON.stringify({ alg: "none", typ: "JWT", kid: "key-1" })).toString("base64url"),
    Buffer.from(JSON.stringify({ sub: "cognito-sub-1" })).toString("base64url"),
    "",
  ].join(".");
  await assert.rejects(
    verifier.verify(unsigned),
    /invalid signing header/,
  );
});

test("rejects wrong token use, client, missing subject, and unknown kid", async () => {
  const { verifier } = makeVerifier();

  await assert.rejects(
    verifier.verify(createToken({ token_use: "id" })),
    /Invalid Cognito token use/,
  );
  await assert.rejects(
    verifier.verify(createToken({ client_id: "client-2" })),
    /Invalid Cognito application identifier/,
  );
  await assert.rejects(
    verifier.verify(createToken({ sub: undefined })),
    /missing sub/,
  );
  await assert.rejects(
    verifier.verify(createToken({}, privateKey, "rotated-key")),
    /signing key could not be resolved/,
  );
});

test("supports key rotation by resolving each token kid", async () => {
  const { verifier, requestedKids } = makeVerifier({
    "key-1": publicKey,
    "key-2": alternateKeys.publicKey,
  });

  await verifier.verify(createToken());
  await verifier.verify(createToken({}, alternateKeys.privateKey, "key-2"));

  assert.deepEqual(requestedKids, ["key-1", "key-2"]);
});

test("creates normalized identity only from verified claims", () => {
  assert.deepEqual(
    getVerifiedCognitoIdentity({
      sub: "cognito-sub-1",
      token_use: "access",
      email: " Person@Example.COM ",
      email_verified: true,
    }),
    {
      provider: "cognito",
      providerUserId: "cognito-sub-1",
      tokenType: "access",
      email: "person@example.com",
      emailVerified: true,
    },
  );

  assert.deepEqual(
    getVerifiedCognitoIdentity({ sub: "cognito-sub-2", token_use: "access" }),
    {
      provider: "cognito",
      providerUserId: "cognito-sub-2",
      tokenType: "access",
    },
  );
});

test("middleware attaches req.auth only after verifier success", async () => {
  let nextCalled = false;
  const middleware = createCognitoAuthMiddleware(async () => ({
    sub: "cognito-sub-1",
    token_use: "access",
    email: "person@example.com",
    email_verified: true,
  }));
  const req = { headers: { authorization: "Bearer verified-token" } };
  const res = {};

  await middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.auth, {
    provider: "cognito",
    providerUserId: "cognito-sub-1",
    tokenType: "access",
    email: "person@example.com",
    emailVerified: true,
  });
});

test("middleware rejects verifier failures without calling next", async () => {
  let nextCalled = false;
  let response;
  const middleware = createCognitoAuthMiddleware(async () => {
    throw new Error("Invalid Cognito token");
  });
  const req = { headers: { authorization: "Bearer invalid-token" } };
  const res = {
    status: (statusCode) => ({
      json: (body) => {
        response = { statusCode, body };
      },
    }),
  };

  await middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.deepEqual(response, {
    statusCode: 401,
    body: {
      success: false,
      message: "Unauthorized",
      error: "Invalid Cognito token",
      timestamp: response.body.timestamp,
    },
  });
  assert.equal(req.auth, undefined);
});

test("resolves a verified identity by provider identity and rejects same-email conflicts", async () => {
  const existingUser = {
    userId: "user-1",
    email: "person@example.com",
    authProviders: [{ type: "cognito", providerId: "cognito-sub-1" }],
  };
  const repository = {
    findByProviderIdentity: async () => existingUser,
    findByEmail: async () => null,
    create: async (user) => user,
  };
  const service = new UsersService(repository, () => "unused");

  assert.equal(
    await service.resolveAuthenticatedUser({
      provider: "cognito",
      providerUserId: "cognito-sub-1",
      email: "person@example.com",
      emailVerified: true,
    }),
    existingUser,
  );

  const conflictRepository = {
    ...repository,
    findByProviderIdentity: async () => null,
    findByEmail: async () => existingUser,
  };
  const conflictService = new UsersService(conflictRepository, () => "unused");

  await assert.rejects(
    conflictService.resolveAuthenticatedUser({
      provider: "google",
      providerUserId: "google-sub-1",
      email: "person@example.com",
      emailVerified: true,
    }),
    IdentityLinkingRequiredError,
  );
});
