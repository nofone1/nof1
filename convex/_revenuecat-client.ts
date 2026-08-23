/**
 * Server-side RevenueCat REST client.
 *
 * Used by both the webhook handler and the client-triggered sync so a grant is
 * always written from current subscriber state rather than from an event body
 * or from anything the app claims.
 */

import type { RevenueCatSubscriber } from "./_revenuecat";

const REVENUECAT_API_BASE = "https://api.revenuecat.com/v1";

/** Current subscriber state plus the provider timestamp it is valid as of. */
export interface RevenueCatSubscriberState {
  subscriber: RevenueCatSubscriber;
  /**
   * RevenueCat's `request_date` for this read, used as the grant ordering key.
   * Because it comes from the same clock as webhook event timestamps, a
   * webhook describing an earlier moment is correctly discarded as stale.
   */
  requestedAt: string;
}

/**
 * Asserts that a Convex deployment secret is configured.
 *
 * Params:
 *   value: Value read from process.env.
 *   name: Environment variable name, used in the failure message.
 *
 * Returns:
 *   The configured value.
 *
 * Throws:
 *   Error when the secret is not set on the deployment.
 */
function requireSecret(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing Convex environment variable: ${name}`);
  }

  return value;
}

/**
 * Reads current subscriber state from the RevenueCat REST API.
 *
 * Params:
 *   appUserId: RevenueCat app user ID, which is the Clerk user ID.
 *   fallbackRequestedAt: ISO timestamp to use when RevenueCat omits
 *     `request_date`.
 *
 * Returns:
 *   The subscriber object and the timestamp the state is valid as of.
 *
 * Throws:
 *   Error when REVENUECAT_SECRET_API_KEY is unset or the request fails, so the
 *   caller retries rather than writing a grant from an incomplete read.
 *
 * Edge cases:
 *   RevenueCat returns 404 for an app user ID it has never seen. That is a
 *   real failure here: callers only ask about users the app has configured, so
 *   a miss means a misconfiguration rather than "no subscription".
 */
export async function fetchSubscriberState(
  appUserId: string,
  fallbackRequestedAt: string
): Promise<RevenueCatSubscriberState> {
  const secretKey = requireSecret(
    process.env.REVENUECAT_SECRET_API_KEY,
    "REVENUECAT_SECRET_API_KEY"
  );

  const response = await fetch(
    `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `RevenueCat subscriber fetch failed with ${response.status}`
    );
  }

  const payload = (await response.json()) as {
    request_date?: unknown;
    subscriber?: RevenueCatSubscriber;
  };

  return {
    subscriber: payload.subscriber ?? {},
    requestedAt:
      typeof payload.request_date === "string"
        ? payload.request_date
        : fallbackRequestedAt,
  };
}
