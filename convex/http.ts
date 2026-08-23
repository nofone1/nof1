/**
 * Convex HTTP routes for billing provider webhooks.
 *
 * Every handler follows the same contract: verify the signature, claim the
 * event for idempotency, re-read current provider state, write exactly one
 * provider's grant, and always answer 200 for events we have decided to
 * ignore so the provider stops retrying.
 */

import { anyApi, httpActionGeneric, httpRouter } from "convex/server";
import { nowIso } from "./_auth";
import { resolveGrantFromSubscriber } from "./_revenuecat";
import { fetchSubscriberState } from "./_revenuecat_client";
import {
  verifyRevenueCatWebhookSignature,
  verifyStandardWebhookSignature,
} from "./_webhooks";
import { fetchWhopMemberships, requireWhopPlusProductId } from "./_whop_client";
import { resolveGrantFromMemberships } from "./_whop";

const REVENUECAT_PROVIDER = "revenuecat";
const WHOP_PROVIDER = "whop";

/**
 * Whop events that can change Nof1 Plus access.
 * Anything else is acknowledged and ignored.
 */
const WHOP_HANDLED_EVENTS = new Set([
  "membership.activated",
  "membership.deactivated",
  "membership.cancel_at_period_end_changed",
  "payment.succeeded",
  "payment.failed",
  "refund.created",
  "dispute.created",
]);

/** Whop events that revoke access outright, regardless of membership state. */
const WHOP_REVOKING_EVENTS = new Set(["refund.created", "dispute.created"]);

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
 * Confirms the request came from RevenueCat.
 *
 * Params:
 *   request: Incoming webhook request.
 *   rawBody: Exact request body as received.
 *
 * Returns:
 *   True when both the shared Authorization header and, when a signing secret
 *   is configured, the HMAC signature match.
 *
 * Edge cases:
 *   REVENUECAT_WEBHOOK_AUTH is required. REVENUECAT_WEBHOOK_SIGNING_SECRET is
 *   optional only so the endpoint can be stood up before HMAC signing is
 *   switched on in the dashboard; enable it as soon as the endpoint is live.
 */
async function isAuthenticRevenueCatRequest(
  request: Request,
  rawBody: string
): Promise<boolean> {
  const expectedAuth = requireSecret(
    process.env.REVENUECAT_WEBHOOK_AUTH,
    "REVENUECAT_WEBHOOK_AUTH"
  );

  if (request.headers.get("Authorization") !== expectedAuth) {
    return false;
  }

  const signingSecret = process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    return true;
  }

  return verifyRevenueCatWebhookSignature(
    signingSecret,
    rawBody,
    request.headers.get("X-RevenueCat-Webhook-Signature"),
    Date.now()
  );
}

/**
 * Converts RevenueCat's event timestamp into a fallback ordering key.
 *
 * Params:
 *   event: Raw event object from the webhook body.
 *
 * Returns:
 *   ISO timestamp used as providerUpdatedAt when the subscriber read does not
 *   carry a request date of its own.
 */
function toEventTimestamp(event: Record<string, unknown>): string {
  const millis = event.event_timestamp_ms;

  if (typeof millis === "number" && Number.isFinite(millis)) {
    return new Date(millis).toISOString();
  }

  return nowIso();
}

const handleRevenueCatWebhook = httpActionGeneric(async (ctx: any, request: Request) => {
  const rawBody = await request.text();

  if (!(await isAuthenticRevenueCatRequest(request, rawBody))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody) as { event?: Record<string, unknown> };
    event = parsed.event ?? {};
  } catch {
    return new Response("Malformed payload", { status: 400 });
  }

  const eventId = typeof event.id === "string" ? event.id : null;
  const eventType = typeof event.type === "string" ? event.type : "unknown";
  const appUserId =
    typeof event.app_user_id === "string" ? event.app_user_id : null;

  if (!eventId || !appUserId) {
    return new Response("Missing event id or app_user_id", { status: 400 });
  }

  const claim = await ctx.runMutation(anyApi.billing.beginWebhookEvent, {
    provider: REVENUECAT_PROVIDER,
    eventId,
    eventType,
  });

  if (claim.alreadyProcessed) {
    return new Response("Already processed", { status: 200 });
  }

  const userId = await ctx.runQuery(anyApi.billing.resolveUserForRevenueCat, {
    appUserId,
  });

  if (!userId) {
    await ctx.runMutation(anyApi.billing.completeWebhookEvent, {
      provider: REVENUECAT_PROVIDER,
      eventId,
      status: "ignored",
      error: "Anonymous or unknown app_user_id",
    });
    return new Response("Ignored", { status: 200 });
  }

  try {
    const { subscriber, requestedAt } = await fetchSubscriberState(
      appUserId,
      toEventTimestamp(event)
    );
    const grant = resolveGrantFromSubscriber(subscriber, appUserId, nowIso());

    const result = await ctx.runMutation(anyApi.billing.applyGrant, {
      userId,
      provider: REVENUECAT_PROVIDER,
      status: grant.status,
      productId: grant.productId,
      providerRecordId: grant.providerRecordId,
      expiresAt: grant.expiresAt,
      providerUpdatedAt: requestedAt,
    });

    await ctx.runMutation(anyApi.billing.completeWebhookEvent, {
      provider: REVENUECAT_PROVIDER,
      eventId,
      status: result.applied ? "processed" : "ignored",
      error: result.applied ? undefined : "Stale provider update",
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await ctx.runMutation(anyApi.billing.completeWebhookEvent, {
      provider: REVENUECAT_PROVIDER,
      eventId,
      status: "failed",
      error: message,
    });

    // 500 asks RevenueCat to retry; the event row keeps the failure reason.
    return new Response("Processing failed", { status: 500 });
  }
});

/**
 * Extracts the Whop user ID from an event payload.
 *
 * Params:
 *   data: The `data` object from the webhook envelope.
 *
 * Returns:
 *   The Whop user ID, or null when the payload has no buyer attached.
 *
 * Edge cases:
 *   Membership, payment, refund, and dispute payloads each nest the buyer
 *   differently, and an unclaimed membership has no buyer at all.
 */
function extractWhopUserId(data: Record<string, unknown>): string | null {
  const direct = data.user_id;
  if (typeof direct === "string") {
    return direct;
  }

  const user = data.user as { id?: unknown } | undefined;
  if (user && typeof user.id === "string") {
    return user.id;
  }

  const membership = data.membership as { user_id?: unknown } | undefined;
  if (membership && typeof membership.user_id === "string") {
    return membership.user_id;
  }

  return null;
}

const handleWhopWebhook = httpActionGeneric(async (ctx: any, request: Request) => {
  const rawBody = await request.text();
  const secret = requireSecret(
    process.env.WHOP_WEBHOOK_SECRET,
    "WHOP_WEBHOOK_SECRET"
  );

  const isAuthentic = await verifyStandardWebhookSignature(
    secret,
    rawBody,
    {
      id: request.headers.get("webhook-id"),
      timestamp: request.headers.get("webhook-timestamp"),
      signature: request.headers.get("webhook-signature"),
    },
    Date.now()
  );

  if (!isAuthentic) {
    return new Response("Invalid signature", { status: 401 });
  }

  let envelope: {
    id?: unknown;
    type?: unknown;
    timestamp?: unknown;
    data?: Record<string, unknown>;
  };

  try {
    envelope = JSON.parse(rawBody);
  } catch {
    return new Response("Malformed payload", { status: 400 });
  }

  const eventId =
    request.headers.get("webhook-id") ??
    (typeof envelope.id === "string" ? envelope.id : null);
  const eventType = typeof envelope.type === "string" ? envelope.type : "unknown";

  if (!eventId) {
    return new Response("Missing webhook id", { status: 400 });
  }

  const claim = await ctx.runMutation(anyApi.billing.beginWebhookEvent, {
    provider: WHOP_PROVIDER,
    eventId,
    eventType,
  });

  if (claim.alreadyProcessed) {
    return new Response("Already processed", { status: 200 });
  }

  /**
   * Records the outcome and answers Whop.
   *
   * Params:
   *   status: Terminal status to store on the event row.
   *   httpStatus: Response status to return.
   *   error: Optional detail stored with the event.
   *
   * Returns:
   *   The HTTP response to send.
   */
  const finish = async (
    status: string,
    httpStatus: number,
    error?: string
  ): Promise<Response> => {
    await ctx.runMutation(anyApi.billing.completeWebhookEvent, {
      provider: WHOP_PROVIDER,
      eventId,
      status,
      error,
    });
    return new Response(status === "failed" ? "Processing failed" : "OK", {
      status: httpStatus,
    });
  };

  if (!WHOP_HANDLED_EVENTS.has(eventType)) {
    return finish("ignored", 200, `Unhandled event type: ${eventType}`);
  }

  const whopUserId = extractWhopUserId(envelope.data ?? {});

  if (!whopUserId) {
    return finish("ignored", 200, "Event has no Whop user");
  }

  const userId = await ctx.runQuery(anyApi.billing.resolveUserForWhop, {
    whopUserId,
  });

  if (!userId) {
    // Expected when someone buys on Whop before connecting in the app.
    return finish("ignored", 200, "Whop account is not connected yet");
  }

  try {
    const productId = requireWhopPlusProductId();
    const memberships = await fetchWhopMemberships(whopUserId);
    const grant = resolveGrantFromMemberships(memberships, productId);
    const providerUpdatedAt =
      typeof envelope.timestamp === "string" ? envelope.timestamp : nowIso();

    const result = await ctx.runMutation(anyApi.billing.applyGrant, {
      userId,
      provider: WHOP_PROVIDER,
      status: WHOP_REVOKING_EVENTS.has(eventType)
        ? "revoked"
        : grant?.status ?? "expired",
      productId: grant?.productId ?? productId,
      providerRecordId: grant?.providerRecordId ?? whopUserId,
      expiresAt: grant?.expiresAt,
      providerUpdatedAt,
    });

    return finish(
      result.applied ? "processed" : "ignored",
      200,
      result.applied ? undefined : "Stale provider update"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // 500 asks Whop to retry; the event row keeps the failure reason.
    return finish("failed", 500, message);
  }
});

const http = httpRouter();

http.route({
  path: "/webhooks/revenuecat",
  method: "POST",
  handler: handleRevenueCatWebhook,
});

http.route({
  path: "/webhooks/whop",
  method: "POST",
  handler: handleWhopWebhook,
});

export default http;
