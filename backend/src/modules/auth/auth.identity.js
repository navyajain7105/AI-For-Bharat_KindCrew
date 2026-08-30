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
    ? claims.identities.find(
        (identity) =>
          identity?.providerType?.toLowerCase() === "google" ||
          identity?.providerName?.toLowerCase() === "google",
      )
    : null;

  const isGoogle =
    !!googleIdentity ||
    (typeof claims?.["cognito:username"] === "string" &&
      claims["cognito:username"].startsWith("Google_")) ||
    (typeof claims?.username === "string" && claims.username.startsWith("Google_"));

  const extractedGoogleId = googleIdentity
    ? googleIdentity.userId
    : isGoogle
      ? (claims?.["cognito:username"] || claims?.username || "").replace(/^Google_/, "")
      : null;

  const identity = {
    provider: isGoogle ? "google" : "cognito",
    providerUserId: isGoogle && extractedGoogleId ? extractedGoogleId : claims?.sub,
    cognitoSub: claims?.sub,
    tokenType: claims?.token_use,
  };

  if (typeof claims?.email === "string") {
    identity.email = claims.email.trim().toLowerCase();
  }

  if (typeof claims?.email_verified === "boolean") {
    identity.emailVerified = claims.email_verified;
  } else if (claims?.email_verified === "true") {
    identity.emailVerified = true;
  } else if (isGoogle) {
    identity.emailVerified = true;
  }

  return identity;
}
