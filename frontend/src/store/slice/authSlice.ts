import { StateCreator } from "zustand";
import { buildApiUrl, API_URL } from "@/lib/constants";
import {
  clearAccessToken,
  setAccessToken,
} from "@/lib/authToken";
import { toast } from "sonner";

type UserInfo = {
  userId: string;
  email: string;
  name: string;
  givenName?: string | null;
  familyName?: string | null;
  profileImage?: string | null;
  role?: string;
};

export type AuthSlice = {
  userInfo: UserInfo | null;
  token: string | null;
  authReady: boolean;
  loading: boolean;
  error: string | null;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
  get,
) => ({
  userInfo: null,
  token: null,
  authReady: false,
  loading: false,
  error: null,

  clearAuth: () =>
    (() => {
      clearAccessToken();
      set({
        token: null,
        userInfo: null,
        authReady: true,
        loading: false,
        error: null,
      });
    })(),

  initializeAuth: async () => {
    const currentState = get();
    if (currentState.authReady) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch(buildApiUrl("/api/auth/session"), {
        credentials: "include",
      });
      if (!response.ok) {
        get().clearAuth();
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          toast.error("Your session has expired. Please sign in again.");
        }
        return;
      }

      const data = (await response.json()) as {
        data?: { accessToken?: string; user?: UserInfo };
      };
      const accessToken = data.data?.accessToken;
      const user = data.data?.user;
      if (!accessToken || !user) {
        get().clearAuth();
        return;
      }

      setAccessToken(accessToken);
      set({
        token: accessToken,
        userInfo: user,
        authReady: true,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ||
            "Failed to validate session"
          : "Failed to validate session";
      set({
        token: null,
        userInfo: null,
        authReady: true,
        loading: false,
        error: message,
      });
      clearAccessToken();
    }
  },

  logout: async () => {
    try {
      // Clear Zustand persisted state first
      get().clearAuth();

      // Clear all localStorage (in case of any residual data)
      localStorage.clear();

      // Call backend logout to destroy session and redirect to Cognito logout
      // This will clear Cognito session cookies and redirect back to login
      const logoutUrl = API_URL
        ? `${API_URL.replace(/\/$/, "")}/api/auth/logout`
        : "/api/auth/logout";
      window.location.href = logoutUrl;
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear local state and redirect manually
      get().clearAuth();
      localStorage.clear();
      window.location.href = "/";
    }
  },

  isAuthenticated: () => !!get().token && !!get().userInfo,
});
