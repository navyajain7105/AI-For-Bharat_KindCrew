import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const ACCEPTED_ALGORITHMS = ["RS256"];
const DEFAULT_TOKEN_USE = "access";

function getCognitoIssuer() {
  const configuredIssuer = process.env.COGNITO_ISSUER?.trim();
  if (configuredIssuer) return configuredIssuer.replace(/\/$/, "");

  const region = (
    process.env.COGNITO_REGION ||
    process.env.AWS_REGION ||
    ""
  ).trim();
  const userPoolId = process.env.COGNITO_USER_POOL_ID?.trim();

  if (!region || !userPoolId) {
    throw new Error(
      "Cognito verifier requires COGNITO_ISSUER or COGNITO_REGION and COGNITO_USER_POOL_ID",
    );
  }

  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

function getCognitoConfiguration() {
  const issuer = getCognitoIssuer();
  const clientId = process.env.COGNITO_CLIENT_ID?.trim();

  if (!clientId) {
    throw new Error("Cognito verifier requires COGNITO_CLIENT_ID");
  }

  return { issuer, clientId };
}

export class CognitoTokenVerifier {
  constructor({ issuer, clientId, expectedTokenUse = DEFAULT_TOKEN_USE, keyClient } = {}) {
    if (!issuer || !clientId) {
      throw new Error("Cognito verifier requires issuer and clientId");
    }

    if (!["access", "id"].includes(expectedTokenUse)) {
      throw new Error("Cognito verifier token use must be access or id");
    }

    this.issuer = issuer.replace(/\/$/, "");
    this.clientId = clientId;
    this.expectedTokenUse = expectedTokenUse;
    this.keyClient =
      keyClient ||
      jwksClient({
        jwksUri: `${this.issuer}/.well-known/jwks.json`,
        cache: true,
        cacheMaxEntries: 5,
        cacheMaxAge: 10 * 60 * 1000,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
      });
  }

  async verify(token, { expectedNonce } = {}) {
    if (typeof token !== "string" || !token.trim()) {
      throw new Error("Cognito token is required");
    }

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded !== "object") {
      throw new Error("Malformed Cognito token");
    }

    const header = decoded.header;
    if (
      !header ||
      header.alg !== "RS256" ||
      typeof header.kid !== "string" ||
      !header.kid
    ) {
      throw new Error("Cognito token has an invalid signing header");
    }

    let signingKey;
    try {
      signingKey = await this.keyClient.getSigningKey(header.kid);
    } catch (_error) {
      throw new Error("Cognito signing key could not be resolved");
    }

    const publicKey = signingKey?.getPublicKey?.();
    if (!publicKey) {
      throw new Error("Cognito signing key is invalid");
    }

    let claims;
    try {
      claims = jwt.verify(token, publicKey, {
        algorithms: ACCEPTED_ALGORITHMS,
        issuer: this.issuer,
      });
    } catch (_error) {
      throw new Error("Invalid Cognito token");
    }

    if (claims.token_use !== this.expectedTokenUse) {
      throw new Error("Invalid Cognito token use");
    }

    const clientClaim =
      this.expectedTokenUse === "access" ? claims.client_id : claims.aud;
    if (clientClaim !== this.clientId) {
      throw new Error("Invalid Cognito application identifier");
    }

    if (typeof claims.sub !== "string" || !claims.sub) {
      throw new Error("Cognito token is missing sub");
    }

    if (expectedNonce !== undefined && claims.nonce !== expectedNonce) {
      throw new Error("Invalid Cognito token nonce");
    }

    return claims;
  }
}

export function createCognitoTokenVerifier(options = {}) {
  const configuration = getCognitoConfiguration();
  return new CognitoTokenVerifier({ ...configuration, ...options });
}

let defaultVerifier;
let defaultIdTokenVerifier;

export async function verifyCognitoToken(token) {
  defaultVerifier ||= createCognitoTokenVerifier();
  return defaultVerifier.verify(token);
}

export async function verifyCognitoIdToken(token, expectedNonce) {
  defaultIdTokenVerifier ||= createCognitoTokenVerifier({
    expectedTokenUse: "id",
  });
  return defaultIdTokenVerifier.verify(token, { expectedNonce });
}

export { ACCEPTED_ALGORITHMS, getCognitoConfiguration };
