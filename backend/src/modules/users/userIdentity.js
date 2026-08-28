export function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

export function normalizeProviderIdentity({
  provider,
  providerUserId,
  email,
  emailVerified = false,
}) {
  const normalizedProvider = typeof provider === "string" ? provider.trim() : "";
  const normalizedProviderUserId =
    typeof providerUserId === "string" ? providerUserId.trim() : "";

  if (!normalizedProvider || !normalizedProviderUserId) {
    throw new Error("provider and providerUserId are required");
  }

  return {
    provider: normalizedProvider,
    providerUserId: normalizedProviderUserId,
    email: normalizeEmail(email),
    emailVerified: Boolean(emailVerified),
  };
}

export function getStoredProviderUserId(providerIdentity) {
  return (
    providerIdentity?.providerId || providerIdentity?.providerUserId || null
  );
}

export function hasMatchingProviderIdentity(user, identity) {
  return (user?.authProviders || []).some(
    (providerIdentity) =>
      providerIdentity.type === identity.provider &&
      getStoredProviderUserId(providerIdentity) === identity.providerUserId,
  );
}

export function hasProviderType(user, provider) {
  return (user?.authProviders || []).some(
    (providerIdentity) => providerIdentity.type === provider,
  );
}
