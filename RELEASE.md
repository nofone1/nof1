# Nof1 iOS release guide

## Prerequisites

- EAS production environment has `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `EXPO_PUBLIC_CONVEX_URL`, and `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`.
- Clerk and Convex production configuration has been verified.
- App Store Connect subscriptions exist and are attached to RevenueCat
  entitlement `nof1_plus` and the current offering.
- Apple agreements, tax, banking, App Privacy, age rating, review contact,
  screenshots, legal URLs, and subscription review information are complete.
- The physical-device/TestFlight matrix in `docs/release-checklist.md` passes.

## Validate

```sh
npm ci
npm run release:check
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=... \
EXPO_PUBLIC_CONVEX_URL=... \
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=... \
npx expo export --platform ios --output-dir .context/ios-export
```

## Build and submit to TestFlight

```sh
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production --latest
```

EAS owns the remote iOS build number and increments it automatically. The
App Store Connect app ID is configured in `eas.json`. Submission uploads a
build; it does not complete metadata, attach subscriptions, select the build
for an App Store version, or submit that version for review.

Do not create a production build with a test RevenueCat key or
`EXPO_PUBLIC_SKIP_AUTH=true`; the pre-install release validator rejects both.
