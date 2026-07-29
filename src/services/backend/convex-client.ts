import { ConvexHttpClient } from "convex/browser";
import { env } from "@/config/env";
import { logger } from "@/services/logging";

export type ConvexFunctionName = `${string}:${string}`;

type TokenGetter = () => Promise<string | null>;

let convexClient: ConvexHttpClient | null = null;
let tokenGetter: TokenGetter | null = null;

function getClient(): ConvexHttpClient {
  if (!env.convexUrl) {
    throw new Error(
      "Convex URL is not configured. Set EXPO_PUBLIC_CONVEX_URL for this build."
    );
  }

  if (!convexClient) {
    convexClient = new ConvexHttpClient(env.convexUrl);
  }

  return convexClient;
}

async function applyAuth(client: ConvexHttpClient): Promise<void> {
  if (!tokenGetter) {
    client.clearAuth();
    return;
  }

  try {
    const token = await tokenGetter();
    if (token) {
      client.setAuth(token);
    } else {
      client.clearAuth();
    }
  } catch (error) {
    client.clearAuth();
    logger.warn("Failed to fetch Convex auth token", {
      extra: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

export function isConvexConfigured(): boolean {
  return Boolean(env.convexUrl);
}

export function setConvexTokenGetter(getter: TokenGetter | null): void {
  tokenGetter = getter;
}

export async function convexQuery<T>(
  functionName: ConvexFunctionName,
  args: Record<string, unknown> = {}
): Promise<T> {
  const client = getClient();
  await applyAuth(client);
  return client.query(functionName as any, args as any) as Promise<T>;
}

export async function convexMutation<T>(
  functionName: ConvexFunctionName,
  args: Record<string, unknown> = {}
): Promise<T> {
  const client = getClient();
  await applyAuth(client);
  return client.mutation(functionName as any, args as any) as Promise<T>;
}
