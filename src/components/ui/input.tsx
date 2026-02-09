/**
 * Reusable Input component with label, error state, and focus animation.
 * Features uppercase labels, minimal styling, and animated focus border.
 *
 * @param label - Input label (displayed in uppercase)
 * @param error - Error message to display
 * @param hint - Hint text below input
 */

import React, { forwardRef, useState, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { colors, spacing, typography } from "@/theme";

export interface InputProps extends TextInputProps {
  /** Input label (displayed in uppercase) */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Hint text below input */
  hint?: string;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/**
 * Input component with animated focus state and elegant styling.
 *
 * @example
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 * />
 */
export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, style, onFocus, onBlur, ...props }, ref): React.JSX.Element => {
    const [isFocused, setIsFocused] = useState(false);
    const focusProgress = useSharedValue(0);
    const hasError = !!error;

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        focusProgress.value = withTiming(1, { duration: 200 });
        onFocus?.(e);
      },
      [focusProgress, onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        focusProgress.value = withTiming(0, { duration: 200 });
        onBlur?.(e);
      },
      [focusProgress, onBlur]
    );

    const animatedInputStyle = useAnimatedStyle(() => {
      const borderColor = hasError
        ? colors.accent.error
        : interpolateColor(
            focusProgress.value,
            [0, 1],
            ["rgba(255, 255, 255, 0.08)", colors.primary[500]]
          );

      return {
        borderColor,
      };
    });

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <AnimatedTextInput
          ref={ref}
          style={[styles.input, animatedInputStyle, style]}
          placeholderTextColor={colors.text.tertiary}
          selectionColor={colors.primary[500]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md + 2,
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
    color: colors.text.primary,
    borderWidth: 1.5,
  },
  error: {
    ...typography.small,
    color: colors.accent.error,
    marginTop: spacing.sm,
  },
  hint: {
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
});
