/**
 * Core types for daily tracking functionality.
 * These types define the structure for logging doses, metrics, and managing the user's stack.
 */

import { MetricType } from "./experiment";

/**
 * Represents a logged dose entry.
 * @property id - Unique identifier for the dose entry
 * @property peptideId - Reference to peptide from database (null for custom entries)
 * @property name - Display name of the peptide/supplement
 * @property dosage - Amount taken (e.g., "5mg", "250mcg")
 * @property timestamp - When the dose was taken
 * @property notes - Optional notes about this dose
 */
export interface DoseEntry {
  id: string;
  peptideId: string | null;
  name: string;
  dosage: string;
  timestamp: Date;
  notes?: string;
}

/**
 * Predefined metric types for quick logging.
 */
export enum QuickMetricType {
  /** Energy level (1-10 scale) */
  ENERGY = "energy",
  /** Mood rating (1-10 scale) */
  MOOD = "mood",
  /** Sleep quality (1-10 scale) */
  SLEEP = "sleep",
  /** Focus/concentration (1-10 scale) */
  FOCUS = "focus",
  /** Stress level (1-10 scale) */
  STRESS = "stress",
  /** Anxiety level (1-10 scale) */
  ANXIETY = "anxiety",
  /** Pain level (1-10 scale) */
  PAIN = "pain",
  /** Custom metric */
  CUSTOM = "custom",
}

/**
 * Display information for quick metric types.
 */
export const QUICK_METRIC_INFO: Record<QuickMetricType, { label: string; icon: string; lowLabel: string; highLabel: string }> = {
  [QuickMetricType.ENERGY]: { label: "Energy", icon: "zap", lowLabel: "Low", highLabel: "High" },
  [QuickMetricType.MOOD]: { label: "Mood", icon: "smile", lowLabel: "Poor", highLabel: "Great" },
  [QuickMetricType.SLEEP]: { label: "Sleep", icon: "moon", lowLabel: "Poor", highLabel: "Great" },
  [QuickMetricType.FOCUS]: { label: "Focus", icon: "target", lowLabel: "Scattered", highLabel: "Sharp" },
  [QuickMetricType.STRESS]: { label: "Stress", icon: "activity", lowLabel: "Calm", highLabel: "Stressed" },
  [QuickMetricType.ANXIETY]: { label: "Anxiety", icon: "heart", lowLabel: "Calm", highLabel: "Anxious" },
  [QuickMetricType.PAIN]: { label: "Pain", icon: "alert-circle", lowLabel: "None", highLabel: "Severe" },
  [QuickMetricType.CUSTOM]: { label: "Custom", icon: "edit-3", lowLabel: "Low", highLabel: "High" },
};

/**
 * Represents a logged metric entry.
 * @property id - Unique identifier for the metric entry
 * @property metricType - Type of metric being logged
 * @property customName - Name for custom metrics (when metricType is CUSTOM)
 * @property value - The recorded value (1-10 scale for most metrics)
 * @property timestamp - When the metric was recorded
 * @property notes - Optional notes about this entry
 */
export interface MetricEntry {
  id: string;
  metricType: QuickMetricType;
  customName?: string;
  value: number;
  timestamp: Date;
  notes?: string;
}

/**
 * Represents a peptide/supplement in the user's daily stack.
 * @property id - Unique identifier for the stack item
 * @property peptideId - Reference to peptide from database (null for custom)
 * @property name - Display name
 * @property dosage - Standard dose to take
 * @property frequency - How often to take (e.g., "Once daily", "Twice daily")
 * @property timeOfDay - Preferred time to take (e.g., "morning", "evening", "with meals")
 * @property isActive - Whether this item is currently being taken
 * @property addedAt - When this was added to the stack
 */
export interface StackItem {
  id: string;
  peptideId: string | null;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  isActive: boolean;
  addedAt: Date;
}

/**
 * Represents a daily log summary.
 * @property date - Date string in YYYY-MM-DD format
 * @property doses - Doses logged on this day
 * @property metrics - Metrics logged on this day
 */
export interface DailyLog {
  date: string;
  doses: DoseEntry[];
  metrics: MetricEntry[];
}

/**
 * Input type for creating a new dose entry.
 * Omits auto-generated fields.
 */
export type CreateDoseInput = Omit<DoseEntry, "id" | "timestamp"> & {
  timestamp?: Date;
};

/**
 * Input type for creating a new metric entry.
 * Omits auto-generated fields.
 */
export type CreateMetricInput = Omit<MetricEntry, "id" | "timestamp"> & {
  timestamp?: Date;
};

/**
 * Input type for adding an item to the stack.
 * Omits auto-generated fields.
 */
export type AddStackItemInput = Omit<StackItem, "id" | "addedAt" | "isActive">;

/**
 * Helper function to get today's date as YYYY-MM-DD string.
 * @returns Today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Helper function to format a date as YYYY-MM-DD string.
 * @param date - Date to format
 * @returns Date formatted as YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}
