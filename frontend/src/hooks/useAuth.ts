import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useAuth() {
  const userInfo = useAppStore((state) => state.userInfo);
  const token = useAppStore((state) => state.token);
  const authReady = useAppStore((state) => state.authReady);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const logout = useAppStore((state) => state.logout);

  // Stable callback that only updates reference when token or userInfo changes.
  const isAuthenticated = useCallback(
    () => !!token && !!userInfo,
    [token, userInfo],
  );

  return {
    userInfo,
    token,
    authReady,
    loading,
    error,
    initializeAuth,
    logout,
    isAuthenticated,
  };
}
