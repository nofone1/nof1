/**
 * Liquid-glass surfaces: translucent panels, luminous atmosphere, and compact pills.
 * Designed to read as iOS liquid glass over a dark, color-lit field.
 */

import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { AnimatedPressable, type HapticType } from "./animated-pressable";
import { colors, spacing } from "@/theme";
import {
  getGlassTintTokens,
  glass,
  type GlassTint,
} from "@/theme/glass";

export type { GlassTint };

export interface LiquidGlassProps {
  /** Material tint recipe */
  tint?: GlassTint;
  /** Corner radius. Defaults to the panel radius. */
  radius?: number;
  /** Inner padding. Defaults to theme large spacing. */
  padding?: number;
  /** Optional press handler. Makes the panel tappable. */
  onPress?: () => void;
  /** Haptic feedback when tappable. */
  haptic?: HapticType;
  /** Optional test identifier. */
  testID?: string;
  /** Style applied to the outer shell. */
  style?: StyleProp<ViewStyle>;
  /** Panel content. */
  children: React.ReactNode;
}

export interface GlassAtmosphereProps {
  /** Optional style override for the atmosphere layer. */
  style?: StyleProp<ViewStyle>;
}

interface AtmosphereOrbSpec {
  color: string;
  size: number;
  left: number;
  top: number;
  driftX: number;
  driftY: number;
  durationMs: number;
}

interface AtmosphereOrbProps {
  spec: AtmosphereOrbSpec;
}

type WebGlassStyle = ViewStyle & {
  backdropFilter?: string;
  WebkitBackdropFilter?: string;
};

const WEB_BACKDROP: WebGlassStyle =
  Platform.OS === "web"
    ? {
        backdropFilter: "blur(36px) saturate(180%)",
        WebkitBackdropFilter: "blur(36px) saturate(180%)",
      }
    : {};

const ATMOSPHERE_ORBS: readonly AtmosphereOrbSpec[] = [
  {
    color: "rgba(91, 138, 114, 0.38)",
    size: 280,
    left: 140,
    top: -70,
    driftX: 22,
    driftY: 16,
    durationMs: 14000,
  },
  {
    color: "rgba(139, 92, 246, 0.22)",
    size: 240,
    left: -90,
    top: 220,
    driftX: -18,
    driftY: 20,
    durationMs: 18000,
  },
  {
    color: "rgba(107, 140, 174, 0.18)",
    size: 220,
    left: 80,
    top: 560,
    driftX: 16,
    driftY: -18,
    durationMs: 16000,
  },
  {
    color: "rgba(212, 160, 74, 0.10)",
    size: 200,
    left: -40,
    top: 920,
    driftX: 14,
    driftY: 12,
    durationMs: 20000,
  },
];

/**
 * Translucent liquid-glass panel with specular edge light and tinted fill.
 *
 * Params:
 *   tint: Named material recipe. Defaults to clear.
 *   radius: Corner radius in points.
 *   padding: Inner padding in points.
 *   onPress: Optional press handler that wraps the panel in AnimatedPressable.
 *   haptic: Haptic type used when onPress is set.
 *   testID: Optional test identifier.
 *   style: Outer shell style.
 *   children: Panel content.
 *
 * Returns:
 *   The rendered glass panel.
 *
 * Edge cases:
 *   On web, CSS backdrop-filter frosts content behind the panel. On native,
 *   the material relies on translucency plus the luminous atmosphere layer.
 */
export function LiquidGlass({
  tint = "clear",
  radius = glass.radius.panel,
  padding = spacing.lg,
  onPress,
  haptic = "light",
  testID,
  style,
  children,
}: LiquidGlassProps): React.JSX.Element {
  const tokens = getGlassTintTokens(tint);
  const shellStyle: StyleProp<ViewStyle> = [
    styles.shell,
    {
      borderRadius: radius,
      borderColor: tokens.border,
      shadowColor: tokens.glow,
    },
    style,
  ];

  const body = (
    <View style={[styles.clip, { borderRadius: radius }]}>
      <LinearGradient
        colors={[...tokens.fill]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={[StyleSheet.absoluteFill, WEB_BACKDROP]}
      />
      <LinearGradient
        colors={[...tokens.specular]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 0.55 }}
        pointerEvents="none"
        style={styles.specular}
      />
      <View pointerEvents="none" style={styles.rim} />
      <View style={[styles.content, { padding }]}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        haptic={haptic}
        scaleValue={0.985}
        style={shellStyle}
        testID={testID}
      >
        {body}
      </AnimatedPressable>
    );
  }

  return (
    <View style={shellStyle} testID={testID}>
      {body}
    </View>
  );
}

/**
 * Compact glass chip used for back controls and small chrome.
 *
 * Params:
 *   tint: Named material recipe. Defaults to elevated.
 *   onPress: Optional press handler.
 *   haptic: Haptic type used when onPress is set.
 *   style: Outer shell style.
 *   children: Chip content.
 *
 * Returns:
 *   The rendered glass pill.
 */
export function GlassPill({
  tint = "elevated",
  onPress,
  haptic = "light",
  style,
  children,
}: Omit<LiquidGlassProps, "radius" | "padding">): React.JSX.Element {
  return (
    <LiquidGlass
      tint={tint}
      radius={glass.radius.pill}
      padding={0}
      onPress={onPress}
      haptic={haptic}
      style={[styles.pill, style]}
    >
      {children}
    </LiquidGlass>
  );
}

/**
 * Soft luminous orbs that sit behind glass so the material can pick up color.
 *
 * Params:
 *   style: Optional overlay style.
 *
 * Returns:
 *   A non-interactive atmosphere layer.
 */
export function GlassAtmosphere({
  style,
}: GlassAtmosphereProps): React.JSX.Element {
  return (
    <View pointerEvents="none" style={[styles.atmosphere, style]}>
      <LinearGradient
        colors={[
          "rgba(12, 18, 22, 1)",
          colors.background.primary,
          "rgba(8, 8, 12, 1)",
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {ATMOSPHERE_ORBS.map((spec, index) => (
        <AtmosphereOrb key={index} spec={spec} />
      ))}
    </View>
  );
}

/**
 * Slowly drifting color orb used by GlassAtmosphere.
 *
 * Params:
 *   spec: Size, position, color, and drift recipe.
 *
 * Returns:
 *   An animated circular glow.
 */
function AtmosphereOrb({ spec }: AtmosphereOrbProps): React.JSX.Element {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: spec.durationMs,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [progress, spec.durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, spec.driftX]) },
      { translateY: interpolate(progress.value, [0, 1], [0, spec.driftY]) },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          backgroundColor: spec.color,
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          left: spec.left,
          top: spec.top,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 8,
  },
  clip: {
    overflow: "hidden",
  },
  specular: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 92,
  },
  rim: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: StyleSheet.hairlineWidth * 2,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.38)",
  },
  content: {
    position: "relative",
  },
  pill: {
    alignSelf: "flex-start",
  },
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    opacity: 0.95,
  },
});
