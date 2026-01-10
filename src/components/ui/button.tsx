/**
 * Reusable Button component with multiple variants and states.
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
} from "react-native";
import { colors } from "@/theme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<TouchableOpacityProps, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: string;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  style,
  ...props
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;

  const containerStyles = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.white : colors.primary[500]}
          style={styles.loader}
        />
      )}
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  loader: {
    marginRight: 8,
  },
  text: {
    fontWeight: "600",
  },

  // Variants - Container
  primaryContainer: {
    backgroundColor: colors.primary[500],
  },
  secondaryContainer: {
    backgroundColor: colors.surface.elevated,
  },
  outlineContainer: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  ghostContainer: {
    backgroundColor: colors.transparent,
  },

  // Variants - Text
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.primary[400],
  },

  // Sizes - Container
  smContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mdContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  lgContainer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },

  // Sizes - Text
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
});
