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
  /** RevenueCat public SDK key for iOS. Never a secret key. */
  revenueCatIosApiKey: string;
  /** RevenueCat public SDK key for Android. Never a secret key. */
  revenueCatAndroidApiKey: string;
  /**
   * RevenueCat Test Store key. When set it takes precedence over the store
   * keys so dogfood and E2E runs purchase without real store accounts.
   */
  revenueCatTestApiKey: string;
  /** Public Whop application ID used to start the OAuth flow. */
  whopAppId: string;
}

const isDevelopment = __DEV__;
/** True when EXPO_PUBLIC_SKIP_AUTH was present at Metro embed time. */
const requestedSkipAuth = process.env.EXPO_PUBLIC_SKIP_AUTH === "true";

/**
 * Resolved app environment.
 *
 * Release dogfood binaries previously crashed because skipAuth was gated on
 * __DEV__ and validateEnvironment threw on missing Clerk/Convex keys. Dogfood
 * builds instead bake EXPO_PUBLIC_SKIP_AUTH=true at Metro embed time so
 * ClerkProvider is omitted without keys. Sessions still start signed-out;
 * before_session + auth_bypass deep link signs in as the Test User (see
 * acceptRevylAuthBypass). Production/TestFlight builds omit the flag and
 * therefore always require Clerk.
 */
export const env: EnvironmentConfig = {
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL || "",
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.nof1experiments.com",
  isDevelopment,
  skipAuth: requestedSkipAuth,
  revenueCatIosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "",
  revenueCatAndroidApiKey:
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "",
  revenueCatTestApiKey: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY || "",
  whopAppId: process.env.EXPO_PUBLIC_WHOP_APP_ID || "",
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
