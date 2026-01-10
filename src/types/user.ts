/**
 * User-related types for the N-of-1 experiments app.
 * These types complement Clerk's user model with app-specific data.
 */

/**
 * Represents the user's subscription tier.
 */
export enum SubscriptionTier {
  /** Free tier with limited experiments */
  FREE = "free",
  /** Premium tier with unlimited experiments */
  PREMIUM = "premium",
}

/**
 * Represents user notification preferences.
 * @property dailyReminders - Whether to send daily logging reminders
 * @property experimentUpdates - Whether to send experiment milestone notifications
 * @property weeklyDigest - Whether to send weekly summary emails
 * @property reminderTime - Preferred time for daily reminders (HH:mm format)
 */
export interface NotificationPreferences {
  dailyReminders: boolean;
  experimentUpdates: boolean;
  weeklyDigest: boolean;
  reminderTime: string;
}

/**
 * Represents app-specific user profile data.
 * This extends Clerk's user data with N-of-1 specific fields.
 * @property id - Unique identifier (matches Clerk user ID)
 * @property email - User's email address
 * @property displayName - User's display name
 * @property avatarUrl - URL to user's profile image
 * @property subscription - User's current subscription tier
 * @property notificationPreferences - User's notification settings
 * @property experimentsCount - Total number of experiments created
 * @property createdAt - Timestamp when user profile was created
 * @property updatedAt - Timestamp when user profile was last modified
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  subscription: SubscriptionTier;
  notificationPreferences: NotificationPreferences;
  experimentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for updating user profile.
 * Only includes fields that users can modify.
 */
export type UpdateUserProfileInput = Pick<
  UserProfile,
  "displayName" | "notificationPreferences"
>;

/**
 * Represents the authentication state of the app.
 * @property isLoaded - Whether auth state has been loaded
 * @property isSignedIn - Whether user is currently signed in
 * @property userId - Current user's ID (null if not signed in)
 */
export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
}

/**
 * Default notification preferences for new users.
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  dailyReminders: true,
  experimentUpdates: true,
  weeklyDigest: false,
  reminderTime: "09:00",
};
