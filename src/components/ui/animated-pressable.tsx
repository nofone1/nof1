/**
 * Animated pressable component with scale animation and haptic feedback.
 * Base component for all interactive elements in the app.
 *
 * @param onPress - Callback when pressed
 * @param disabled - Whether the pressable is disabled
 * @param haptic - Type of haptic feedback (default: "light")
 * @param scaleValue - Scale value when pressed (default: 0.97)
 * @param children - Child elements
 */

import React, { useCallback } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export type HapticType = "light" | "medium" | "heavy" | "none";

export interface AnimatedPressableProps {
  /** Callback when pressed */
  onPress?: () => void;
  /** Whether the pressable is disabled */
  disabled?: boolean;
  /** Type of haptic feedback */
  haptic?: HapticType;
  /** Scale value when pressed (0-1) */
  scaleValue?: number;
  /** Style for the container */
  style?: StyleProp<ViewStyle>;
  /** Child elements */
  children: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
}

const springConfig = {
  damping: 15,
  stiffness: 400,
  mass: 0.5,
};

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

/**
 * Triggers haptic feedback based on the specified type.
 *
 * @param type - The type of haptic feedback to trigger
 */
function triggerHaptic(type: HapticType): void {
  if (type === "none") return;

  const impactMap: Record<Exclude<HapticType, "none">, Haptics.ImpactFeedbackStyle> = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };

  Haptics.impactAsync(impactMap[type]);
}

export function AnimatedPressable({
  onPress,
  disabled = false,
  haptic = "light",
  scaleValue = 0.97,
  style,
  children,
  testID,
}: AnimatedPressableProps): React.JSX.Element {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, springConfig);
  }, [scale, scaleValue]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfig);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    triggerHaptic(haptic);
    onPress?.();
  }, [disabled, haptic, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableView
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[style, animatedStyle, disabled && { opacity: 0.5 }]}
      testID={testID}
    >
      {children}
    </AnimatedPressableView>
  );
}
