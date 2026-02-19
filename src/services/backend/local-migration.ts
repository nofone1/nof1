import AsyncStorage from "@react-native-async-storage/async-storage";
import { convexMutation, isConvexConfigured } from "./convex-client";
import { logger } from "@/services/logging";

const CORE_MIGRATION_VERSION = 1;
const MIGRATION_KEY_PREFIX = "@nof1/migrations/core";

const LOCAL_KEYS = {
  experiments: "@nof1/experiments",
  protocols: "@nof1/protocols",
  doses: "@nof1/doses",
  metrics: "@nof1/metrics",
  stack: "@nof1/stack",
} as const;

function getCompletionKey(userId: string): string {
  return `${MIGRATION_KEY_PREFIX}/v${CORE_MIGRATION_VERSION}/${userId}`;
}

async function readJsonArray(key: string): Promise<unknown[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function migrateLocalCoreDataIfNeeded(userId: string): Promise<void> {
  if (!isConvexConfigured()) {
    return;
  }

  const completionKey = getCompletionKey(userId);
  const alreadyDone = await AsyncStorage.getItem(completionKey);
  if (alreadyDone === "done") {
    return;
  }

  const [experiments, protocols, doses, metrics, stack] = await Promise.all([
    readJsonArray(LOCAL_KEYS.experiments),
    readJsonArray(LOCAL_KEYS.protocols),
    readJsonArray(LOCAL_KEYS.doses),
    readJsonArray(LOCAL_KEYS.metrics),
    readJsonArray(LOCAL_KEYS.stack),
  ]);

  const totalItems =
    experiments.length +
    protocols.length +
    doses.length +
    metrics.length +
    stack.length;

  if (totalItems === 0) {
    await AsyncStorage.setItem(completionKey, "done");
    return;
  }

  await convexMutation("migrations:importLocalCoreData", {
    version: CORE_MIGRATION_VERSION,
    payload: {
      experiments,
      protocols,
      doses,
      metrics,
      stack,
    },
  });

  await AsyncStorage.setItem(completionKey, "done");
  logger.info("Local core data migrated to Convex", {
    userId,
    extra: {
      version: CORE_MIGRATION_VERSION,
      totalItems,
    },
  });
}
