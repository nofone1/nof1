/**
 * Revyl auth-bypass deep-link handler for dogfood preview sessions.
 *
 * before_session mints REVYL_AUTH_BYPASS_* launch vars; auth_bypass.deep_link
 * opens nof1://revyl-auth?... after install. This provider validates that
 * round trip and signs the local skip-auth session in as the Test User.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import LaunchArgsModule from "../../../modules/LaunchArgsModule";
import { logger } from "@/services/logging";
import { acceptRevylAuthBypass } from "./auth-context";

type AuthBypassStatus = {
  state: "idle" | "accepted" | "rejected";
  message: string;
};

type LaunchConfig = {
  ready: boolean;
  enabled: boolean;
  expectedToken: string | null;
};

const allowedRoles = new Set(["tester", "collector", "support"]);

/**
 * Parses iOS/Android launch argument arrays into a key/value map.
 *
 * Params:
 *   args: Process launch arguments from LaunchArgsModule.
 *
 * Returns:
 *   Normalized launch-variable map (keys without leading dashes).
 */
function parseLaunchArgs(args: string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key.startsWith("-")) {
      continue;
    }
    const normalizedKey = key.replace(/^-+/, "");
    const equalsIndex = normalizedKey.indexOf("=");
    if (equalsIndex > 0) {
      values[normalizedKey.slice(0, equalsIndex)] = normalizedKey.slice(
        equalsIndex + 1
      );
      continue;
    }
    const value = args[i + 1];
    if (value == null || value.startsWith("-")) {
      values[normalizedKey] = "true";
      continue;
    }
    values[normalizedKey] = value;
    i += 1;
  }
  return values;
}

/**
 * Loads auth-bypass launch config from native launch arguments.
 *
 * Returns:
 *   Whether bypass is enabled and the expected token for this session.
 */
async function readLaunchConfig(): Promise<LaunchConfig> {
  if (!LaunchArgsModule?.getLaunchArguments) {
    return { ready: true, enabled: false, expectedToken: null };
  }
  try {
    const args = await LaunchArgsModule.getLaunchArguments();
    const values = parseLaunchArgs(args);
    return {
      ready: true,
      enabled: values.REVYL_AUTH_BYPASS_ENABLED === "true",
      expectedToken: values.REVYL_AUTH_BYPASS_TOKEN || null,
    };
  } catch (error) {
    logger.warn("Failed to read Revyl launch arguments", {
      extra: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { ready: true, enabled: false, expectedToken: null };
  }
}

/**
 * Returns true when the URL is the Nof1 Revyl auth-bypass deep link.
 *
 * Params:
 *   url: Parsed deep-link URL.
 *
 * Returns:
 *   Whether this handler owns the URL.
 */
function isRevylAuthUrl(url: URL): boolean {
  return url.protocol === "nof1:" && url.hostname === "revyl-auth";
}

/**
 * Handles one auth-bypass deep link against the session launch config.
 *
 * Params:
 *   rawURL: Deep-link string from Linking.
 *   launchConfig: Launch variables minted by before_session.
 *   setStatus: Updates visible accept/reject status for Profile.
 *
 * Returns:
 *   Whether the URL was claimed by this handler.
 */
function handleAuthBypassURL(
  rawURL: string,
  launchConfig: LaunchConfig,
  setStatus: (status: AuthBypassStatus) => void
): boolean {
  let url: URL;
  try {
    url = new URL(rawURL);
  } catch {
    return false;
  }

  if (!isRevylAuthUrl(url)) {
    return false;
  }

  if (!launchConfig.ready) {
    setStatus({
      state: "rejected",
      message: "Rejected auth bypass: launch config still loading.",
    });
    return true;
  }

  if (!launchConfig.enabled) {
    setStatus({
      state: "rejected",
      message: "Rejected auth bypass: REVYL_AUTH_BYPASS_ENABLED is not true.",
    });
    return true;
  }

  const token = url.searchParams.get("token")?.trim() || null;
  if (!launchConfig.expectedToken || token !== launchConfig.expectedToken) {
    setStatus({
      state: "rejected",
      message: "Rejected auth bypass: token did not match launch variable.",
    });
    return true;
  }

  const role = url.searchParams.get("role")?.trim() || "tester";
  if (!allowedRoles.has(role)) {
    setStatus({
      state: "rejected",
      message: `Rejected auth bypass: role "${role}" is not allowlisted.`,
    });
    return true;
  }

  acceptRevylAuthBypass(role);
  setStatus({
    state: "accepted",
    message: `Revyl auth bypass accepted (role=${role}).`,
  });
  return true;
}

/**
 * Listens for nof1://revyl-auth deep links and signs in via local skip-auth.
 *
 * Params:
 *   children: React tree rendered under the listener.
 *
 * Returns:
 *   Children unchanged; side effects drive auth + status updates.
 */
export function RevylAuthBypassProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>({
    ready: false,
    enabled: false,
    expectedToken: null,
  });
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [, setStatus] = useState<AuthBypassStatus>({
    state: "idle",
    message: "Waiting for nof1://revyl-auth deep link.",
  });

  useEffect(() => {
    let mounted = true;
    readLaunchConfig().then((config) => {
      if (mounted) {
        setLaunchConfig(config);
        logger.info("Revyl auth bypass launch config loaded", {
          extra: {
            enabled: config.enabled,
            hasToken: Boolean(config.expectedToken),
          },
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const onUrl = useCallback(
    (rawURL: string) => {
      if (!launchConfig.ready) {
        setPendingUrl(rawURL);
        return;
      }
      handleAuthBypassURL(rawURL, launchConfig, setStatus);
    },
    [launchConfig]
  );

  useEffect(() => {
    if (!launchConfig.ready || !pendingUrl) {
      return;
    }
    handleAuthBypassURL(pendingUrl, launchConfig, setStatus);
    setPendingUrl(null);
  }, [launchConfig, pendingUrl]);

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          onUrl(url);
        }
      })
      .catch(() => undefined);

    const subscription = Linking.addEventListener("url", (event) => {
      onUrl(event.url);
    });
    return () => {
      subscription.remove();
    };
  }, [onUrl]);

  return <>{children}</>;
}
