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
 * @property skipAuth - Whether to skip authentication and auto-login with test user
 */
interface EnvironmentConfig {
  clerkPublishableKey: string;
  isDevelopment: boolean;
  apiBaseUrl: string;
  skipAuth: boolean;
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

  /**
   * Skip authentication flag.
   * When true, auto-logs in with TEST_USER and bypasses login screens.
   * Set via EXPO_PUBLIC_SKIP_AUTH=true in build profile.
   */
  skipAuth: process.env.EXPO_PUBLIC_SKIP_AUTH === "true",
};

/**
 * Test user for skip-auth build variant (auto-login).
 * Used when skipAuth is enabled to automatically sign in.
 */
export const TEST_USER = {
  email: "anam@revyl.ai",
  password: "password123",
} as const;

/**
 * Mock credential for manual login testing.
 * Use this to sign in via the regular login flow.
 */
export const MOCK_CREDENTIAL = {
  email: "anam@revyl.ai",
  password: "test123",
} as const;

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
