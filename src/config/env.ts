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

/**
 * Resolved app environment.
 *
 * EXPO_PUBLIC_SKIP_AUTH is honored whenever it is baked into the JS bundle at
 * Metro embed time — including Release preview builds. Gating skipAuth on
 * __DEV__ made Release dogfood binaries crash: validateEnvironment threw on
 * missing Clerk/Convex keys, and ClerkProvider received a placeholder key.
 */
export const env: EnvironmentConfig = {
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL || "",
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.nof1experiments.com",
  isDevelopment,
  skipAuth: requestedSkipAuth,
};

/**
 * Warns about missing public env vars; throws only for real production builds.
 *
 * Params: none (reads module-level env).
 * Returns: void.
 * Throws: Error when production (non-skipAuth) builds are missing required keys.
 * Edge cases: skipAuth preview builds only warn so Daily Log can still render.
 */
export function validateEnvironment(): void {
  const missing: string[] = [];

  if (!env.clerkPublishableKey && !env.skipAuth) {
    missing.push("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
    console.warn(
      "⚠️ Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Authentication will fail."
    );
  }

  if (!env.convexUrl && !env.skipAuth) {
    missing.push("EXPO_PUBLIC_CONVEX_URL");
    console.warn(
      "⚠️ Missing EXPO_PUBLIC_CONVEX_URL. Core data will not sync to Convex."
    );
  }

  if (!env.isDevelopment && !env.skipAuth && missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }

  if (env.skipAuth) {
    console.warn(
      "⚠️ EXPO_PUBLIC_SKIP_AUTH=true: Clerk/Convex auth requirements are relaxed for this build."
    );
  }
}
