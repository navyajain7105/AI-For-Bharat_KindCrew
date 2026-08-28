import { buildApiUrl } from "./constants";
import { clearAccessToken, getAccessToken, setAccessToken } from "./authToken";
import { toast } from "sonner";

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(buildApiUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as {
          data?: { accessToken?: string };
        };
        const token = data.data?.accessToken || null;
        setAccessToken(token);
        return token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status !== 401 || String(input).includes("/api/auth/refresh")) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    clearAccessToken();
    if (typeof window !== "undefined") {
      toast.error("Your session has expired. Please sign in again.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
    return response;
  }

  headers.set("Authorization", `Bearer ${refreshedToken}`);
  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
