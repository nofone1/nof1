/**
 * Badge component for status indicators and labels.
 * Pill-shaped with soft pastel background colors for light mode.
 *
 * @param variant - Badge color variant
 * @param size - Badge size (default: "md")
 * @param children - Badge text content
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  /** Badge color variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Badge text content */
  children: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: {
    bg: "rgba(255, 255, 255, 0.08)",
    text: colors.text.secondary,
  },
  primary: {
    bg: "rgba(91, 138, 114, 0.15)",
    text: colors.primary[400],
  },
  success: {
    bg: "rgba(91, 138, 114, 0.15)",
    text: colors.accent.success,
  },
  warning: {
    bg: "rgba(212, 160, 74, 0.15)",
    text: colors.accent.warning,
  },
  error: {
    bg: "rgba(196, 91, 91, 0.15)",
    text: colors.accent.error,
  },
  info: {
    bg: "rgba(107, 140, 174, 0.15)",
    text: colors.accent.info,
  },
};

const sizeStyles: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number }> = {
  sm: { paddingH: spacing.sm, paddingV: 3, fontSize: 10 },
  md: { paddingH: spacing.md, paddingV: 4, fontSize: 11 },
  lg: { paddingH: spacing.base, paddingV: 6, fontSize: 12 },
};

/**
 * Badge component for displaying status or category labels.
 *
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" size="sm">Paused</Badge>
 */
export function Badge({
  variant = "default",
  size = "md",
  children,
}: BadgeProps): React.JSX.Element {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyle.bg,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.text,
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
