# Nof1 Plus billing setup

Everything in this file is out-of-band dashboard configuration. The code in
`convex/billing.ts`, `convex/http.ts`, and `src/services/billing/` assumes it is
in place.

The internal entitlement key is `nof1_plus`. Both channels grant it; Convex
combines them so a cancellation on one provider never removes access granted by
the other.

## 1. RevenueCat

### Apps and entitlement

| Item | Value |
| --- | --- |
| iOS app bundle ID | `com.nof1.experiments` |
| Android package | `com.nof1.experiments` |
| Entitlement identifier | `nof1_plus` |

### Products and offering

| Product | Price | Notes |
| --- | --- | --- |
| Nof1 Plus monthly | $9.99 / month | Attach to `nof1_plus` |
| Nof1 Plus annual | $79.99 / year | Attach to `nof1_plus` |

Create both in App Store Connect and Google Play, import them into RevenueCat,
attach both to the `nof1_plus` entitlement, and add them to the **default**
offering. The app calls `presentPaywallIfNeeded` without naming an offering, so
the default is what ships.

### Paywall and Customer Center

- Build a remote paywall on the default offering. `presentPaywallIfNeeded` in
  [`revenuecat-service.ts`](../src/services/billing/revenuecat-service.ts)
  renders it, so paywall copy and layout are changed in the dashboard without an
  app release.
- Enable Customer Center. `presentCustomerCenter` is the Apple/Google management
  entry point on the Subscription screen.

### Test Store

Enable the Test Store and copy its API key into
`EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`. When that variable is set, the app uses it
in preference to the store keys (see `resolveApiKey`), so dogfood and E2E builds
can complete purchases without real store accounts and can never hit real
billing.

### Webhooks

Add a webhook for both the production and sandbox environments:

| Field | Value |
| --- | --- |
| URL | `https://<deployment>.convex.site/webhooks/revenuecat` |
| Authorization header | the value stored in `REVENUECAT_WEBHOOK_AUTH` |
| HMAC signing | **enabled**, secret stored in `REVENUECAT_WEBHOOK_SIGNING_SECRET` |

The handler verifies the Authorization header first, then the timestamped
`X-RevenueCat-Webhook-Signature` HMAC. Signature verification is skipped only when
`REVENUECAT_WEBHOOK_SIGNING_SECRET` is unset, which exists purely so the endpoint
can be stood up before signing is switched on. Turn it on immediately after.

The handler does not trust the event body for entitlement state: it re-reads
`GET /v1/subscribers/{app_user_id}` and derives the grant from current provider
state.

## 2. Whop

### Business, product, and plans

| Item | Value |
| --- | --- |
| Product | Nof1 Plus Community |
| Monthly | $9.99 |
| Annual | $79.99 |

Create sandbox equivalents of the product and both plans. Record the product ID
in `WHOP_PLUS_PRODUCT_ID`; membership is only honored when it is for that
product.

### OAuth application

| Field | Value |
| --- | --- |
| Redirect URI | `nof1://oauth/whop` |
| Scopes | `openid profile email` |
| Permission | `oauth:token_exchange` (Permissions tab) |
| App ID (`app_…`) | `EXPO_PUBLIC_WHOP_APP_ID` **and** `WHOP_APP_ID` |
| App API key / OAuth secret | `WHOP_OAUTH_CLIENT_SECRET` (server only) |
| Company API key | `WHOP_API_KEY` (server only) |

The app ID is needed in two places: in the bundle to build the authorize URL,
and on the Convex deployment as the OAuth `client_id` for the token exchange.
It is public in both.

Whop uses different credentials for different server roles. Use a company API
key for seller-side membership reads (`WHOP_API_KEY`) and the app API key for
OAuth token exchange (`WHOP_OAUTH_CLIENT_SECRET`). Do not reuse the app key for
company membership reads; Whop rejects that request even though the key itself
is valid.

The `nof1` scheme is already registered in [`app.json`](../app.json). The OAuth
code is exchanged server-side in Convex with PKCE; the client never sees the app
secret or the user's Whop access token.

### Webhook

| Field | Value |
| --- | --- |
| URL | `https://<deployment>.convex.site/webhooks/whop` |
| Signing secret | `WHOP_WEBHOOK_SECRET` — the `ws_…` value, stored verbatim |

Subscribe to `membership.activated`, `membership.deactivated`,
`membership.cancel_at_period_end_changed`, `payment.succeeded`,
`payment.failed`, `refund.created`, and `dispute.created`. Every other event
type is acknowledged with 200 and ignored.

Whop follows the [Standard Webhooks](https://www.standardwebhooks.com)
specification: the `webhook-signature` header is an HMAC-SHA256 over
`{webhook-id}.{webhook-timestamp}.{raw body}`. The handler verifies that,
rejects timestamps more than five minutes old, deduplicates on the
`webhook-id`, and discards any event whose `providerUpdatedAt` is not newer
than what is stored — Whop delivers at least once and does not guarantee
ordering.

Like the RevenueCat handler, it re-reads memberships from the API rather than
trusting the event body, and only ever writes the `whop` grant row.

## 3. Environment variables

### Client (public, baked into the bundle)

Add to `.env` — these are safe to ship:

```
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
EXPO_PUBLIC_REVENUECAT_TEST_API_KEY
EXPO_PUBLIC_WHOP_APP_ID
EXPO_PUBLIC_WHOP_OAUTH_BASE_URL   # sandbox: https://sandbox-api.whop.com/oauth
```

### Convex deployment secrets

Set with `npx convex env set <NAME> <value>` or in the Convex dashboard. None of
these may ever appear in the app bundle:

```
REVENUECAT_SECRET_API_KEY
REVENUECAT_WEBHOOK_AUTH
REVENUECAT_WEBHOOK_SIGNING_SECRET
WHOP_APP_ID
WHOP_API_KEY
WHOP_OAUTH_CLIENT_SECRET   # app API key used for OAuth token exchange
WHOP_WEBHOOK_SECRET
WHOP_PLUS_PRODUCT_ID
```

For a Whop sandbox deployment, also set these non-secret Convex variables:

```
WHOP_API_BASE_URL=https://sandbox-api.whop.com/api/v1
WHOP_OAUTH_BASE_URL=https://sandbox-api.whop.com/oauth
```

Production deployments may omit both OAuth/API base URL overrides; the
code defaults to `https://api.whop.com` endpoints.

## 4. Tests

### Unit tests

`npm test` runs the Convex billing unit tests in `tests/convex/`. They cover
the two properties that keep entitlements correct when providers misbehave:
deduplication on `(provider, eventId)`, and discarding any grant write whose
`providerUpdatedAt` is not newer than what is stored. They run against an
in-memory fake of the Convex database, so no deployment is needed.

### Manual sandbox coverage

Dogfood still uses the shared bypass identity in `.revyl/config.yaml`. Access
is held in process memory and never read back from Convex, and RevenueCat is
configured with a throwaway `dogfood-<random>` customer per launch rather than
with the bypass user's Clerk ID. That keeps Test Store purchases from leaking
into the next run.

Provider sandbox coverage is one App Store / Play sandbox purchase and one
Whop sandbox purchase per release, each verified end to end through the
webhook into `entitlementGrants`.

## 5. Why the app calls `billing:syncRevenueCat`

The RevenueCat webhook is authoritative, but it can lag a purchase by seconds.
`billing:refreshAccess` only re-derives from grants already stored, so on its
own it would keep reporting Free right after a successful purchase — and
`requirePlus` would keep rejecting a user who has just paid.

`billing:syncRevenueCat` is the action the app calls after a purchase, a
restore, or a manual Refresh. It reads current subscriber state with the server
key and writes the grant immediately. It orders on RevenueCat's own
`request_date`, which shares a clock with webhook event timestamps, so the
action and the webhook can race in either direction and the ordering guard in
`applyGrant` resolves it correctly.

## 6. Manual grants

Comped and support grants are internal-only. From the Convex dashboard, run
`billing:setManualGrant` with `{ userId, status: "active", note }` and an
optional `expiresAt`. Manual grants are stored as their own provider row, so
revoking one never touches a paid grant.
