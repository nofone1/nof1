/**
 * Authentication service helpers.
 * Provides utility functions for common auth operations.
 */

import { logger } from "@/services/logging";

/**
 * Token cache placeholder.
 * Replace with expo-secure-store when adding Clerk.
 */
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    return null;
  },
  async saveToken(key: string, value: string): Promise<void> {
    // Placeholder
  },
  async clearToken(key: string): Promise<void> {
    // Placeholder
  },
};

/**
 * Result type for authentication operations.
 */
export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Handles authentication errors and returns a user-friendly message.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("invalid email")) {
      return "Please enter a valid email address.";
    }
    if (message.includes("password")) {
      return "Password must be at least 6 characters.";
    }
    if (message.includes("already exists") || message.includes("taken")) {
      return "An account with this email already exists.";
    }
    if (message.includes("invalid credentials")) {
      return "Invalid email or password.";
    }
    if (message.includes("network")) {
      return "Network error. Please check your connection.";
    }

    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Logs an authentication event for observability.
 */
export function logAuthEvent(
  event: "sign_in" | "sign_up" | "sign_out" | "session_refresh",
  userId?: string,
  success = true
): void {
  logger.info(`Auth event: ${event}`, {
    userId,
    extra: { event, success },
  });
}
