/**
 * Environment configuration for the N-of-1 app.
 * All runtime flags and public keys should be read from this module.
 */

interface EnvironmentConfig {
  clerkPublishableKey: string;
  convexUrl: string;
  apiBaseUrl: string;
  isDevelopment: boolean;
  skipAuth: boolean;
}

const isDevelopment = __DEV__;
const requestedSkipAuth = process.env.EXPO_PUBLIC_SKIP_AUTH === "true";

export const env: EnvironmentConfig = {
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL || "",
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.nof1experiments.com",
  isDevelopment,
  skipAuth: isDevelopment && requestedSkipAuth,
};

export function validateEnvironment(): void {
  const missing: string[] = [];

  if (requestedSkipAuth && !env.skipAuth) {
    console.warn(
      "⚠️ EXPO_PUBLIC_SKIP_AUTH=true is ignored outside development builds."
    );
  }

  if (!env.clerkPublishableKey && !env.skipAuth) {
    missing.push("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
    console.warn(
      "⚠️ Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Authentication will fail."
    );
  }

  if (!env.convexUrl) {
    missing.push("EXPO_PUBLIC_CONVEX_URL");
    console.warn(
      "⚠️ Missing EXPO_PUBLIC_CONVEX_URL. Core data will not sync to Convex."
    );
  }

  if (!env.isDevelopment && missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }
}
