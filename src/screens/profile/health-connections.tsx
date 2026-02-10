/**
 * Health Connections screen.
 * Manage wearable device connections via Terra.
 */

import React, { useCallback, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button, Icon, AnimatedPressable, Badge } from "@/components/ui";
import { useHealthStore } from "@/stores/health-store";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";

/**
 * Health Connections screen component.
 */
export function HealthConnectionsScreen({
  navigation,
}: MainStackScreenProps<"HealthConnections">): React.JSX.Element {
  const {
    isConnected,
    connectedProvider,
    lastSyncAt,
    isLoading,
    error,
    initialize,
    connectProvider,
    disconnect,
    syncData,
  } = useHealthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleConnectAppleHealth = useCallback(async () => {
    await connectProvider("apple_health");
  }, [connectProvider]);

  const handleConnectGoogleFit = useCallback(async () => {
    await connectProvider("google_fit");
  }, [connectProvider]);

  const handleConnectOura = useCallback(async () => {
    await connectProvider("oura");
  }, [connectProvider]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  const handleSync = useCallback(async () => {
    await syncData();
  }, [syncData]);

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
        >
          <Icon name="arrow-left" size={20} color={colors.primary[500]} />
          <Text style={styles.backText}>Back</Text>
        </AnimatedPressable>

        <View style={styles.header}>
          <Text style={styles.title}>Health Connections</Text>
          <Text style={styles.subtitle}>
            Connect your wearable to automatically track health metrics
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isConnected && (
          <Card style={styles.statusCard} variant="elevated">
            <View style={styles.statusHeader}>
              <Icon name="check-circle" size={24} color={colors.primary[500]} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Connected</Text>
                <Text style={styles.statusProvider}>
                  {connectedProvider === "apple_health" ? "Apple Health" :
                   connectedProvider === "google_fit" ? "Google Fit" : "Oura Ring"}
                </Text>
              </View>
              <Badge variant="success" size="sm">Active</Badge>
            </View>

            {lastSyncAt && (
              <Text style={styles.lastSync}>
                Last synced: {lastSyncAt.toLocaleTimeString()}
              </Text>
            )}

            <View style={styles.statusActions}>
              <Button variant="secondary" size="sm" onPress={handleSync} loading={isLoading}>
                Sync Now
              </Button>
              <Button variant="secondary" size="sm" onPress={handleDisconnect}>
                Disconnect
              </Button>
            </View>
          </Card>
        )}

        {!isConnected && (
          <>
            {Platform.OS === "ios" && (
              <Card style={styles.providerCard}>
                <View style={styles.providerHeader}>
                  <View style={styles.providerIcon}>
                    <Icon name="heart" size={24} color="#FF3B30" />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>Apple Health</Text>
                    <Text style={styles.providerDesc}>
                      Steps, heart rate, sleep, workouts, and more
                    </Text>
                  </View>
                </View>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleConnectAppleHealth}
                  loading={isLoading}
                >
                  Connect Apple Health
                </Button>
              </Card>
            )}

            {Platform.OS === "android" && (
              <Card style={styles.providerCard}>
                <View style={styles.providerHeader}>
                  <View style={styles.providerIcon}>
                    <Icon name="activity" size={24} color="#4285F4" />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>Google Fit</Text>
                    <Text style={styles.providerDesc}>
                      Steps, heart rate, sleep, workouts, and more
                    </Text>
                  </View>
                </View>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleConnectGoogleFit}
                  loading={isLoading}
                >
                  Connect Google Fit
                </Button>
              </Card>
            )}

            <Card style={styles.providerCard}>
              <View style={styles.providerHeader}>
                <View style={styles.providerIcon}>
                  <Icon name="circle" size={24} color="#D4A574" />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>Oura Ring</Text>
                  <Text style={styles.providerDesc}>
                    Sleep, readiness, HRV, temperature, and activity
                  </Text>
                </View>
              </View>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleConnectOura}
                loading={isLoading}
              >
                Connect Oura
              </Button>
            </Card>

            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="shield" size={16} color={colors.primary[400]} />
                <Text style={styles.infoText}>
                  Your health data stays on your device and is never sent to our servers.
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="refresh-cw" size={16} color={colors.primary[400]} />
                <Text style={styles.infoText}>
                  Data syncs automatically when you open the app.
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="bar-chart-2" size={16} color={colors.primary[400]} />
                <Text style={styles.infoText}>
                  Correlate your peptide usage with health metrics over time.
                </Text>
              </View>
            </Card>
          </>
        )}

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
    marginBottom: spacing.xl,
    gap: spacing.sm,
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
    backgroundColor: "rgba(196, 91, 91, 0.08)",
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.small,
    color: colors.accent.error,
  },
  statusCard: {
    marginBottom: spacing.xl,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  statusProvider: {
    ...typography.small,
    color: colors.text.secondary,
  },
  lastSync: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.base,
  },
  statusActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  providerCard: {
    marginBottom: spacing.lg,
  },
  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  providerDesc: {
    ...typography.small,
    color: colors.text.secondary,
  },
  infoCard: {
    marginTop: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  infoText: {
    ...typography.small,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: spacing["2xl"],
  },
});
