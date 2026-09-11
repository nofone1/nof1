# Nof1 native iOS

This is an independent SwiftUI application, not a React Native target or web
wrapper. It preserves the existing five-tab navigation and consumes the existing
Clerk/Convex APIs. Its isolated bundle ID is `com.nof1.experiments.native` and its
display name is **Nof1 Native**. Expo, Android, and backend files are unchanged by
this client.

## Toolchain and pinned dependencies

- Xcode **26 or later**, with Swift **6.2 or later**. Clerk 1.5.4 declares Swift
  tools 6.2; Xcode 16 cannot resolve this pinned SDK.
- Deployment target: **iOS 17.0**. The application uses Swift 5 language mode;
  package dependencies retain their own compiler settings.
- XcodeGen **2.44.1**, downloaded from its official release and verified by
  SHA-256 in `scripts/remote-build.sh`.
- Official Clerk **1.5.4**: `ClerkKit` and `ClerkKitUI` from
  `https://github.com/clerk/clerk-ios.git`.
- Official Convex Swift **0.8.1**: `ConvexMobile` from
  `https://github.com/get-convex/convex-swift`.

`project.yml` is the maintained Xcode project source. Generated Xcode projects,
configuration, package/build caches, and derived outputs are ignored. The shared
71-entry catalog is bundled directly from `../shared/catalog.json`; there is no
second curated copy. Regenerate that resource using the parent native README.
The app icon is a 1024-pixel derivative of the existing `assets/icon.png` brand
asset; it does not introduce a second app identity or reuse the Expo bundle ID.

## Configuration and identity isolation

Every build must explicitly select `cloud` or `local-demo`. Missing/invalid
configuration renders a configuration error; a cloud error never enters local
mode. `Config.template.xcconfig` contains placeholders only. The generator writes
ignored `Config.generated/Info.plist`, `Config.xcconfig`, and app entitlements
without printing values.

For cloud builds, supply these **public client configuration** environment
variables through the authorized build environment, not command-line literals:

| Name | Value |
| --- | --- |
| `NOF1_CLERK_PUBLISHABLE_KEY` | The Clerk `pk_test_…` or `pk_live_…` public key |
| `NOF1_CONVEX_URL` | The deployment's HTTPS origin |
| `NOF1_CLERK_FRONTEND_DOMAIN` | Clerk frontend host, without a scheme or path |

Run `python3 scripts/configure.py --mode cloud` from this directory. Local builds
use `--mode local-demo`; the generator deliberately drops any inherited cloud
values in that mode. Do not supply Clerk secret keys, Convex admin/deploy keys,
or billing secrets to this client.

Cloud prerequisites require owner review; this change does not mutate them:

1. Enable Clerk's Native API and register the native app's team/App ID prefix and
   **new bundle ID**. Use the associated domain `webcredentials:<frontend-host>`.
2. Register the isolated callback
   `com.nof1.experiments.native://callback`, if the enabled OAuth strategies need
   it. The Expo `nof1` callback is not reused.
3. Keep the existing Clerk **`convex` JWT template** and Convex issuer/audience
   configuration. The Swift provider requests that template explicitly on every
   SDK token refresh and rejects a changed/non-active session.

ClerkKit owns secure Keychain session persistence using this bundle's default
service, without a shared access group. The app never writes tokens to
preferences, files, analytics, or its own logs. Clerk's telemetry is disabled.
The official ClerkConvex bridge 0.1.0 was reviewed but is not used: its token
request uses the default Clerk token instead of this deployment's JWT template.
The small `ClerkTokenProvider` conforms to the official Convex auth interface;
Convex's SDK manages expiring-token refresh, WebSocket reconnects, and live
subscriptions. Token retrieval errors are replaced with a safe static error
before they reach the SDK's diagnostic path.

Each account/session transition cancels subscriptions, invalidates the old token
provider, clears records/access/UI state, and increments a generation guard.
Late mutation results cannot populate another account. Cloud data is memory-only;
favorites are partitioned by a SHA-256 account key. No Expo AsyncStorage records
are imported. A failed sign-out clears visible records and surfaces the failure.

Local development has its own explicit entry screen and persistent top banner.
It uses a separate Application Support snapshot, atomic writes, iOS file
protection, and backup exclusion. A save is shown as successful only after the
file write succeeds. Leaving local mode clears memory but retains this isolated
workspace for restart testing; deleting local data removes it. Local mode has no
Clerk identity, cloud fallback, or invented Plus grant.

## Authorized remote build

Mobile binaries must be built by the authorized cloud mobile build runner, not
by local bash. Confirm that the runner credential belongs to the intended nof1
organization **before** starting a build or paid device session. These are the
exact workspace-source inputs for that runner:

```json
{
  "platform": "ios",
  "source": {
    "type": "workspace",
    "path": "native",
    "commands": ["bash ios/scripts/remote-build.sh local-demo"],
    "output_path": "ios/build/DerivedData/Build/Products/Debug-iphonesimulator/Nof1Native.app",
    "timeout_seconds": 2400
  }
}
```

`path: native` intentionally includes the sibling shared catalog. The app name
and organization selection belong to the coordinator's verified runner setup.
For cloud evidence, use the same command with `cloud` and the configured public
variables. For physical devices, proper signing/provisioning and a device build
are separately required; the documented unsigned simulator product is not an
App Store archive or a distributable IPA.

The simulator recipe targets Apple Silicon (`arm64`). The pinned Convex 0.8.1
XCFramework has no Intel simulator slice, so this recipe does not support
`x86_64` simulators.

The script checks Xcode/Swift versions, verifies and invokes XcodeGen, resolves
the pinned SDKs, then runs:

```sh
xcodebuild -project Nof1Native.xcodeproj -scheme Nof1Native \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build/DerivedData CODE_SIGNING_ALLOWED=NO ARCHS=arm64 build
```

The platform-local `.revyl/config.yaml` selects the coordinator-created **Nof1
Native iOS** build container and a `local-demo` profile, without copying Expo's
auth-bypass/session hooks. Run that profile with `native/ios` as its working
directory while preserving the sibling `native/shared` resources in the remote
archive. It contains only app/project identifiers and a build recipe, no
credentials. Do not push it to an external project or launch a workload without
the coordinator's verified Nof1 runtime credential.

Run the full native XCTest suite on an authorized Apple test runner, using a
simulator destination actually listed by that runner:

```sh
xcodebuild -project Nof1Native.xcodeproj -scheme Nof1Native \
  -configuration Debug -destination 'platform=iOS Simulator,id=<RUNNER_SIMULATOR_ID>' \
  -derivedDataPath build/DerivedData CODE_SIGNING_ALLOWED=NO test
```

Use **local-demo configuration** for these tests; no test initiates auth,
purchases, account deletion, or live backend mutations.

## Fast host checks

These compile Foundation-only domain code for the host, not mobile binaries:

```sh
swift test --package-path native/ios -Xswiftc -warnings-as-errors
python3 -m unittest discover -s native/ios/scripts -p 'test_*.py' -v
swiftc -swift-version 6 -warnings-as-errors -strict-concurrency=complete \
  -typecheck native/ios/Sources/Domain/*.swift
```

The host suite covers arbitrary IDs, explicit-null dose/stack peptide IDs,
omitted optionals, Double JSON numbers, mixed metric values, timestamp parsing,
UTC boundaries, logged-outcome adherence, bounded experiment phases, and a
lossless encode/decode of **all 71 complete catalog entries**, persistent local
records across repository restart, deletion, corruption failures, and workspace
separation. SDK serialization
tests additionally run in the Xcode target; they are excluded automatically from
the Foundation-only host lane because ConvexMobile is unavailable there.

## Implemented flows and remaining verification

- Today: UTC daily doses/observations, active stack, confirmed dose logging,
  stack creation/pause/removal, record deletion, and the source's simplified
  equal-dose concentration estimates with explicit educational limitations.
- Peptides: full source-derived catalog, search/filter/favorites, every research
  detail field, source links, educational decay/concentration arithmetic, and
  user-entered stack/protocol/experiment actions.
- Log: dose, metric, and **real experiment entry** forms, with dates, notes,
  injection sites, numeric/custom metrics, validation, and failure states.
  Add to Stack performs the existing separate mutations. If the dose succeeds
  but the stack update fails, the form reports partial success and retries only
  the stack update with a stable ID, never the already-confirmed dose.
- Protocols: create/list/detail/edit/pause/resume/delete and replaceable UTC
  taken/skipped adherence outcomes.
- Experiments: creation with typed metrics and schedules, listing/detail, phase
  display, status management, entry recording/history, and removal. The server
  enforces Free's one draft/active/paused limit; local mode mirrors that limit.
- Profile: account/session controls, experiments, authoritative access readout,
  legal/medical text, and separately confirmed data/account deletion. Cloud
  deletion calls `account:deleteMyData` before deleting the Clerk identity and
  reports partial failure rather than claiming completion. It does not cancel
  store subscriptions.

**Not complete:** native RevenueCat purchase/restore and Whop linking are not
integrated. Subscription access is read from `billing:getAccess`, never invented;
the screen clearly identifies purchase/management unavailability. The isolated
app needs its own provider/store registration review before that work can be
tested. Terra/HealthKit connections, profile editing, notification preferences,
and exports are explicitly unavailable rather than copied success placeholders.
Push/local reminder scheduling is not implemented. These gaps prevent calling
this a complete production conversion.

Host XCTest/configuration checks, Xcode compilation, and device scenarios are
separate verification gates. The pull request records the tested artifact and
current device results against `../shared/scenarios.json`. Build under the
intended runtime organization and keep local-demo evidence separate from
authenticated Clerk/Convex evidence; neither compilation nor a persistent local
record proves cloud identity isolation.
