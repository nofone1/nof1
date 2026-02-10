/**
 * Experiments screen displaying list of N-of-1 experiments.
 * Refactored from the original home screen to be a dedicated tab.
 */

import React, { useCallback } from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Loading, Icon, Card, AnimatedPressable } from "@/components/ui";
import { ExperimentCard } from "@/components/experiment";
import { useExperiments } from "@/hooks";
import { useLogger } from "@/hooks/use-logger";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import type { Experiment } from "@/types/experiment";

/**
 * Experiments screen component displaying the user's N-of-1 experiments.
 *
 * @param navigation - Navigation prop for screen transitions
 * @returns The Experiments screen JSX element
 */
export function ExperimentsScreen({
  navigation,
}: MainStackScreenProps<"Experiments">): React.JSX.Element {
  const { experiments, isLoading, refresh } = useExperiments();
  const { log } = useLogger("Experiments");

  const handleExperimentPress = useCallback(
    (experimentId: string) => {
      log.info("Opening experiment detail", { experimentId });
      navigation.navigate("ExperimentDetail", { experimentId });
    },
    [navigation, log]
  );

  const handleCreateExperiment = useCallback(() => {
    navigation.navigate("CreateExperiment");
  }, [navigation]);

  const renderExperimentItem = useCallback(
    ({ item, index }: { item: Experiment; index: number }) => (
      <ExperimentCard
        experiment={item}
        onPress={() => handleExperimentPress(item.id)}
        index={index}
      />
    ),
    [handleExperimentPress]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Icon name="activity" size={48} color={colors.primary[500]} />
        </View>
        <Text style={styles.emptyTitle}>No experiments yet</Text>
        <Text style={styles.emptySubtitle}>
          N-of-1 experiments help you systematically test what works for you.
          Track interventions with on/off phases to see real effects.
        </Text>
        <Button variant="primary" size="lg" onPress={handleCreateExperiment}>
          Start Your First Experiment
        </Button>
      </View>
    ),
    [handleCreateExperiment]
  );

  const renderListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        <AnimatedPressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          haptic="light"
        >
          <Icon name="arrow-left" size={20} color={colors.primary[500]} />
          <Text style={styles.backText}>Back</Text>
        </AnimatedPressable>

        <Text style={styles.headerTitle}>Experiments</Text>
        <Text style={styles.headerSubtitle}>
          {experiments.length === 0
            ? "Run controlled self-experiments"
            : `${experiments.filter((e) => e.status === "active").length} active experiments`}
        </Text>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={18} color={colors.accent.info} />
            <Text style={styles.infoTitle}>What are N-of-1 experiments?</Text>
          </View>
          <Text style={styles.infoText}>
            N-of-1 experiments are personal trials where you alternate between
            taking an intervention and not taking it. By tracking metrics during
            both phases, you can see if something actually works for you.
          </Text>
        </Card>

        {experiments.length > 0 && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleCreateExperiment}
          >
            New Experiment
          </Button>
        )}
      </View>
    ),
    [experiments, handleCreateExperiment]
  );

  if (isLoading && experiments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading fullScreen message="Loading experiments..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={experiments}
        keyExtractor={(item) => item.id}
        renderItem={renderExperimentItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  backText: {
    ...typography.bodyMedium,
    color: colors.primary[500],
  },
  listHeader: {
    marginBottom: spacing["2xl"],
  },
  headerTitle: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.bodyMedium,
    color: colors.accent.info,
  },
  infoText: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["5xl"],
    paddingHorizontal: spacing["2xl"],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(91, 138, 114, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading2,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing["2xl"],
    maxWidth: 300,
    lineHeight: 22,
  },
});
