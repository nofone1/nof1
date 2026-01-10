/**
 * Application entry point.
 * Sets up providers, navigation, and global styles.
 *
 * @module App
 */

import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "@/providers/providers";
import { RootNavigator } from "@/navigation";
import { logger } from "@/services/logging";


/**
 * Root application component.
 * Initializes the app with all necessary providers and navigation.
 *
 * @returns The root application element
 *
 * @remarks
 * App initialization order:
 * 1. Load global styles (NativeWind)
 * 2. Initialize logging
 * 3. Mount providers (SafeArea, Clerk)
 * 4. Mount navigation
 *
 * @example
 * ```tsx
 * // This is the entry point registered in app.json
 * export default App;
 * ```
 */
export default function App(): React.JSX.Element {
  /**
   * Initialize app on mount.
   */
  useEffect(() => {
    logger.info("App started", {
      extra: {
        version: "1.0.0",
        environment: __DEV__ ? "development" : "production",
      },
    });

    // Cleanup on unmount
    return () => {
      logger.flush();
    };
  }, []);

  return (
    <AppProviders>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProviders>
  );
}
