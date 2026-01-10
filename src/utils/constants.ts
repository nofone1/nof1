/**
 * Application-wide constants.
 * Centralizes magic numbers and strings for maintainability.
 */

/**
 * Async storage keys used throughout the app.
 */
export const STORAGE_KEYS = {
  /** Key for storing user experiments locally */
  EXPERIMENTS: "@nof1/experiments",
  /** Key for storing user preferences */
  PREFERENCES: "@nof1/preferences",
  /** Key for storing logs */
  LOGS: "@nof1/logs",
  /** Key for storing onboarding completion status */
  ONBOARDING_COMPLETE: "@nof1/onboarding_complete",
} as const;

/**
 * Default values for experiment configuration.
 */
export const EXPERIMENT_DEFAULTS = {
  /** Default phase duration in days */
  PHASE_DURATION_DAYS: 7,
  /** Default number of complete cycles */
  TOTAL_PHASES: 4,
  /** Default reminder time (24h format) */
  REMINDER_TIME: "09:00",
  /** Minimum phase duration in days */
  MIN_PHASE_DURATION: 1,
  /** Maximum phase duration in days */
  MAX_PHASE_DURATION: 30,
} as const;

/**
 * Scale rating configuration.
 */
export const SCALE_RATING = {
  /** Minimum value for scale ratings */
  MIN: 1,
  /** Maximum value for scale ratings */
  MAX: 10,
  /** Default value for scale ratings */
  DEFAULT: 5,
} as const;

/**
 * Animation durations in milliseconds.
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Common metric presets for experiments.
 * Users can select from these or create custom metrics.
 */
export const METRIC_PRESETS = [
  {
    name: "Energy Level",
    description: "Overall energy and alertness throughout the day",
    type: "scale" as const,
    minValue: 1,
    maxValue: 10,
  },
  {
    name: "Sleep Quality",
    description: "How well you slept the previous night",
    type: "scale" as const,
    minValue: 1,
    maxValue: 10,
  },
  {
    name: "Mood",
    description: "Overall emotional state and well-being",
    type: "scale" as const,
    minValue: 1,
    maxValue: 10,
  },
  {
    name: "Focus",
    description: "Ability to concentrate and stay on task",
    type: "scale" as const,
    minValue: 1,
    maxValue: 10,
  },
  {
    name: "Exercise Completed",
    description: "Whether you exercised today",
    type: "boolean" as const,
  },
  {
    name: "Hours of Sleep",
    description: "Total hours slept",
    type: "number" as const,
    minValue: 0,
    maxValue: 24,
    unit: "hours",
  },
] as const;

/**
 * Common intervention presets.
 */
export const INTERVENTION_PRESETS = [
  {
    name: "Creatine",
    type: "supplement" as const,
    dosage: "5g",
    frequency: "Once daily",
  },
  {
    name: "Vitamin D3",
    type: "supplement" as const,
    dosage: "5000 IU",
    frequency: "Once daily",
  },
  {
    name: "Omega-3 Fish Oil",
    type: "supplement" as const,
    dosage: "2g",
    frequency: "Once daily",
  },
  {
    name: "Magnesium Glycinate",
    type: "supplement" as const,
    dosage: "400mg",
    frequency: "Before bed",
  },
  {
    name: "BPC-157",
    type: "peptide" as const,
    dosage: "250mcg",
    frequency: "Twice daily",
  },
] as const;
