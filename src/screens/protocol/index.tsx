/**
 * Protocols list screen.
 * Shows active and inactive protocols with adherence tracking.
 */

import React, { useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button, Icon, Badge, Loading } from "@/components/ui";
import { useProtocolStore } from "@/stores/protocol-store";
import { calculateAdherence } from "@/types/protocol";
import type { Protocol } from "@/types/protocol";
import { colors, spacing, typography } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";
import { getTodayDateString } from "@/types/tracking";

/**
 * Protocols list screen component.
 */
export function ProtocolsScreen({
  navigation,
}: MainTabScreenProps<"Protocols">): React.JSX.Element {
  const { protocols, loadProtocols, isLoading, logAdherence } = useProtocolStore();

  useEffect(() => {
    loadProtocols();
  }, [loadProtocols]);

  const handleCreateProtocol = useCallback(() => {
    navigation.navigate("CreateProtocol");
  }, [navigation]);

  const handleLogAdherence = useCallback(
    async (protocolId: string, taken: boolean) => {
      await logAdherence(protocolId, {
        date: getTodayDateString(),
        taken,
      });
    },
    [logAdherence],
  );

  const activeProtocols = protocols.filter((p) => p.isActive);
  const inactiveProtocols = protocols.filter((p) => !p.isActive);

  const renderProtocolItem = useCallback(
    ({ item }: { item: Protocol }) => {
      const adherence = calculateAdherence(item);
      const todayLogged = item.adherence.some((a) => a.date === getTodayDateString());

      return (
        <Card style={styles.protocolCard}>
          <View style={styles.protocolHeader}>
            <View style={styles.protocolInfo}>
              <Text style={styles.protocolName}>{item.name}</Text>
              <Text style={styles.protocolDetail}>
                {item.peptideName} · {item.dosage} · {item.frequency}
              </Text>
            </View>
            <Badge variant={item.isActive ? "success" : "default"} size="sm">
              {item.isActive ? "Active" : "Paused"}
            </Badge>
          </View>

          {item.isActive && (
            <>
              <View style={styles.adherenceRow}>
                <View style={styles.adherenceBar}>
                  <View
                    style={[
                      styles.adherenceFill,
                      { width: `${Math.max(adherence, 2)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.adherenceText}>{adherence}%</Text>
              </View>

              {!todayLogged ? (
                <View style={styles.todayActions}>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => handleLogAdherence(item.id, true)}
                  >
                    Taken Today
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => handleLogAdherence(item.id, false)}
                  >
                    Skip
                  </Button>
                </View>
              ) : (
                <View style={styles.todayLogged}>
                  <Icon name="check-circle" size={16} color={colors.primary[500]} />
                  <Text style={styles.todayLoggedText}>Logged today</Text>
                </View>
              )}
            </>
          )}
        </Card>
      );
    },
    [handleLogAdherence],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>My Protocols</Text>
          <Text style={styles.subtitle}>
            {activeProtocols.length} active protocol{activeProtocols.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleCreateProtocol}
        >
          Create Protocol
        </Button>

        <View style={styles.sectionSpacer} />
      </View>
    ),
    [activeProtocols.length, handleCreateProtocol],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Icon name="clipboard" size={48} color={colors.primary[500]} />
        </View>
        <Text style={styles.emptyTitle}>No protocols yet</Text>
        <Text style={styles.emptySubtitle}>
          Create a protocol to track your dosing schedule and adherence.
        </Text>
      </View>
    ),
    [],
  );

  if (isLoading && protocols.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading fullScreen message="Loading protocols..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={[...activeProtocols, ...inactiveProtocols]}
        keyExtractor={(item) => item.id}
        renderItem={renderProtocolItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  sectionSpacer: {
    height: spacing.xl,
  },
  protocolCard: {
    marginBottom: spacing.base,
  },
  protocolHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  protocolInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  protocolName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  protocolDetail: {
    ...typography.small,
    color: colors.text.secondary,
  },
  adherenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  adherenceBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface.default,
    overflow: "hidden",
  },
  adherenceFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primary[500],
  },
  adherenceText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.primary[400],
    width: 40,
    textAlign: "right",
  },
  todayActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  todayLogged: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  todayLoggedText: {
    ...typography.small,
    color: colors.primary[500],
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing["5xl"],
    paddingHorizontal: spacing["2xl"],
  },
  emptyIcon: {
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
  },
});
