/**
 * Loading indicator component with pulsing animation.
 * Features soft teal color and elegant fade-in effect.
 *
 * @param message - Optional loading message
 * @param size - Indicator size (small, large)
 * @param fullScreen - Fill entire container
 */

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { colors, spacing, typography } from "@/theme";

export interface LoadingProps {
  /** Optional loading message */
  message?: string;
  /** Indicator size */
  size?: "small" | "large";
  /** Fill entire container */
  fullScreen?: boolean;
}

/**
 * Loading component with pulsing teal circle animation.
 *
 * @example
 * <Loading message="Loading experiments..." fullScreen />
 * <Loading size="small" />
 */
export function Loading({
  message,
  size = "large",
  fullScreen = false,
}: LoadingProps): React.JSX.Element {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  const circleSize = size === "large" ? 48 : 32;
  const innerSize = size === "large" ? 20 : 14;

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <Animated.View
        style={[
          styles.circle,
          { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
          ]}
        />
      </Animated.View>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["2xl"],
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  circle: {
    backgroundColor: "rgba(91, 138, 114, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    backgroundColor: colors.primary[500],
  },
  message: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
