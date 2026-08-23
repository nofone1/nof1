/**
 * Whop OAuth adapter.
 *
 * The app only ever handles the public app ID, the PKCE verifier, and the
 * one-time authorization code. The code is exchanged, and the membership
 * verified, entirely inside Convex so the Whop app secret never ships.
 */

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { env } from "@/config/env";
import { logger } from "@/services/logging";
import { convexAction } from "@/services/backend/convex-client";
import { type PlusAccess } from "./types";

const CONNECT_WHOP = "billing:connectWhop" as const;

const whopOauthBaseUrl = env.whopOauthBaseUrl.replace(/\/+$/, "");

const WHOP_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `${whopOauthBaseUrl}/authorize`,
  tokenEndpoint: `${whopOauthBaseUrl}/token`,
};

const WHOP_SCOPES = ["openid", "profile", "email"];

/** Outcome of the Connect Whop flow. */
export type WhopConnectOutcome =
  | { kind: "connected"; access: PlusAccess }
  | { kind: "no_membership"; message: string }
  | { kind: "cancelled" }
  | { kind: "error"; message: string }
  | { kind: "unavailable"; message: string };

/** Server response shape from the `billing:connectWhop` action. */
type ConnectWhopResponse =
  | { connected: true; access: PlusAccess }
  | { connected: false; reason: string };

/**
 * Returns whether this build can start the Whop OAuth flow.
 *
 * Returns:
 *   True when EXPO_PUBLIC_WHOP_APP_ID is set.
 */
export function isWhopConfigured(): boolean {
  return env.whopAppId.length > 0;
}

/**
 * Returns the redirect URI registered with the Whop OAuth application.
 *
 * Returns:
 *   `nof1://oauth/whop`.
 *
 * Edge cases:
 *   Whop requires an exact match against the registered URI, so this must stay
 *   in sync with the dashboard and with the `nof1` scheme in app.json.
 */
function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({ scheme: "nof1", path: "oauth/whop" });
}

/**
 * Generates the OIDC nonce required by Whop when requesting `openid`.
 *
 * Returns:
 *   A random nonce string.
 *
 * Edge cases:
 *   Whop rejects the authorize request outright when `openid` is requested
 *   without a nonce.
 */
function createNonce(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Runs the Whop OAuth flow and links the account server-side.
 *
 * Returns:
 *   A WhopConnectOutcome describing whether Plus was unlocked.
 *
 * Edge cases:
 *   Returns `unavailable` when the build has no Whop app ID, and `cancelled`
 *   when the user dismisses the browser. A Whop account already linked to a
 *   different Nof1 account surfaces as `error` with the server's message.
 */
export async function connectWhop(): Promise<WhopConnectOutcome> {
  if (!isWhopConfigured()) {
    return {
      kind: "unavailable",
      message: "Whop is not configured for this build.",
    };
  }

  const redirectUri = getRedirectUri();

  try {
    WebBrowser.maybeCompleteAuthSession();

    const request = new AuthSession.AuthRequest({
      clientId: env.whopAppId,
      redirectUri,
      scopes: WHOP_SCOPES,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: { nonce: createNonce() },
    });

    const result = await request.promptAsync(WHOP_DISCOVERY);

    if (result.type === "cancel" || result.type === "dismiss") {
      return { kind: "cancelled" };
    }

    if (result.type !== "success") {
      return {
        kind: "error",
        message:
          result.type === "error"
            ? result.error?.message ?? "Whop sign-in failed."
            : "Whop sign-in did not complete.",
      };
    }

    const code = result.params.code;

    if (!code || !request.codeVerifier) {
      return { kind: "error", message: "Whop did not return an authorization code." };
    }

    const response = await convexAction<ConnectWhopResponse>(CONNECT_WHOP, {
      code,
      codeVerifier: request.codeVerifier,
      redirectUri,
    });

    if (!response.connected) {
      return { kind: "no_membership", message: response.reason };
    }

    return { kind: "connected", access: response.access };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn("Whop connect failed", { extra: { error: message } });
    return { kind: "error", message };
  }
}
