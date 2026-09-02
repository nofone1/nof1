# Subscription product setup

Create one App Store Connect auto-renewable subscription group named **Nof1
Plus** and two products. Product identifiers must match the products imported
into RevenueCat; record the final identifiers here once the account owner
creates them.

## Monthly package

- Reference name: Nof1 Plus Monthly
- Duration: 1 month
- Customer-facing name: Nof1 Plus Monthly
- Description: Run multiple active personal experiments at the same time.
- RevenueCat package: `$rc_monthly`

## Annual package

- Reference name: Nof1 Plus Annual
- Duration: 1 year
- Customer-facing name: Nof1 Plus Annual
- Description: Run multiple active personal experiments at the same time with annual billing.
- RevenueCat package: `$rc_annual`

Use the prices selected in App Store Connect as authoritative; the app does not
hard-code prices. Attach both products to RevenueCat entitlement `nof1_plus`,
include both in the current offering, publish a compliant paywall, and enable
Customer Center. The paywall must show localized price, duration, renewal,
trial terms when applicable, Terms, and Privacy before purchase.
