/**
 * Home screen displaying list of experiments.
 */

import React, { useCallback } from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Loading } from "@/components/ui";
import { ExperimentCard } from "@/components/experiment";
import { useExperiments } from "@/hooks";
import { useLogger } from "@/hooks/use-logger";
import { colors } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";
import type { Experiment } from "@/types/experiment";

export function HomeScreen({
  navigation,
}: MainTabScreenProps<"Home">): React.JSX.Element {
  const { experiments, isLoading, refresh } = useExperiments();
  const { log } = useLogger("Home");

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
    ({ item }: { item: Experiment }) => (
      <ExperimentCard
        experiment={item}
        onPress={() => handleExperimentPress(item.id)}
      />
    ),
    [handleExperimentPress]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🧪</Text>
        <Text style={styles.emptyTitle}>No experiments yet</Text>
        <Text style={styles.emptySubtitle}>
          Start your first N-of-1 experiment to discover what works for you.
        </Text>
        <Button variant="primary" size="lg" onPress={handleCreateExperiment}>
          Create Your First Experiment
        </Button>
      </View>
    ),
    [handleCreateExperiment]
  );

  const renderListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.headerTitle}>Your Experiments</Text>
        <Text style={styles.headerSubtitle}>
          {experiments.length === 0
            ? "Start tracking what works for you"
            : `${experiments.filter((e) => e.status === "active").length} active experiments`}
        </Text>
      </View>
    ),
    [experiments]
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 32,
  },
});
