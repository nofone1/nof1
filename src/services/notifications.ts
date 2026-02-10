/**
 * Notification service for scheduling dose reminders.
 * Uses expo-notifications for local push notifications.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { ScheduledDose } from "@/types/schedule";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions.
 * @returns Whether permissions were granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule a dose reminder notification.
 * @param dose - The scheduled dose to remind about
 * @returns The notification identifier, or null if scheduling failed
 */
export async function scheduleDoseReminder(
  dose: ScheduledDose,
): Promise<string | null> {
  if (!dose.isEnabled) return null;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    // Parse time (HH:MM format)
    const [hours, minutes] = dose.scheduledTime.split(":").map(Number);

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Dose Reminder",
        body: `Time to take ${dose.peptideName} (${dose.dosage})`,
        data: { scheduleId: dose.id, protocolId: dose.protocolId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    return identifier;
  } catch {
    return null;
  }
}

/**
 * Cancel a scheduled reminder.
 * @param notificationId - The notification identifier to cancel
 */
export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled reminders.
 */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications.
 */
export async function getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}
