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
