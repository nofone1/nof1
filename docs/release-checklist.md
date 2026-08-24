# Release checklist

The codebase is configured for Nof1 Plus at **$9.99/month** and
**$79.99/year**. Storefront-localized prices remain authoritative.

## Automated release gate

Run `npm run release:check`. EAS also runs `scripts/validate-release-env.js`
before every production build. A production build fails when authentication,
Convex, the platform's RevenueCat SDK key, or the Whop app ID is missing; when
skip-auth is enabled; or when a RevenueCat Test Store key or Whop sandbox OAuth
URL leaks into production.

## EAS production environment

Create these in the EAS `production` environment:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- `EXPO_PUBLIC_WHOP_APP_ID`

`EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` and `EXPO_PUBLIC_SKIP_AUTH` must be
unset. `EXPO_PUBLIC_WHOP_OAUTH_BASE_URL` should be omitted so the production
default is used.

## App Store Connect and Google Play

- Accept paid-app agreements and finish bank, tax, merchant, and payout setup.
- Create monthly and annual auto-renewing subscriptions at $9.99 and $79.99.
- Add localized names, descriptions, review screenshots, and availability.
- Configure the subscription group/base plans and activate the products.
- Submit the first Apple subscriptions with the app version.
- Complete App Privacy, Google Data Safety, and Google Health Apps forms.
- Add public support, privacy-policy, and account-deletion URLs to both listings.
- Verify the Apple developer account is an Organization before submitting the
  app's sensitive health functionality.

## RevenueCat production

- Add the iOS and Android store apps and their credentials.
- Import all four store products and attach them to `nof1_plus`.
- Add monthly and annual packages to the default offering.
- Publish a paywall that clearly shows renewal terms and links to Terms and
  Privacy; enable Customer Center.
- Configure the production webhook and signing secret described in
  `docs/billing-setup.md`.

## Whop production

- Create a production business product and $9.99/$79.99 plans; sandbox objects
  do not transfer.
- Create the production OAuth app and register `nof1://oauth/whop`.
- Set `WHOP_API_KEY` to a **company API key** used for membership reads.
- Set `WHOP_OAUTH_CLIENT_SECRET` to the **app API key** used for OAuth exchange.
- Set the production app, product, and webhook values on the production Convex
  deployment; remove both Whop sandbox base-URL overrides.
- Keep Whop checkout outside the mobile app. The app only connects an existing
  membership.

## Legal and medical review

The app contains an in-app Privacy Policy, Terms, Medical Safety disclosure,
and permanent account deletion. Before submission, counsel should approve the
copy and the same Privacy Policy and deletion instructions must be hosted at
public URLs.

The first-release UI no longer shows the reconstitution calculator, protocol
dose examples, peptide-library dose cards, automatic dose/frequency prefill, or
"next dose" recommendations. It still contains health and research content, so
medical/regulatory review and accurate store declarations remain mandatory.

## Physical-device acceptance matrix

Test both monthly and annual products on TestFlight and Google internal/closed
tracks:

- new purchase, cancellation, renewal, expiration, grace period, billing retry,
  refund, and restore;
- entitlement after relaunch, sign-out/sign-in, reinstall, and a second device;
- RevenueCat webhook delay/retry and duplicate delivery;
- Whop sandbox checkout, OAuth connection, cancellation, refund, and webhook;
- account deletion with synced records and an active subscription warning;
- production auth, sync, paywall, Customer Center, privacy/terms, and support
  flows on physical iOS and Android devices.

## Revyl billing acceptance build

The default Revyl `ios` build is a UI-proof build. It bakes in
`EXPO_PUBLIC_SKIP_AUTH=true`, deliberately omits provider configuration, and
therefore cannot verify a provider-to-Convex entitlement. A disabled Upgrade
button, an unavailable Restore message, and Free after Refresh are expected in
that build rather than evidence of a billing regression.

For end-to-end sandbox billing, use the separate `ios-billing` build profile.
Store these names as encrypted build secrets in the **Nof1 Revyl organization**:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`
- `EXPO_PUBLIC_WHOP_APP_ID`
- `EXPO_PUBLIC_WHOP_OAUTH_BASE_URL`

Then build with:

```sh
revyl build --remote --platform ios-billing --no-cache
```

Sign in through Clerk with a dedicated QA account. Do not use the Revyl bypass
deep link for this matrix: bypass access is local-only and does not produce the
Clerk identity required by Convex billing actions. RevenueCat Test Store can be
verified on the simulator. Whop additionally requires the matching sandbox
server variables in Convex, including a company API key in `WHOP_API_KEY`.

This path does not use EAS, but it does intentionally keep Expo's native
prebuild step because the application is an Expo project.

## Planned SDK maintenance

Expo Doctor is green on SDK 52. Clerk Core 2 is pinned to its Expo-52-compatible
release; moving to the renamed Clerk Core 3 package requires Expo SDK 53 or
newer. The remaining npm audit findings are in Expo/Metro build-tool dependency
chains whose automated fix attempts a breaking Expo/React Native upgrade. Plan
the Expo + Clerk migration as a tested release rather than forcing incompatible
packages into this one.
