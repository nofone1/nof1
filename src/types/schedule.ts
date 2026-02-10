/**
 * Types for the schedule and reminders system.
 */

/**
 * Represents a scheduled dose reminder.
 */
export interface ScheduledDose {
  id: string;
  protocolId?: string;
  peptideName: string;
  dosage: string;
  scheduledTime: string;
  daysOfWeek: number[];
  isEnabled: boolean;
}

/**
 * Input for creating a scheduled dose.
 */
export type CreateScheduledDoseInput = Omit<ScheduledDose, "id">;
