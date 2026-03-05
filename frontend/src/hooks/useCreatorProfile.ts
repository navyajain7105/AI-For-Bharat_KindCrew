import { useAppStore } from "@/store/useAppStore";

export function useCreatorProfile() {
  const creatorProfile = useAppStore((state) => state.creatorProfile);
  const profileLoading = useAppStore((state) => state.profileLoading);
  const profileError = useAppStore((state) => state.profileError);
  const hasProfile = useAppStore((state) => state.hasProfile);
  const profileChecked = useAppStore((state) => state.profileChecked);
  const fetchProfile = useAppStore((state) => state.fetchProfile);
  const createProfile = useAppStore((state) => state.createProfile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return {
    creatorProfile,
    profileLoading,
    profileError,
    hasProfile,
    profileChecked,
    fetchProfile,
    createProfile,
    updateProfile,
    completeOnboarding,
  };
}
