/**
 * Reusable Card component for content containers.
 * Features soft shadows, fade-in animation, and generous padding.
 *
 * @param variant - Card style variant (default, elevated, outlined)
 * @param onPress - Optional press handler (makes card tappable)
 * @param animated - Enable fade-in animation on mount
 * @param children - Card content
 */

import React, { useEffect } from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { AnimatedPressable } from "./animated-pressable";
import { colors, spacing } from "@/theme";

export type CardVariant = "default" | "elevated" | "outlined";

export interface CardProps extends ViewProps {
  /** Card style variant */
  variant?: CardVariant;
  /** Press handler (makes card tappable) */
  onPress?: () => void;
  /** Enable fade-in animation on mount */
  animated?: boolean;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Card content */
  children: React.ReactNode;
}

/**
 * Card component with soft shadows and optional animations.
 *
 * @example
 * <Card variant="elevated" onPress={handlePress}>
 *   <Text>Card content</Text>
 * </Card>
 */
export function Card({
  variant = "default",
  onPress,
  animated = false,
  animationDelay = 0,
  children,
  style,
  ...props
}: CardProps): React.JSX.Element {
  const opacity = useSharedValue(animated ? 0 : 1);
  const translateY = useSharedValue(animated ? 8 : 0);

  useEffect(() => {
    if (animated) {
      opacity.value = withDelay(animationDelay, withTiming(1, { duration: 400 }));
      translateY.value = withDelay(animationDelay, withTiming(0, { duration: 400 }));
    }
  }, [animated, animationDelay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const cardStyles = [styles.base, styles[variant], style];

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} style={[cardStyles, animatedStyle]} haptic="light">
        {children}
      </AnimatedPressable>
    );
  }

  if (animated) {
    return (
      <Animated.View style={[cardStyles, animatedStyle]} {...props}>
        {children}
      </Animated.View>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

/**
 * Card header section with bottom margin.
 */
export function CardHeader({
  children,
  style,
  ...props
}: ViewProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Card content section.
 */
export function CardContent({
  children,
  style,
  ...props
}: ViewProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

/**
 * Card footer section with top border.
 */
export function CardFooter({
  children,
  style,
  ...props
}: ViewProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: colors.surface.default,
    borderWidth: 0,
  },
  default: {
    backgroundColor: colors.surface.default,
  },
  elevated: {
    backgroundColor: colors.surface.elevated,
  },
  outlined: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  header: {
    marginBottom: spacing.base,
  },
  footer: {
    marginTop: spacing.lg,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
