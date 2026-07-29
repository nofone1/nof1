/**
 * Authentication service helpers.
 */

import * as SecureStore from "expo-secure-store";
import { logger } from "@/services/logging";

/**
 * Clerk token cache backed by secure storage.
 */
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore secure store write failures
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore secure store delete failures
    }
  },
};

export interface AuthResult {
  success: boolean;
  error?: string;
}

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
    if (message.includes("invalid credentials") || message.includes("identifier")) {
      return "Invalid email or password.";
    }
    if (message.includes("network")) {
      return "Network error. Please check your connection.";
    }

    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

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
