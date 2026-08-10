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
/** True when EXPO_PUBLIC_SKIP_AUTH was present at Metro embed time. */
const requestedSkipAuth = process.env.EXPO_PUBLIC_SKIP_AUTH === "true";

/**
 * Resolved app environment.
 *
 * Release dogfood binaries previously crashed because skipAuth was gated on
 * __DEV__ and validateEnvironment threw on missing Clerk/Convex keys. This
 * dogfood branch forces skipAuth so Daily Log can render without production
 * keys, independent of whether the build runner inlines EXPO_PUBLIC_SKIP_AUTH.
 */
export const env: EnvironmentConfig = {
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL || "",
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.nof1experiments.com",
  isDevelopment,
  // Dogfood preview: always skip Clerk so Daily Log can render without keys.
  skipAuth: true,
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
