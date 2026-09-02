# App Store release checklist

The first release is iPhone-only and intentionally limited to user-entered,
general self-tracking. It does not ship the peptide library, dosing calculators,
injection UI, Terra/HealthKit integration, or an external membership connector.

## Automated gate

Run `npm run release:check`. It validates the App Store package, lints and type
checks the source, runs the test suite, and runs Expo Doctor. EAS separately runs
`scripts/validate-release-env.js` before every production build.

## Required EAS production environment

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`

`EXPO_PUBLIC_SKIP_AUTH` and `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` must be unset.
The production profile excludes the test-only launch-arguments native module,
uses the latest EAS image, and auto-increments the build number.

## Apple and RevenueCat setup

- Accept Apple's Paid Applications agreement and finish banking and tax setup.
- Create one auto-renewable subscription group with monthly and annual products.
- Add localized product names, descriptions, prices, availability, and review
  screenshots; submit the first subscriptions with the app version.
- Import both Apple products into RevenueCat, attach them to the `nof1_plus`
  entitlement, add monthly and annual packages to the current offering, and
  publish a paywall with renewal terms plus Privacy and Terms links.
- Configure RevenueCat Customer Center and its signed production webhook to the
  Convex endpoint documented in `docs/billing-setup.md`.
- Add the iOS public RevenueCat SDK key to the EAS production environment.

## App Store Connect listing

Copy the reviewed files from `store/metadata/en-US`. The GitHub Pages workflow
publishes `site/` after merge to main; confirm the privacy, terms, support, and
deletion URLs return HTTP 200 before submission.

Complete these App Store Connect sections manually because they are account
attestations rather than source code:

- App Privacy answers for contact information, user content, identifiers,
  purchases, and diagnostics, based on the final production configuration.
- Age rating, content rights, export compliance, category, territories, and the
  Digital Services Act trader declaration where applicable.
- App Review contact details and a working review account if reviewers cannot
  use self-service sign-up.
- Subscription review screenshots and one to ten App Store screenshots showing
  the signed-in product without keyboards, development menus, or test overlays.
  Capture the final set at one of Apple's required 6.9-inch sizes (for example,
  1260 x 2736 portrait) or an accepted 6.5-inch fallback; do not stretch the
  1179 x 2556 Revyl proof images. Confirm dimensions against Apple's current
  [screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).

## Legal review

The app and `site/` contain matching Privacy, Terms, medical-safety, support,
and account-deletion copy. The operator should have counsel approve the final
text and confirm the support contact and legal entity details before it becomes
public. Account deletion is available in Profile and warns that deleting an
account does not cancel an App Store subscription.

## Physical-device/TestFlight matrix

- Sign up, email verification, sign in, password reset, sign out, and account
  deletion.
- Create/edit/delete experiments and protocols, daily metric/intervention logs,
  app relaunch, offline behavior, and sync on a second device.
- Monthly and annual purchase, cancellation, renewal, expiration, grace period,
  billing retry, refund, Restore Purchases, and Customer Center.
- Entitlement behavior after relaunch, sign-out/sign-in, reinstall, and webhook
  delay/retry/duplicate delivery.
- JSON data export, diagnostic-log export, privacy/terms/support links, Dynamic
  Type, VoiceOver, dark mode, interrupted network requests, and a small-screen
  iPhone.

## Release commands

```sh
npm ci
npm run release:check
npx expo export --platform ios --output-dir .context/ios-export
eas build --platform ios --profile production
eas submit --platform ios --profile production --latest
```

Do not run the final build until the production RevenueCat key is present. Do
not submit until legal copy, privacy answers, products, screenshots, and the
TestFlight device matrix have been approved.
