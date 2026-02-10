/**
 * Zustand store for health data from wearable integrations.
 * Manages connection state and synced health metrics from Terra.
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  initTerra,
  connectAppleHealth,
  connectGoogleFit,
  connectOura,
  getActivity,
  getSleep,
  getBody,
  type TerraActivityData,
  type TerraSleepData,
  type TerraBodyData,
} from "@/services/terra/terra-service";

const HEALTH_STATE_KEY = "@nof1/health_state";

interface HealthState {
  isConnected: boolean;
  connectedProvider: "apple_health" | "google_fit" | "oura" | null;
  todayActivity: TerraActivityData | null;
  todaySleep: TerraSleepData | null;
  todayBody: TerraBodyData | null;
  lastSyncAt: Date | null;
  isLoading: boolean;
  error: string | null;
}

interface HealthActions {
  initialize: () => Promise<void>;
  connectProvider: (provider: "apple_health" | "google_fit" | "oura") => Promise<boolean>;
  disconnect: () => Promise<void>;
  syncData: () => Promise<void>;
  clearError: () => void;
}

type HealthStore = HealthState & HealthActions;

export const useHealthStore = create<HealthStore>((set, get) => ({
  isConnected: false,
  connectedProvider: null,
  todayActivity: null,
  todaySleep: null,
  todayBody: null,
  lastSyncAt: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      // Load saved state
      const saved = await AsyncStorage.getItem(HEALTH_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          isConnected: parsed.isConnected ?? false,
          connectedProvider: parsed.connectedProvider ?? null,
        });
      }

      // Initialize Terra SDK
      await initTerra();

      // Auto-sync if connected
      if (get().isConnected) {
        get().syncData();
      }
    } catch {
      // Silent fail on initialization
    }
  },

  connectProvider: async (provider) => {
    set({ isLoading: true, error: null });

    try {
      let success = false;

      if (provider === "apple_health") {
        success = await connectAppleHealth();
      } else if (provider === "google_fit") {
        success = await connectGoogleFit();
      } else if (provider === "oura") {
        success = await connectOura();
      }

      if (success) {
        set({ isConnected: true, connectedProvider: provider });
        await AsyncStorage.setItem(
          HEALTH_STATE_KEY,
          JSON.stringify({ isConnected: true, connectedProvider: provider }),
        );

        // Initial sync
        await get().syncData();
      } else {
        set({ error: "Failed to connect. Please check permissions." });
      }

      set({ isLoading: false });
      return success;
    } catch {
      set({ isLoading: false, error: "Connection failed" });
      return false;
    }
  },

  disconnect: async () => {
    set({
      isConnected: false,
      connectedProvider: null,
      todayActivity: null,
      todaySleep: null,
      todayBody: null,
      lastSyncAt: null,
    });
    await AsyncStorage.setItem(
      HEALTH_STATE_KEY,
      JSON.stringify({ isConnected: false, connectedProvider: null }),
    );
  },

  syncData: async () => {
    if (!get().isConnected) return;

    set({ isLoading: true });

    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const yesterday = new Date(startOfDay);
      yesterday.setDate(yesterday.getDate() - 1);

      const provider = get().connectedProvider;
      const connectionType =
        provider === "apple_health" ? "APPLE_HEALTH" :
        provider === "google_fit" ? "GOOGLE_FIT" :
        provider === "oura" ? "OURA" : undefined;

      const [activity, sleep, body] = await Promise.all([
        getActivity(startOfDay, now, connectionType),
        getSleep(yesterday, now, connectionType),
        getBody(startOfDay, now, connectionType),
      ]);

      set({
        todayActivity: activity,
        todaySleep: sleep,
        todayBody: body,
        lastSyncAt: new Date(),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: "Sync failed" });
    }
  },

  clearError: () => set({ error: null }),
}));
