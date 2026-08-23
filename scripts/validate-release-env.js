#!/usr/bin/env node

/** Fails an EAS production build before compilation when billing is unsafe. */

if (process.env.EAS_BUILD_PROFILE !== "production") {
  process.exit(0);
}

const required = [
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_CONVEX_URL",
  "EXPO_PUBLIC_WHOP_APP_ID",
];

const platform = process.env.EAS_BUILD_PLATFORM;
if (platform === "ios") {
  required.push("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY");
} else if (platform === "android") {
  required.push("EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY");
} else {
  required.push(
    "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY",
    "EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY"
  );
}

const failures = required
  .filter((name) => !process.env[name]?.trim())
  .map((name) => `${name} is missing`);

if (process.env.EXPO_PUBLIC_SKIP_AUTH === "true") {
  failures.push("EXPO_PUBLIC_SKIP_AUTH must not be true");
}

if (process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY?.trim()) {
  failures.push("EXPO_PUBLIC_REVENUECAT_TEST_API_KEY must be unset");
}

if (
  process.env.EXPO_PUBLIC_WHOP_OAUTH_BASE_URL?.includes("sandbox-api.whop.com")
) {
  failures.push("EXPO_PUBLIC_WHOP_OAUTH_BASE_URL must not use Whop sandbox");
}

if (failures.length > 0) {
  console.error("Production environment validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Production environment validation passed.");
