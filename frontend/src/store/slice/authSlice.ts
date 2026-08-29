import { StateCreator } from "zustand";
import { buildApiUrl, API_URL } from "@/lib/constants";
import { clearAccessToken, setAccessToken } from "@/lib/authToken";
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

  clearAuth: () => {
    clearAccessToken();
    set({
      token: null,
      userInfo: null,
      authReady: true,
      loading: false,
      error: null,
    });
  },

  initializeAuth: async () => {
    // Idempotent guard: prevent multiple parallel requests (e.g. React Strict Mode)
    if (get().authReady || get().loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch(buildApiUrl("/api/auth/session"), {
        credentials: "include",
      });

      if (!response.ok) {
        const wasSignedIn = !!get().userInfo;
        get().clearAuth();
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/" &&
          wasSignedIn
        ) {
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

      // Single atomic state update to transition authReady to true
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
      get().clearAuth();
      set({ error: message });
    }
  },

  logout: async () => {
    try {
      get().clearAuth();
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = buildApiUrl("/api/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      get().clearAuth();
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    }
  },

  isAuthenticated: () => !!get().token && !!get().userInfo,
});
