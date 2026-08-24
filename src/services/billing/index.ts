/**
 * Billing service exports.
 */

export {
  FREE_ACCESS,
  PLUS_ENTITLEMENT,
  describeProvider,
  type AccessSource,
  type BillingProviderId,
  type GrantStatus,
  type PlusAccess,
  type UseAccessResult,
} from "./types";

export {
  clearLocalAccess,
  fetchAccess,
  refreshAccessFromProviders,
  setLocalAccess,
  useAccess,
} from "./access-service";

export {
  isRevenueCatConfigured,
  isTestStore,
  presentCustomerCenter,
  readRevenueCatAccess,
  type PaywallOutcome,
  type RestoreOutcome,
} from "./revenuecat-service";

export { isWhopConfigured, type WhopConnectOutcome } from "./whop-service";

export { BillingProvider, useBilling } from "./billing-context";
