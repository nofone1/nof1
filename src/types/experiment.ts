/**
 * Core types for N-of-1 experiment functionality.
 * These types define the structure of experiments, interventions, metrics, and entries.
 */

/**
 * Represents the current status of an experiment.
 */
export enum ExperimentStatus {
  /** Experiment is being set up but not yet started */
  DRAFT = "draft",
  /** Experiment is currently running and collecting data */
  ACTIVE = "active",
  /** Experiment has been temporarily stopped */
  PAUSED = "paused",
  /** Experiment has finished its scheduled duration */
  COMPLETED = "completed",
  /** Experiment was cancelled before completion */
  CANCELLED = "cancelled",
}

/**
 * Represents the type of intervention being tested.
 */
export enum InterventionType {
  SUPPLEMENT = "supplement",
  PEPTIDE = "peptide",
  MEDICATION = "medication",
  LIFESTYLE = "lifestyle",
  DIET = "diet",
  OTHER = "other",
}

/**
 * Represents how a metric should be measured.
 */
export enum MetricType {
  /** Numeric scale (e.g., 1-10 rating) */
  SCALE = "scale",
  /** Yes/No boolean value */
  BOOLEAN = "boolean",
  /** Numeric measurement (e.g., hours of sleep) */
  NUMBER = "number",
  /** Free-form text notes */
  TEXT = "text",
}

/**
 * Represents the frequency of experiment phases.
 */
export enum PhaseFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
}

/**
 * Represents the intervention (treatment) being tested.
 * @property id - Unique identifier for the intervention
 * @property name - Display name (e.g., "Creatine Monohydrate")
 * @property type - Category of intervention
 * @property dosage - Amount to take (e.g., "5g")
 * @property frequency - How often to take it (e.g., "Once daily")
 * @property instructions - Additional notes for taking the intervention
 */
export interface Intervention {
  id: string;
  name: string;
  type: InterventionType;
  dosage: string;
  frequency: string;
  instructions?: string;
}

/**
 * Represents a metric to track during the experiment.
 * @property id - Unique identifier for the metric
 * @property name - Display name (e.g., "Energy Level")
 * @property description - Explanation of what to measure
 * @property type - How the metric is measured
 * @property minValue - Minimum value for scale/number types
 * @property maxValue - Maximum value for scale/number types
 * @property unit - Unit of measurement (e.g., "hours", "mg/dL")
 */
export interface Metric {
  id: string;
  name: string;
  description?: string;
  type: MetricType;
  minValue?: number;
  maxValue?: number;
  unit?: string;
}

/**
 * Represents the schedule configuration for an experiment.
 * @property startDate - When the experiment begins
 * @property endDate - When the experiment ends (optional, can be open-ended)
 * @property phaseDurationDays - Length of each on/off phase in days
 * @property totalPhases - Number of complete on/off cycles
 * @property reminderTime - Time of day for daily reminders (HH:mm format)
 */
export interface ExperimentSchedule {
  startDate: Date;
  endDate?: Date;
  phaseDurationDays: number;
  totalPhases: number;
  reminderTime?: string;
}

/**
 * Represents a single metric value recorded in an entry.
 * @property metricId - Reference to the metric being recorded
 * @property value - The recorded value (type depends on metric type)
 */
export interface MetricValue {
  metricId: string;
  value: number | boolean | string;
}

/**
 * Represents a daily log entry for an experiment.
 * @property id - Unique identifier for the entry
 * @property experimentId - Reference to the parent experiment
 * @property date - Date of the entry
 * @property isInterventionDay - Whether the intervention was taken that day
 * @property metricValues - Array of recorded metric values
 * @property notes - Optional free-form notes
 * @property createdAt - Timestamp when entry was created
 */
export interface ExperimentEntry {
  id: string;
  experimentId: string;
  date: Date;
  isInterventionDay: boolean;
  metricValues: MetricValue[];
  notes?: string;
  createdAt: Date;
}

/**
 * Represents a complete N-of-1 experiment.
 * @property id - Unique identifier for the experiment
 * @property userId - Reference to the user who created the experiment
 * @property name - Display name (e.g., "Testing Creatine for Energy")
 * @property hypothesis - What the user expects to observe
 * @property intervention - The treatment being tested
 * @property metrics - Array of metrics to track
 * @property schedule - Timing configuration for the experiment
 * @property status - Current status of the experiment
 * @property entries - Array of daily log entries
 * @property createdAt - Timestamp when experiment was created
 * @property updatedAt - Timestamp when experiment was last modified
 */
export interface Experiment {
  id: string;
  userId: string;
  name: string;
  hypothesis: string;
  intervention: Intervention;
  metrics: Metric[];
  schedule: ExperimentSchedule;
  status: ExperimentStatus;
  entries: ExperimentEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for creating a new experiment.
 * Omits auto-generated fields like id, entries, and timestamps.
 */
export type CreateExperimentInput = Omit<
  Experiment,
  "id" | "entries" | "createdAt" | "updatedAt"
>;

/**
 * Input type for updating an existing experiment.
 * All fields are optional except id.
 */
export type UpdateExperimentInput = Partial<Omit<Experiment, "id">> & {
  id: string;
};

/**
 * Input type for creating a new experiment entry.
 * Omits auto-generated fields like id and createdAt.
 */
export type CreateEntryInput = Omit<ExperimentEntry, "id" | "createdAt">;
