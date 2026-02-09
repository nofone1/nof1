/**
 * Reusable Button component with multiple variants and animated press states.
 * Features soft teal accent, pill-shaped design, and haptic feedback.
 *
 * @param variant - Button style variant (primary, secondary, outline, ghost)
 * @param size - Button size (sm, md, lg)
 * @param loading - Show loading spinner
 * @param disabled - Disable button interactions
 * @param fullWidth - Expand to full container width
 * @param children - Button text content
 */

import React from "react";
import { Text, ActivityIndicator, StyleSheet, View } from "react-native";
import { AnimatedPressable, type HapticType } from "./animated-pressable";
import { colors, spacing, typography } from "@/theme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable button interactions */
  disabled?: boolean;
  /** Expand to full container width */
  fullWidth?: boolean;
  /** Button text content */
  children: string;
  /** Press handler */
  onPress?: () => void;
  /** Haptic feedback type */
  haptic?: HapticType;
}

/**
 * Button component with animated press-in effect and haptic feedback.
 *
 * @example
 * <Button variant="primary" onPress={handleSubmit}>Submit</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onPress,
  haptic = "light",
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;

  const containerStyles = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
  ];

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      haptic={haptic}
      scaleValue={0.97}
      style={containerStyles}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? colors.white : colors.primary[500]}
            style={styles.loader}
          />
        )}
        <Text style={textStyles}>{children}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  loader: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.button,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },

  // Variants - Container
  primaryContainer: {
    backgroundColor: colors.primary[500],
  },
  secondaryContainer: {
    backgroundColor: colors.background.tertiary,
  },
  outlineContainer: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
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
    color: colors.text.primary,
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.primary[500],
  },

  // Sizes - Container (pill-shaped with generous padding)
  smContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 100,
  },
  mdContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 100,
  },
  lgContainer: {
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.base,
    borderRadius: 100,
  },

  // Sizes - Text
  smText: {
    ...typography.buttonSmall,
  },
  mdText: {
    ...typography.button,
  },
  lgText: {
    ...typography.button,
    fontSize: 16,
  },
});
