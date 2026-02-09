/**
 * Daily Log screen - the main home screen for tracking.
 * Shows today's date, user's stack, quick logging, and recent entries.
 */

import React, { useCallback, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button, Icon, Loading } from "@/components/ui";
import { useTrackingStore, useTodaysDoses, useTodaysMetrics, useActiveStack } from "@/stores/tracking-store";
import { useLogger } from "@/hooks/use-logger";
import { colors, spacing, typography } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";
import type { DoseEntry, MetricEntry, StackItem } from "@/types/tracking";
import { QUICK_METRIC_INFO, QuickMetricType } from "@/types/tracking";

/**
 * Formats a date for display.
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Sunday, Feb 9")
 */
function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a time for display.
 * @param date - Date to format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Daily Log screen component - the main home screen.
 *
 * @param navigation - Navigation prop for screen transitions
 * @returns The Daily Log screen JSX element
 */
export function DailyLogScreen({
  navigation,
}: MainTabScreenProps<"Daily">): React.JSX.Element {
  const { loadTrackingData, isLoading, logDose } = useTrackingStore();
  const todaysDoses = useTodaysDoses();
  const todaysMetrics = useTodaysMetrics();
  const activeStack = useActiveStack();
  const { log } = useLogger("DailyLog");

  useEffect(() => {
    loadTrackingData();
  }, [loadTrackingData]);

  const handleRefresh = useCallback(() => {
    loadTrackingData();
  }, [loadTrackingData]);

  const handleQuickLog = useCallback(() => {
    navigation.navigate("Log");
  }, [navigation]);

  const handleLogDoseFromStack = useCallback(
    async (item: StackItem) => {
      try {
        await logDose({
          peptideId: item.peptideId,
          name: item.name,
          dosage: item.dosage,
        });
        log.info("Quick logged dose from stack", { extra: { name: item.name } });
      } catch (error) {
        log.error("Failed to quick log dose", {}, error instanceof Error ? error : undefined);
      }
    },
    [logDose, log]
  );

  const handleViewPeptides = useCallback(() => {
    navigation.navigate("Peptides");
  }, [navigation]);

  if (isLoading && todaysDoses.length === 0 && todaysMetrics.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading fullScreen message="Loading..." />
      </SafeAreaView>
    );
  }

  const today = new Date();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Today</Text>
          <Text style={styles.date}>{formatDisplayDate(today)}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button variant="primary" size="lg" fullWidth onPress={handleQuickLog}>
            Log Entry
          </Button>
        </View>

        {/* My Stack Section */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="layers" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>My Stack</Text>
            </View>
            {activeStack.length > 0 && (
              <Text style={styles.sectionCount}>{activeStack.length} items</Text>
            )}
          </View>

          {activeStack.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                No peptides or supplements in your stack yet.
              </Text>
              <Button variant="secondary" size="sm" onPress={handleViewPeptides}>
                Browse Peptides
              </Button>
            </View>
          ) : (
            <View style={styles.stackList}>
              {activeStack.map((item) => (
                <StackItemRow
                  key={item.id}
                  item={item}
                  isLoggedToday={todaysDoses.some(
                    (d) => d.peptideId === item.peptideId || d.name === item.name
                  )}
                  onLog={() => handleLogDoseFromStack(item)}
                />
              ))}
            </View>
          )}
        </Card>

        {/* Today's Log Section */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="check-circle" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Today's Log</Text>
            </View>
            <Text style={styles.sectionCount}>
              {todaysDoses.length + todaysMetrics.length} entries
            </Text>
          </View>

          {todaysDoses.length === 0 && todaysMetrics.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                No entries logged today. Start tracking!
              </Text>
            </View>
          ) : (
            <View style={styles.logList}>
              {todaysDoses.map((dose) => (
                <DoseEntryRow key={dose.id} dose={dose} />
              ))}
              {todaysMetrics.map((metric) => (
                <MetricEntryRow key={metric.id} metric={metric} />
              ))}
            </View>
          )}
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Stack item row component.
 */
interface StackItemRowProps {
  item: StackItem;
  isLoggedToday: boolean;
  onLog: () => void;
}

function StackItemRow({ item, isLoggedToday, onLog }: StackItemRowProps): React.JSX.Element {
  return (
    <View style={styles.stackItem}>
      <View style={styles.stackItemInfo}>
        <Text style={styles.stackItemName}>{item.name}</Text>
        <Text style={styles.stackItemDose}>{item.dosage} · {item.frequency}</Text>
      </View>
      {isLoggedToday ? (
        <View style={styles.loggedBadge}>
          <Icon name="check" size={14} color={colors.primary[500]} />
          <Text style={styles.loggedText}>Logged</Text>
        </View>
      ) : (
        <Button variant="secondary" size="sm" onPress={onLog}>
          Log
        </Button>
      )}
    </View>
  );
}

/**
 * Dose entry row component.
 */
interface DoseEntryRowProps {
  dose: DoseEntry;
}

function DoseEntryRow({ dose }: DoseEntryRowProps): React.JSX.Element {
  return (
    <View style={styles.logEntry}>
      <View style={styles.logEntryIcon}>
        <Icon name="droplet" size={16} color={colors.primary[400]} />
      </View>
      <View style={styles.logEntryInfo}>
        <Text style={styles.logEntryName}>{dose.name}</Text>
        <Text style={styles.logEntryDetail}>{dose.dosage}</Text>
      </View>
      <Text style={styles.logEntryTime}>{formatTime(dose.timestamp)}</Text>
    </View>
  );
}

/**
 * Metric entry row component.
 */
interface MetricEntryRowProps {
  metric: MetricEntry;
}

function MetricEntryRow({ metric }: MetricEntryRowProps): React.JSX.Element {
  const metricInfo = QUICK_METRIC_INFO[metric.metricType];
  const displayName = metric.metricType === QuickMetricType.CUSTOM
    ? metric.customName ?? "Custom"
    : metricInfo.label;

  return (
    <View style={styles.logEntry}>
      <View style={styles.logEntryIcon}>
        <Icon name={metricInfo.icon as any} size={16} color={colors.accent.info} />
      </View>
      <View style={styles.logEntryInfo}>
        <Text style={styles.logEntryName}>{displayName}</Text>
        <Text style={styles.logEntryDetail}>{metric.value}/10</Text>
      </View>
      <Text style={styles.logEntryTime}>{formatTime(metric.timestamp)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.heading1,
    color: colors.text.primary,
  },
  quickActions: {
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.primary,
  },
  sectionCount: {
    ...typography.small,
    color: colors.text.secondary,
  },
  emptySection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  emptySectionText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.base,
  },
  stackList: {
    gap: spacing.sm,
  },
  stackItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  stackItemInfo: {
    flex: 1,
  },
  stackItemName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  stackItemDose: {
    ...typography.small,
    color: colors.text.secondary,
  },
  loggedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(91, 138, 114, 0.1)",
    borderRadius: 8,
  },
  loggedText: {
    ...typography.small,
    color: colors.primary[500],
  },
  logList: {
    gap: spacing.sm,
  },
  logEntry: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  logEntryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.overlay,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  logEntryInfo: {
    flex: 1,
  },
  logEntryName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  logEntryDetail: {
    ...typography.small,
    color: colors.text.secondary,
  },
  logEntryTime: {
    ...typography.small,
    color: colors.text.tertiary,
  },
  bottomSpacer: {
    height: 120,
  },
});
