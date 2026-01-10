/**
 * App providers wrapper.
 * Sets up all context providers required by the application.
 */

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/services/auth";
import { logger } from "@/services/logging";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * App providers component.
 * Wraps the application with all necessary context providers.
 */
export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  React.useEffect(() => {
    logger.info("App providers initialized");
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
