import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthSlice, createAuthSlice } from "./slice/authSlice";

type AppState = AuthSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
    }),
    {
      name: "kindcrew-app-storage",
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
      }),
    },
  ),
);

export const useAuthStore = <T>(selector: (state: AppState) => T) =>
  useAppStore(selector);
