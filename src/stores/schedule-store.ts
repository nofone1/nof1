/**
 * Zustand store for managing scheduled doses and reminders.
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ScheduledDose, CreateScheduledDoseInput } from "@/types/schedule";
import { scheduleDoseReminder, cancelReminder } from "@/services/notifications";

const SCHEDULES_KEY = "@nof1/schedules";
const NOTIFICATION_IDS_KEY = "@nof1/notification_ids";

interface ScheduleState {
  schedules: ScheduledDose[];
  notificationIds: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

interface ScheduleActions {
  loadSchedules: () => Promise<void>;
  createSchedule: (input: CreateScheduledDoseInput) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
  clearError: () => void;
}

type ScheduleStore = ScheduleState & ScheduleActions;

async function persistSchedules(schedules: ScheduledDose[]): Promise<void> {
  await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

async function persistNotificationIds(ids: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules: [],
  notificationIds: {},
  isLoading: false,
  error: null,

  loadSchedules: async () => {
    set({ isLoading: true, error: null });
    try {
      const [schedulesData, idsData] = await Promise.all([
        AsyncStorage.getItem(SCHEDULES_KEY),
        AsyncStorage.getItem(NOTIFICATION_IDS_KEY),
      ]);

      const schedules = schedulesData ? (JSON.parse(schedulesData) as ScheduledDose[]) : [];
      const notificationIds = idsData ? (JSON.parse(idsData) as Record<string, string>) : {};
      set({ schedules, notificationIds, isLoading: false });
    } catch {
      set({ error: "Failed to load schedules", isLoading: false });
    }
  },

  createSchedule: async (input: CreateScheduledDoseInput) => {
    const original = get().schedules;
    const newSchedule: ScheduledDose = {
      ...input,
      id: `schedule-${Date.now()}`,
    };

    const updated = [...original, newSchedule];
    set({ schedules: updated });

    try {
      await persistSchedules(updated);

      // Schedule notification
      if (newSchedule.isEnabled) {
        const notifId = await scheduleDoseReminder(newSchedule);
        if (notifId) {
          const ids = { ...get().notificationIds, [newSchedule.id]: notifId };
          set({ notificationIds: ids });
          await persistNotificationIds(ids);
        }
      }
    } catch {
      set({ schedules: original, error: "Failed to create schedule" });
    }
  },

  deleteSchedule: async (id: string) => {
    const original = get().schedules;
    const updated = original.filter((s) => s.id !== id);
    set({ schedules: updated });

    try {
      await persistSchedules(updated);

      // Cancel notification
      const notifId = get().notificationIds[id];
      if (notifId) {
        await cancelReminder(notifId);
        const ids = { ...get().notificationIds };
        delete ids[id];
        set({ notificationIds: ids });
        await persistNotificationIds(ids);
      }
    } catch {
      set({ schedules: original, error: "Failed to delete schedule" });
    }
  },

  toggleSchedule: async (id: string) => {
    const original = get().schedules;
    const schedule = original.find((s) => s.id === id);
    if (!schedule) return;

    const updated = original.map((s) =>
      s.id === id ? { ...s, isEnabled: !s.isEnabled } : s,
    );
    set({ schedules: updated });

    try {
      await persistSchedules(updated);

      const notifId = get().notificationIds[id];
      if (schedule.isEnabled && notifId) {
        // Was enabled, now disabled - cancel
        await cancelReminder(notifId);
        const ids = { ...get().notificationIds };
        delete ids[id];
        set({ notificationIds: ids });
        await persistNotificationIds(ids);
      } else if (!schedule.isEnabled) {
        // Was disabled, now enabled - schedule
        const newNotifId = await scheduleDoseReminder({ ...schedule, isEnabled: true });
        if (newNotifId) {
          const ids = { ...get().notificationIds, [id]: newNotifId };
          set({ notificationIds: ids });
          await persistNotificationIds(ids);
        }
      }
    } catch {
      set({ schedules: original, error: "Failed to toggle schedule" });
    }
  },

  clearError: () => set({ error: null }),
}));
