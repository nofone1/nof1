/**
 * Subscription screen.
 * Shows live Nof1 Plus status, where access comes from, and how to manage it.
 */

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Button, Card, Icon, AnimatedPressable } from "@/components/ui";
import { describeProvider, useBilling } from "@/services/billing";
import { colors, spacing, typography } from "@/theme";
import type { AccessSource } from "@/services/billing";
import type { MainStackScreenProps } from "@/types/navigation";

/**
 * Formats an ISO timestamp as a readable date.
 *
 * Params:
 *   value: ISO timestamp, or null when access is open-ended.
 *
 * Returns:
 *   A localized date, or "Never expires" when there is no expiry.
 */
function formatExpiry(value: string | null): string {
  if (!value) {
    return "Never expires";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Unknown"
    : parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

interface SourceRowProps {
  source: AccessSource;
}

/**
 * Renders one granting provider and its renewal date.
 */
function SourceRow({ source }: SourceRowProps): React.JSX.Element {
  return (
    <View style={styles.sourceRow}>
      <View style={styles.sourceInfo}>
        <Text style={styles.sourceName}>{describeProvider(source.provider)}</Text>
        <Text style={styles.sourceDetail}>
          {source.status === "grace_period"
            ? "Payment issue — access continues for now"
            : `Renews ${formatExpiry(source.expiresAt)}`}
        </Text>
      </View>
      <Badge variant={source.status === "grace_period" ? "warning" : "success"} size="sm">
        {source.status === "grace_period" ? "Grace" : "Active"}
      </Badge>
    </View>
  );
}

/**
 * Subscription screen component.
 *
 * @returns The Subscription screen JSX element
 */
export function SubscriptionScreen({
  navigation,
}: MainStackScreenProps<"Subscription">): React.JSX.Element {
  const {
    access,
    isLoading,
    error,
    isPurchaseAvailable,
    upgrade,
    restore,
    refresh,
    openStoreManagement,
  } = useBilling();
  const [isBusy, setIsBusy] = useState(false);

  const hasStoreSource = access.sources.some(
    (source) => source.provider === "revenuecat"
  );
  const visibleSources = access.sources.filter(
    (source) => source.provider === "revenuecat"
  );

  /**
   * Runs a billing action with a shared busy state and error alert.
   *
   * Params:
   *   action: The async billing action to run.
   *
   * Returns:
   *   void.
   */
  const run = useCallback(async (action: () => Promise<void>): Promise<void> => {
    setIsBusy(true);
    try {
      await action();
    } catch (caught) {
      Alert.alert(
        "Something went wrong",
        caught instanceof Error ? caught.message : String(caught)
      );
    } finally {
      setIsBusy(false);
    }
  }, []);

  const handleUpgrade = useCallback(
    () =>
      run(async () => {
        const outcome = await upgrade();

        if (outcome.kind === "error" || outcome.kind === "unavailable") {
          Alert.alert("Upgrade unavailable", outcome.message);
        }
      }),
    [run, upgrade]
  );

  const handleRestore = useCallback(
    () =>
      run(async () => {
        const outcome = await restore();

        if (outcome.kind === "restored") {
          Alert.alert(
            outcome.hasPlus ? "Purchases restored" : "Nothing to restore",
            outcome.hasPlus
              ? "Nof1 Plus is active on this account."
              : "We could not find a previous purchase for this account."
          );
          return;
        }

        Alert.alert("Restore unavailable", outcome.message);
      }),
    [run, restore]
  );

  const handleRefresh = useCallback(
    () => run(async () => void (await refresh())),
    [run, refresh]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedPressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          haptic="light"
          testID="subscription-back"
        >
          <Icon name="arrow-left" size={20} color={colors.primary[500]} />
          <Text style={styles.backText}>Back</Text>
        </AnimatedPressable>

        <View style={styles.header}>
          <Text style={styles.title}>Subscription</Text>
          <Text style={styles.subtitle}>
            Manage Nof1 Plus and see where your access comes from
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Card variant="elevated" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusPlan} testID="subscription-plan">
                {access.hasPlus ? "Nof1 Plus" : "Free Plan"}
              </Text>
              <Text style={styles.statusDetail}>
                {isLoading
                  ? "Checking your access…"
                  : access.hasPlus
                    ? `${access.primarySource === "revenuecat" ? describeProvider(access.primarySource) : "Existing access"} · ${formatExpiry(access.expiresAt)}`
                    : "Track one active experiment at a time"}
              </Text>
            </View>
            <Badge variant={access.hasPlus ? "success" : "default"} size="md">
              {access.hasPlus ? "Active" : "Free"}
            </Badge>
          </View>

          {access.inGracePeriod && (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                There is a problem with your payment. Update your billing details
                to keep Nof1 Plus.
              </Text>
            </View>
          )}

          {access.hasMultipleActiveProviders && (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                You are paying for Nof1 Plus twice. Cancel whichever
                subscription you no longer want — we will not cancel either one
                for you.
              </Text>
            </View>
          )}

          {!access.hasPlus && (
            <Button
              fullWidth
              onPress={handleUpgrade}
              loading={isBusy}
              disabled={!isPurchaseAvailable}
              testID="subscription-upgrade"
            >
              Upgrade to Plus
            </Button>
          )}

          {!isPurchaseAvailable && !access.hasPlus && (
            <Text style={styles.helperText}>
              In-app purchases are not available in this build.
            </Text>
          )}
        </Card>

        {!access.hasPlus && (
          <Card style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Nof1 Plus plans</Text>
            <Text style={styles.planBenefit}>
              Plus lets you run multiple active experiments at the same time.
            </Text>
            <Text style={styles.pricingDisclosure}>
              Monthly and annual subscriptions renew automatically until
              cancelled. The App Store purchase sheet shows your localized price,
              trial availability, and billing terms before purchase.
            </Text>
          </Card>
        )}

        {visibleSources.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Access sources</Text>
            <Card style={styles.sourcesCard}>
              {visibleSources.map((source) => (
                <SourceRow key={source.provider} source={source} />
              ))}
            </Card>
          </>
        )}

        <Text style={styles.sectionHeader}>Manage</Text>
        <Card style={styles.actionsCard}>
          {hasStoreSource && (
            <Button
              variant="secondary"
              fullWidth
              onPress={() => run(async () => void (await openStoreManagement()))}
              testID="subscription-manage-store"
            >
              Manage App Store subscription
            </Button>
          )}

          <Button
            variant="outline"
            fullWidth
            onPress={handleRestore}
            testID="subscription-restore"
          >
            Restore purchases
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onPress={handleRefresh}
            loading={isBusy}
            testID="subscription-refresh"
          >
            Refresh access
          </Button>
        </Card>

        <View style={styles.legalLinks}>
          <AnimatedPressable
            onPress={() => navigation.navigate("Legal", { document: "terms" })}
            haptic="light"
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </AnimatedPressable>
          <Text style={styles.legalSeparator}>•</Text>
          <AnimatedPressable
            onPress={() => navigation.navigate("Legal", { document: "privacy" })}
            haptic="light"
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </AnimatedPressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  backText: {
    ...typography.bodyMedium,
    color: colors.primary[500],
  },
  header: {
    marginBottom: spacing["2xl"],
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorBox: {
    backgroundColor: "rgba(220, 95, 95, 0.12)",
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.small,
    color: colors.accent.error,
  },
  statusCard: {
    marginBottom: spacing.xl,
    gap: spacing.base,
  },
  pricingCard: {
    marginBottom: spacing.xl,
  },
  pricingTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  planBenefit: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  pricingDisclosure: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.base,
  },
  statusInfo: {
    flex: 1,
  },
  statusPlan: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusDetail: {
    ...typography.small,
    color: colors.text.secondary,
  },
  noticeBox: {
    backgroundColor: "rgba(214, 158, 46, 0.12)",
    borderRadius: 12,
    padding: spacing.base,
  },
  noticeText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  helperText: {
    ...typography.small,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  sectionHeader: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  sourcesCard: {
    marginBottom: spacing.xl,
    padding: 0,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  sourceDetail: {
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  actionsCard: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  legalLink: {
    ...typography.small,
    color: colors.primary[500],
  },
  legalSeparator: {
    ...typography.small,
    color: colors.text.muted,
  },
  bottomSpacer: {
    height: 120,
  },
});
