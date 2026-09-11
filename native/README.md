# Native N-of-1 clients

This migration adds independent SwiftUI iOS and Kotlin/Jetpack Compose Android
clients alongside the existing Expo application. The Expo client, Convex schema,
and deployed backend remain unchanged. Native implementation lives in `ios/` and
`android/`; shared source-derived resources live in `shared/`.

## Outcome and evidence

The goal is to complete the existing app's real user flows with native controls
on both platforms, and demonstrate the conversion through reviewable PRs and
build/device evidence. The primary measure is the number of shared acceptance
scenarios completed on both native clients. Record elapsed PR-to-installable-build
time as development feedback, not as an invented performance improvement.

Guardrails are unchanged Expo/backend behavior, no cross-account local state,
no credentials or personal health data in artifacts, and no successful UI result
before the requested write is confirmed. Local-demo evidence and authenticated
backend evidence are separate results. No baseline or performance target has
been established yet.

## Source and ownership

| Concern                           | Authoritative source                                     |
| --------------------------------- | -------------------------------------------------------- |
| Navigation and reachable flows    | `src/navigation/`, `src/screens/`                        |
| Domain values and timestamps      | `src/types/`, `convex/schema.ts`                         |
| Catalog and calculation semantics | `src/data/peptides.ts`, `src/utils/pharmacokinetics.ts`  |
| Auth and remote CRUD              | `src/services/backend/`, `src/services/auth/`, `convex/` |
| Billing decisions                 | `convex/billing.ts`, `convex/_billing.ts`                |
| Theme                             | `src/theme/colors.ts`                                    |

The app has five tabs in order: **Today, Peptides, Log, Protocols, Profile**.
Experiments is reached from Profile. Preserve the dark background, sage accent,
catalog detail disclosures, and native accessible controls. The checked Expo
navigation comments describing a light theme are stale; actual theme values win.

Each platform owns its app shell, native SDK integration, domain types, and
feature code. Neither platform rewrites the Expo app or backend to make its
implementation easier. The migration coordinator owns shared resources and
cross-platform acceptance scenarios.

## Shared resources

Run from the repository root after installing the locked npm dependencies:

```bash
node native/scripts/export-shared.mjs
node native/scripts/export-shared.mjs --check
node --test native/scripts/export-shared.test.mjs
```

`shared/catalog.json`, `shared/reference.json`, and `shared/calculations.json`
are generated from maintained TypeScript source. Do not edit those JSON files by
hand. The platform build should bundle the shared files directly or copy them
as a documented build step; it must not maintain a second curated catalog.
`shared/scenarios.json` is a maintained cross-platform acceptance contract.

## Integration contract

Use the existing Clerk instance and obtain a session JWT with template `convex`.
Convex verifies the configured Clerk issuer and audience `convex`; ownership comes
from the token subject, never a client-supplied user ID. Use the official native
SDKs with reviewed, pinned dependency versions and native secure session storage.

Function names use `module:function`. The current Expo client uses query,
mutation, and action calls, not a custom REST API. Application record IDs are
arbitrary strings, not necessarily UUIDs or Convex document IDs. ISO-8601 dates
remain strings. Omit optional fields when absent; preserve explicit null for
nullable `peptideId` values on doses and stack items.

| Surface           | Existing calls                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Experiments       | `experiments:list {}`, `create {input}`, `update {id,updates}`, `remove {id}`, `addEntry {experimentId,entry}`                      |
| Protocols         | `protocols:list {}`, `create {input}`, `update {id,updates}`, `remove {id}`, `toggleActive {id}`, `logAdherence {protocolId,entry}` |
| Tracking          | `tracking:getAll {}`, `logDose {entry}`, `logMetric {entry}`, `addToStack {input}`, `toggleStackItem {id}`                          |
| Tracking removal  | `tracking:deleteDose {id}`, `deleteMetric {id}`, `removeFromStack {id}`                                                             |
| Access            | `billing:getAccess {}`                                                                                                              |
| App-data deletion | `account:deleteMyData {}`                                                                                                           |

Read the owning Convex function for the complete payload and return value rather
than deriving one from this summary. Mutations such as dose creation and
experiment-entry append are not universally idempotent; do not retry them
blindly after an ambiguous network failure.

Free accounts may have one draft, active, or paused experiment; the backend
enforces this limit. Today grouping uses UTC date strings. Protocol adherence
means taken outcomes divided by logged outcomes, not all scheduled days.
Concentration displays use the existing simplified equal-dose decay calculation;
they are not dose-aware medical predictions.

Local mode is an explicitly selected development experience, not an offline
fallback when cloud requests fail. Clear user-bound memory on sign-out and keep
any retained data partitioned by identity. Do not automatically import Expo's
unscoped AsyncStorage data into a native account. Cloud configuration or auth
failures must stay visible.

## Billing and incomplete source features

RevenueCat uses the Clerk user ID. Link through
`billing:linkRevenueCatAccount`, and after purchase/restore invoke the
`billing:syncRevenueCat` action to obtain authoritative access. The
`billing:refreshAccess` mutation does not query the billing providers. Preserve
the `nof1_plus` entitlement and separate provider grants. Whop linking uses PKCE
and `billing:connectWhop`; disconnecting access does not cancel a subscription.
Side-by-side native app identities require separate provider registration review;
do not assume Expo's OAuth callback or store configuration applies automatically.

Several existing screens advertise functionality that is not implemented or
fully wired: experiment quick-log only displays a success alert, profile editing
and notification settings are placeholders, export controls do not export data,
and Terra health connectivity is not proven end to end. Native screens must not
repeat false success. Implement against an existing real backend operation or
show an explicit unavailable state, and record the remaining parity work.

Real purchases, account deletion, health connections, backend deployment, and
data migration require separately approved test environments and accounts.
Health and subscription state must never be fabricated to improve a demo.

## Verification lanes

1. Run source-resource checks and each native client's domain/serialization tests.
2. Build isolated native development apps and exercise `shared/scenarios.json`
   with synthetic local data. Prove persistence after process restart.
3. With matching test Clerk/Convex configuration, repeat core write/read flows
   against the backend and verify state after sign-out/sign-in. Local success
   does not satisfy this lane.
4. Publish PR build/device evidence with platform, app identity, commit SHA,
   configuration lane, scenario outcomes, and remaining gaps. Keep the Expo
   build profile working while adding native-specific build profiles.

The native app directories document their own toolchain, configuration,
dependency versions, and build commands. Do not mark the whole conversion
complete from a build alone or a subset of polished screens.
