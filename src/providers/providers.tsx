/**
 * App providers wrapper.
 */

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { AuthProvider, tokenCache } from "@/services/auth";
import { env } from "@/config/env";
import { logger } from "@/services/logging";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in SafeArea and auth providers.
 *
 * Params:
 *   children: React tree to render inside the provider stack.
 *
 * Returns:
 *   Provider-wrapped children. When EXPO_PUBLIC_SKIP_AUTH is baked into the
 *   bundle (including Release preview builds), ClerkProvider is omitted so a
 *   placeholder publishable key cannot crash the tree before Daily Log renders.
 *
 * Edge cases:
 *   skipAuth is inlined at Metro bundle time and is stable for the process.
 */
export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  React.useEffect(() => {
    logger.info("App providers initialized", {
      extra: {
        clerkConfigured: Boolean(env.clerkPublishableKey),
        convexConfigured: Boolean(env.convexUrl),
        skipAuth: env.skipAuth,
      },
    });
  }, []);

  if (env.skipAuth) {
    return (
      <SafeAreaProvider>
        <AuthProvider>{children}</AuthProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider
        publishableKey={env.clerkPublishableKey || "pk_test_skip_auth"}
        tokenCache={tokenCache}
      >
        <AuthProvider>{children}</AuthProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
