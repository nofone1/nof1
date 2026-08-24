/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _auth from "../_auth.js";
import type * as _billing from "../_billing.js";
import type * as _revenuecat from "../_revenuecat.js";
import type * as _revenuecat_client from "../_revenuecat_client.js";
import type * as _webhooks from "../_webhooks.js";
import type * as _whop from "../_whop.js";
import type * as _whop_client from "../_whop_client.js";
import type * as account from "../account.js";
import type * as billing from "../billing.js";
import type * as experiments from "../experiments.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as protocols from "../protocols.js";
import type * as tracking from "../tracking.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _auth: typeof _auth;
  _billing: typeof _billing;
  _revenuecat: typeof _revenuecat;
  _revenuecat_client: typeof _revenuecat_client;
  _webhooks: typeof _webhooks;
  _whop: typeof _whop;
  _whop_client: typeof _whop_client;
  account: typeof account;
  billing: typeof billing;
  experiments: typeof experiments;
  http: typeof http;
  migrations: typeof migrations;
  protocols: typeof protocols;
  tracking: typeof tracking;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
