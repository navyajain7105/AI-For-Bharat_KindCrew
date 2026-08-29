/**
 * Single in-memory store for the Cognito access token.
 *
 * The token lives exclusively in JavaScript memory — it is never written to
 * localStorage or any other persistent storage.
 *
 * apiClient.ts calls setAccessToken after a silent token refresh.
 * authSlice.ts calls syncTokenToStore (see useAppStore) to keep the Zustand
 * `token` field in sync after a refresh that apiClient triggered.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
