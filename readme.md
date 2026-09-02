# Nof1

Nof1 is an Expo/React Native app for structured, private self-observation.
People can create personal experiments around interventions they independently
choose, log daily metrics and notes, compare phases, export their data, and
delete their account in the app.

Nof1 is not a medical device and does not diagnose, prescribe, calculate doses,
or recommend interventions. The first App Store release is iPhone-only and does
not include HealthKit/Terra or external purchase connections.

## Stack

- Expo 57 / React Native 0.86 / React 19
- TypeScript and React Navigation
- Clerk authentication with secure token storage
- Convex sync and account-data deletion
- RevenueCat App Store subscriptions
- Zustand and AsyncStorage for client state/cache

## Local development

Node 22.13 or newer is required by Expo 57.

```sh
npm ci
cp .env.example .env.local
npx expo start
```

Real signed-in development requires a Clerk publishable key and Convex URL.
Internal Revyl builds use a launch-variable-gated bypass that is compiled only
when `EXPO_PUBLIC_SKIP_AUTH=true`; the production app config excludes its native
module and production EAS validation rejects that flag.

## Quality and release checks

```sh
npm run release:check
npx expo export --platform ios --output-dir .context/ios-export
```

`release:check` validates the store structure, lints, type checks, runs tests,
and requires all Expo Doctor checks to pass. See
[`docs/release-checklist.md`](docs/release-checklist.md) for App Store Connect,
RevenueCat, legal, TestFlight, and submission requirements.

Public legal/support page sources live in `site/`; App Store copy and submission
guides live in `store/`.
