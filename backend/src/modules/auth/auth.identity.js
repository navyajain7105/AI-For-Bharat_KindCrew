import { normalizeProviderIdentity } from "../users/userIdentity.js";

export function getAuthenticatedIdentity(cognitoUser) {
  return normalizeProviderIdentity({
    provider: cognitoUser?.identityProvider || "cognito",
    providerUserId: cognitoUser?.cognitoId,
    email: cognitoUser?.email,
    emailVerified: cognitoUser?.emailVerified,
  });
}

export function getVerifiedCognitoIdentity(claims) {
  const googleIdentity = Array.isArray(claims?.identities)
    ? claims.identities.find((identity) => identity.providerType === "Google")
    : null;
  const identity = {
    provider: googleIdentity ? "google" : "cognito",
    providerUserId: claims?.sub,
    tokenType: claims?.token_use,
  };

  if (typeof claims?.email === "string") {
    identity.email = claims.email.trim().toLowerCase();
  }
  if (typeof claims?.email_verified === "boolean") {
    identity.emailVerified = claims.email_verified;
  }

  return identity;
}
