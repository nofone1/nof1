/**
 * Profile screen.
 */

import React, { useCallback } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card } from "@/components/ui";
import { useLogger } from "@/hooks/use-logger";
import { useAuth, useUser, logAuthEvent } from "@/services/auth";
import { logger } from "@/services/logging";
import { colors } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";

export function ProfileScreen({}: MainTabScreenProps<"Profile">): React.JSX.Element {
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and settings</Text>
        </View>

        <Card variant="elevated" style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
          {user?.firstName && (
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
          )}
          <Text style={styles.userEmail}>
            {user?.email || "No email"}
          </Text>
        </Card>

        <Text style={styles.sectionHeader}>Account</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Text style={styles.menuHint}>Coming soon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuHint}>Coming soon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
            <Text style={styles.menuText}>Subscription</Text>
            <Text style={styles.menuHint}>Free Plan</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionHeader}>Data</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Export Experiments</Text>
            <Text style={styles.menuHint}>Download your data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleExportLogs}>
            <Text style={styles.menuText}>Export Logs</Text>
            <Text style={styles.menuHint}>For debugging</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={handleClearLogs}>
            <Text style={styles.menuTextWarning}>Clear Logs</Text>
            <Text style={styles.menuHint}>Remove stored logs</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionHeader}>About</Text>
        <Card style={styles.menuCard}>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>Version</Text>
            <Text style={styles.menuHint}>1.0.0</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>Auth</Text>
            <Text style={styles.menuHint}>Mock (Add Clerk for production)</Text>
          </View>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
            <Text style={styles.menuText}>Terms of Service</Text>
          </TouchableOpacity>
        </Card>

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
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  userCard: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 12,
  },
  menuCard: {
    marginBottom: 24,
    padding: 0,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: colors.white,
  },
  menuTextWarning: {
    fontSize: 16,
    color: colors.accent.warning,
  },
  menuHint: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  signOutContainer: {
    marginTop: 8,
  },
  bottomSpacer: {
    height: 96,
  },
});
