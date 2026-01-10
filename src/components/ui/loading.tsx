/**
 * Loading indicator component.
 */

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "@/theme";

export interface LoadingProps {
  message?: string;
  size?: "small" | "large";
  fullScreen?: boolean;
}

export function Loading({
  message,
  size = "large",
  fullScreen = false,
}: LoadingProps): React.JSX.Element {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.primary[500]} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  message: {
    color: colors.text.secondary,
    marginTop: 16,
    textAlign: "center",
  },
});
