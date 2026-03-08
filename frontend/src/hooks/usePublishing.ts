import { useAppStore } from "@/store/useAppStore";

export function usePublishing() {
  const schedules = useAppStore((state) => state.schedules);
  const loading = useAppStore((state) => state.schedulesLoading);
  const error = useAppStore((state) => state.schedulesError);
  const fetchSchedules = useAppStore((state) => state.fetchSchedules);
  const createSchedule = useAppStore((state) => state.createSchedule);
  const updateSchedule = useAppStore((state) => state.updateSchedule);
  const triggerPost = useAppStore((state) => state.triggerPost);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    triggerPost,
  };
}
