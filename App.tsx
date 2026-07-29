/**
 * Application entry point.
 * Sets up providers, navigation, and global styles.
 */

import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "@/providers/providers";
import { RootNavigator } from "@/navigation";
import { logger } from "@/services/logging";
import { validateEnvironment } from "@/config/env";

export default function App(): React.JSX.Element {
  useEffect(() => {
    validateEnvironment();

    logger.info("App started", {
      extra: {
        version: "1.0.0",
        environment: __DEV__ ? "development" : "production",
      },
    });

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
