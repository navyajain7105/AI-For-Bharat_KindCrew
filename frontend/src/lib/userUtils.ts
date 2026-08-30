export interface UserLike {
  name?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  email?: string | null;
}

/**
 * Deterministic display-name helper.
 * Fallback order:
 * 1. user.name (if not generic/email)
 * 2. user.givenName + " " + user.familyName
 * 3. user.givenName
 * 4. user.familyName
 * 5. user.email local-part
 * 6. "User"
 */
export function getDisplayName(user?: UserLike | null): string {
  if (!user) return "User";

  const trimmedName = typeof user.name === "string" ? user.name.trim() : "";
  if (trimmedName && trimmedName.toLowerCase() !== "user" && !trimmedName.includes("@")) {
    return trimmedName;
  }

  const given = typeof user.givenName === "string" ? user.givenName.trim() : "";
  const family = typeof user.familyName === "string" ? user.familyName.trim() : "";

  if (given && family) {
    return `${given} ${family}`;
  }
  if (given) return given;
  if (family) return family;

  if (trimmedName && trimmedName.toLowerCase() !== "user") {
    return trimmedName;
  }

  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (email && email.includes("@")) {
    const localPart = email.split("@")[0].trim();
    if (localPart) return localPart;
  }

  return "User";
}

/**
 * Returns a short first-name or greeting name for dashboard greetings.
 */
export function getGreetingName(user?: UserLike | null): string {
  if (!user) return "User";

  const given = typeof user.givenName === "string" ? user.givenName.trim() : "";
  if (given) {
    return given.split(" ")[0];
  }

  const displayName = getDisplayName(user);
  if (displayName && displayName !== "User") {
    return displayName.split(" ")[0];
  }

  return "User";
}
