/**
 * Profile screen.
 * Features gold avatar ring, Feather icons, and refined menu styling.
 */

import React, { useCallback } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Icon, AnimatedPressable } from "@/components/ui";
import { useLogger } from "@/hooks/use-logger";
import { useAuth, useUser, logAuthEvent } from "@/services/auth";
import { logger } from "@/services/logging";
import { colors, spacing, typography } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";

interface MenuItemProps {
  label: string;
  hint?: string;
  onPress?: () => void;
  isLast?: boolean;
  isWarning?: boolean;
}

/**
 * Menu item component for profile sections.
 */
function MenuItem({ label, hint, onPress, isLast, isWarning }: MenuItemProps): React.JSX.Element {
  const content = (
    <View style={[styles.menuItem, isLast && styles.menuItemLast]}>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuText, isWarning && styles.menuTextWarning]}>{label}</Text>
        {hint && <Text style={styles.menuHint}>{hint}</Text>}
      </View>
      {onPress && <Icon name="chevron-right" size={18} color={colors.text.muted} />}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} haptic="light">
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

/**
 * Profile screen component.
 *
 * @returns The Profile screen JSX element
 */
export function ProfileScreen({ navigation }: MainTabScreenProps<"Profile">): React.JSX.Element {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { log } = useLogger("Profile");

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          logAuthEvent("sign_out", user?.id, true);
          logger.clearContext();
          await signOut();
          log.info("User signed out successfully");
        },
      },
    ]);
  }, [user, signOut, log]);

  const handleExportLogs = useCallback(async () => {
    const logs = await logger.getStoredLogs();
    Alert.alert("Logs", `${logs.length} log entries available.`);
  }, []);

  const handleClearLogs = useCallback(() => {
    Alert.alert("Clear Logs", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await logger.clearStoredLogs();
          Alert.alert("Success", "All logs cleared.");
        },
      },
    ]);
  }, []);

  const userInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and settings</Text>
        </View>

        {/* User Card */}
        <Card variant="elevated" style={styles.userCard} animated animationDelay={0}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
          </View>
          {user?.firstName && (
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
          )}
          <Text style={styles.userEmail}>{user?.email || "No email"}</Text>
        </Card>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        <Card style={styles.menuCard} animated animationDelay={80}>
          <MenuItem label="Edit Profile" hint="Coming soon" />
          <MenuItem label="Notifications" hint="Coming soon" />
          <MenuItem label="Subscription" hint="Free Plan" isLast />
        </Card>

        {/* Features Section */}
        <Text style={styles.sectionHeader}>Features</Text>
        <Card style={styles.menuCard} animated animationDelay={160}>
          <MenuItem label="My Experiments" hint="N-of-1 trials & analysis" onPress={() => navigation.navigate("Experiments")} />
          <MenuItem label="Health Connections" hint="Apple Health, Google Fit" onPress={() => navigation.navigate("HealthConnections")} isLast />
        </Card>

        {/* Data Section */}
        <Text style={styles.sectionHeader}>Data</Text>
        <Card style={styles.menuCard} animated animationDelay={240}>
          <MenuItem label="Export Experiments" hint="Download your data" onPress={() => {}} />
          <MenuItem label="Export Logs" hint="For debugging" onPress={handleExportLogs} />
          <MenuItem label="Clear Logs" hint="Remove stored logs" onPress={handleClearLogs} isLast isWarning />
        </Card>

        {/* About Section */}
        <Text style={styles.sectionHeader}>About</Text>
        <Card style={styles.menuCard} animated animationDelay={320}>
          <MenuItem label="Version" hint="1.0.0" />
          <MenuItem label="Auth" hint="Mock (Add Clerk for production)" />
          <MenuItem label="Terms of Service" onPress={() => {}} isLast />
        </Card>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <Button variant="outline" fullWidth onPress={handleSignOut}>
            Sign Out
          </Button>
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
  userCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(91, 138, 114, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.displayMedium,
    color: colors.primary[500],
  },
  userName: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.small,
    color: colors.text.secondary,
  },
  sectionHeader: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  menuCard: {
    marginBottom: spacing.xl,
    padding: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flex: 1,
  },
  menuText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  menuTextWarning: {
    color: colors.accent.warning,
  },
  menuHint: {
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  signOutContainer: {
    marginTop: spacing.sm,
  },
  bottomSpacer: {
    height: 120,
  },
});
