import { normalizeProviderIdentity } from "../users/userIdentity.js";

export function getAuthenticatedIdentity(cognitoUser) {
  return normalizeProviderIdentity({
    provider: cognitoUser?.identityProvider || "cognito",
    providerUserId: cognitoUser?.cognitoId,
    email: cognitoUser?.email,
    emailVerified: cognitoUser?.emailVerified,
  });
}
