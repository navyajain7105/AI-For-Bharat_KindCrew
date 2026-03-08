import { StateCreator } from "zustand";
import {
  SchedulePayload,
  ScheduleRecord,
  scheduleContent as scheduleContentAPI,
  getSchedules as getSchedulesAPI,
  updateSchedule as updateScheduleAPI,
  postNow as postNowAPI,
} from "@/lib/api/publishing";

export type PublishingSlice = {
  schedules: ScheduleRecord[];
  schedulesLoading: boolean;
  schedulesError: string | null;

  fetchSchedules: (token: string) => Promise<void>;
  createSchedule: (
    token: string,
    payload: SchedulePayload,
  ) => Promise<ScheduleRecord>;
  updateSchedule: (
    token: string,
    id: string,
    updates: Partial<SchedulePayload>,
  ) => Promise<ScheduleRecord>;
  triggerPost: (token: string, id: string) => Promise<ScheduleRecord>;
};

export const createPublishingSlice: StateCreator<
  PublishingSlice,
  [],
  [],
  PublishingSlice
> = (set, get) => ({
  schedules: [],
  schedulesLoading: false,
  schedulesError: null,

  fetchSchedules: async (token: string) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      const items = await getSchedulesAPI(token);
      set({ schedules: items, schedulesLoading: false });
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message || "Failed to fetch schedules"
          : "Failed to fetch schedules";
      set({ schedulesLoading: false, schedulesError: message });
    }
  },

  createSchedule: async (token: string, payload: SchedulePayload) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      const sched = await scheduleContentAPI(token, payload);
      set((state) => ({ schedules: [...state.schedules, sched], schedulesLoading: false }));
      return sched;
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message || "Failed to create schedule"
          : "Failed to create schedule";
      set({ schedulesLoading: false, schedulesError: message });
      throw err;
    }
  },

  updateSchedule: async (
    token: string,
    id: string,
    updates: Partial<SchedulePayload>,
  ) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      const updated = await updateScheduleAPI(token, id, updates);
      set((state) => ({
        schedules: state.schedules.map((s) => (s.scheduleId === id ? updated : s)),
        schedulesLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message || "Failed to update schedule"
          : "Failed to update schedule";
      set({ schedulesLoading: false, schedulesError: message });
      throw err;
    }
  },

  triggerPost: async (token: string, id: string) => {
    set({ schedulesLoading: true, schedulesError: null });
    try {
      const result = await postNowAPI(token, id);
      set((state) => ({
        schedules: state.schedules.map((s) => (s.scheduleId === id ? result : s)),
        schedulesLoading: false,
      }));
      return result;
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message || "Failed to post now"
          : "Failed to post now";
      set({ schedulesLoading: false, schedulesError: message });
      throw err;
    }
  },
});
