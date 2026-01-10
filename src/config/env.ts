/**
 * Environment configuration for the N-of-1 app.
 * Centralizes all environment variables and configuration.
 *
 * @important Add your Clerk publishable key to enable authentication.
 */

/**
 * Environment configuration interface.
 * @property clerkPublishableKey - Clerk public key for authentication
 * @property isDevelopment - Whether running in development mode
 * @property apiBaseUrl - Base URL for backend API (future use)
 */
interface EnvironmentConfig {
  clerkPublishableKey: string;
  isDevelopment: boolean;
  apiBaseUrl: string;
}

/**
 * Application environment configuration.
 * Values are loaded from environment variables or use defaults.
 *
 * @remarks
 * For Clerk setup:
 * 1. Create a Clerk account at https://clerk.com
 * 2. Create a new application
 * 3. Copy your publishable key
 * 4. Replace the placeholder below or set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
 *
 * @example
 * ```typescript
 * import { env } from '@/config/env';
 *
 * if (env.isDevelopment) {
 *   console.log('Running in development mode');
 * }
 * ```
 */
export const env: EnvironmentConfig = {
  /**
   * Clerk publishable key.
   * Replace with your actual key from Clerk dashboard.
   * Format: pk_test_* or pk_live_*
   */
  clerkPublishableKey:
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "pk_test_YOUR_CLERK_PUBLISHABLE_KEY",

  /**
   * Development mode flag.
   * Automatically set by React Native.
   */
  isDevelopment: __DEV__,

  /**
   * Backend API base URL.
   * Placeholder for future backend integration.
   */
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.nof1experiments.com",
};

/**
 * Validates that required environment variables are set.
 * Logs warnings in development if configuration is missing.
 */
export function validateEnvironment(): void {
  if (env.clerkPublishableKey.includes("YOUR_CLERK_PUBLISHABLE_KEY")) {
    console.warn(
      "⚠️ Clerk publishable key not configured. " +
        "Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your environment."
    );
  }
}
