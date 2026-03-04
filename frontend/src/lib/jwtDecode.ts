/**
 * Simple JWT decoder - extracts payload without verification
 * (Token is trusted since it comes from backend OAuth flow)
 */
export function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT format");
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Extract user info from JWT payload
 */
export function extractUserFromToken(token: string): {
  userId: string;
  email: string;
  name: string;
  givenName?: string | null;
  familyName?: string | null;
} | null {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    userId: decoded.userId || "",
    email: decoded.email || "",
    name: decoded.name || decoded.email || "User",
    givenName: decoded.givenName || null,
    familyName: decoded.familyName || null,
  };
}
