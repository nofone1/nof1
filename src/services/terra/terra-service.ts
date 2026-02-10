/**
 * Terra health data service.
 * Wraps the terra-react SDK for connecting to Apple Health / Google Fit.
 *
 * Note: The API key is for server-side only.
 * The mobile SDK uses the dev-id for client-side initialization.
 */

import { Platform } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-var-requires
let TerraModule: any = null;

try {
  TerraModule = require("terra-react").default;
} catch {
  // Terra native module not available (e.g., in Expo Go)
}

export interface TerraActivityData {
  steps?: number;
  calories?: number;
  activeMinutes?: number;
  distance?: number;
  heartRateAvg?: number;
  heartRateResting?: number;
}

export interface TerraSleepData {
  totalSleepMinutes?: number;
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  lightSleepMinutes?: number;
  hrv?: number;
  sleepScore?: number;
}

export interface TerraBodyData {
  weight?: number;
  bodyFat?: number;
  bmi?: number;
}

const TERRA_DEV_ID = "nof1-app";

let isInitialized = false;

/**
 * Initialize the Terra SDK.
 */
export async function initTerra(): Promise<boolean> {
  if (!TerraModule) return false;
  try {
    await TerraModule.initTerra(TERRA_DEV_ID, null);
    isInitialized = true;
    return true;
  } catch {
    return false;
  }
}

/**
 * Connect to Apple Health (iOS only).
 */
export async function connectAppleHealth(): Promise<boolean> {
  if (Platform.OS !== "ios" || !TerraModule) return false;
  try {
    const result = await TerraModule.initConnection("APPLE_HEALTH", TERRA_DEV_ID, true);
    return !!result;
  } catch {
    return false;
  }
}

/**
 * Connect to Google Fit (Android only).
 */
export async function connectGoogleFit(): Promise<boolean> {
  if (Platform.OS !== "android" || !TerraModule) return false;
  try {
    const result = await TerraModule.initConnection("GOOGLE_FIT", TERRA_DEV_ID, true);
    return !!result;
  } catch {
    return false;
  }
}

/**
 * Connect to Oura Ring (cross-platform via OAuth).
 */
export async function connectOura(): Promise<boolean> {
  if (!TerraModule) return false;
  try {
    const result = await TerraModule.initConnection("OURA", TERRA_DEV_ID, true);
    return !!result;
  } catch {
    return false;
  }
}

function getConnectionType(): string {
  return Platform.OS === "ios" ? "APPLE_HEALTH" : "GOOGLE_FIT";
}

/**
 * Get activity data for a date range.
 */
export async function getActivity(
  startDate: Date,
  endDate: Date,
  connectionType?: string,
): Promise<TerraActivityData | null> {
  if (!TerraModule) return null;
  try {
    const data = await TerraModule.getActivity(connectionType ?? getConnectionType(), startDate, endDate);
    const entry = data?.data?.[0] as any;
    if (!entry) return null;
    return {
      steps: entry.distance_data?.steps,
      calories: entry.calories_data?.total_burned_calories,
      activeMinutes: entry.active_durations_data?.activity_seconds
        ? Math.round(entry.active_durations_data.activity_seconds / 60)
        : undefined,
      heartRateAvg: entry.heart_rate_data?.summary?.avg_hr_bpm,
      heartRateResting: entry.heart_rate_data?.summary?.resting_hr_bpm,
    };
  } catch {
    return null;
  }
}

/**
 * Get sleep data for a date range.
 */
export async function getSleep(
  startDate: Date,
  endDate: Date,
  connectionType?: string,
): Promise<TerraSleepData | null> {
  if (!TerraModule) return null;
  try {
    const data = await TerraModule.getSleep(connectionType ?? getConnectionType(), startDate, endDate);
    const entry = data?.data?.[0] as any;
    if (!entry) return null;
    return {
      totalSleepMinutes: entry.sleep_durations_data?.asleep?.duration_asleep_state_seconds
        ? Math.round(entry.sleep_durations_data.asleep.duration_asleep_state_seconds / 60)
        : undefined,
      hrv: entry.heart_rate_data?.summary?.avg_hrv_sdnn,
      sleepScore: entry.metadata?.overall_sleep_score,
    };
  } catch {
    return null;
  }
}

/**
 * Get body data for a date range.
 */
export async function getBody(
  startDate: Date,
  endDate: Date,
  connectionType?: string,
): Promise<TerraBodyData | null> {
  if (!TerraModule) return null;
  try {
    const data = await TerraModule.getBody(connectionType ?? getConnectionType(), startDate, endDate);
    const entry = data?.data?.[0] as any;
    if (!entry) return null;
    return {
      weight: entry.measurements_data?.weight_kg,
      bodyFat: entry.measurements_data?.body_fat_percentage,
      bmi: entry.measurements_data?.bmi,
    };
  } catch {
    return null;
  }
}

/**
 * Check if Terra is initialized and available.
 */
export function isTerraAvailable(): boolean {
  return isInitialized;
}
