/**
 * Liquid-glass primitives used on the peptide detail screen.
 * Surfaces stay translucent so the atmospheric background refracts through.
 */

import React from "react";
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedPressable } from "./animated-pressable";
import {
  getGlassMetrics,
  getGlassPalette,
  getGlassShadow,
  type GlassIntensity,
  type GlassTint,
} from "@/theme/glass";
import { spacing } from "@/theme";

export interface GlassSurfaceProps extends ViewProps {
  /** Semantic glass tint */
  tint?: GlassTint;
  /** Visual weight of the material */
  intensity?: GlassIntensity;
  /** Press handler; when set the surface becomes tappable */
  onPress?: () => void;
  /** Optional style merged onto the outer shell */
  style?: StyleProp<ViewStyle>;
  /** Optional style merged onto the inner content wrapper */
  contentStyle?: StyleProp<ViewStyle>;
  /** Surface content */
  children: React.ReactNode;
}

export interface GlassChipProps {
  /** Semantic glass tint */
  tint?: GlassTint;
  /** Press handler for tappable chips */
  onPress?: () => void;
  /** Chip content */
  children: React.ReactNode;
  /** Optional style merged onto the chip shell */
  style?: StyleProp<ViewStyle>;
}

/**
 * Translucent glass panel with a specular lip, catch-light border, and glow.
 *
 * @param tint - Semantic glass tint. Defaults to `neutral`.
 * @param intensity - Visual weight. Defaults to `regular`.
 * @param onPress - Optional press handler that wraps the surface.
 * @param style - Style merged onto the outer shell. Can override padding/radius.
 * @param contentStyle - Style merged onto the inner content wrapper.
 * @param children - Content rendered above the glass fill.
 * @returns The rendered glass surface
 * @throws Never throws for valid tints/intensities
 */
export function GlassSurface({
  tint = "neutral",
  intensity = "regular",
  onPress,
  style,
  contentStyle,
  children,
  ...props
}: GlassSurfaceProps): React.JSX.Element {
  const palette = getGlassPalette(tint);
  const metrics = getGlassMetrics(intensity);
  const shadow = getGlassShadow(intensity, palette.glow);

  const shellStyle: ViewStyle = {
    borderRadius: metrics.radius,
    padding: metrics.padding,
    borderTopColor: palette.borderTop,
    borderLeftColor: palette.borderSide,
    borderRightColor: palette.borderSide,
    borderBottomColor: palette.borderBottom,
    shadowColor: shadow.shadowColor,
    shadowOffset: { width: 0, height: shadow.shadowOffsetY },
    shadowRadius: shadow.shadowRadius,
    shadowOpacity: shadow.shadowOpacity,
    elevation: shadow.elevation,
  };

  const body = (
    <View style={[styles.shell, shellStyle, style]} {...props}>
      <LinearGradient
        colors={[palette.fillTop, palette.fillMid, palette.fillBottom]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[palette.highlight, "rgba(255, 255, 255, 0)"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.specular}
        pointerEvents="none"
      />
      <View style={styles.rim} pointerEvents="none" />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} haptic="light" scaleValue={0.985}>
        {body}
      </AnimatedPressable>
    );
  }

  return body;
}

/**
 * Compact pill-shaped glass chip for chips, badges, and back controls.
 *
 * @param tint - Semantic glass tint. Defaults to `neutral`.
 * @param onPress - Optional press handler.
 * @param children - Chip content, typically text or an icon row.
 * @param style - Style merged onto the chip shell.
 * @returns The rendered glass chip
 */
export function GlassChip({
  tint = "neutral",
  onPress,
  children,
  style,
}: GlassChipProps): React.JSX.Element {
  return (
    <GlassSurface tint={tint} intensity="subtle" onPress={onPress} style={[styles.chip, style]}>
      {children}
    </GlassSurface>
  );
}

/**
 * Full-screen atmospheric wash that liquid-glass panels refract.
 *
 * @returns Layered orbs and a vertical dusk wash
 */
export function LiquidGlassAtmosphere(): React.JSX.Element {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#0C1218", "#0A0B0F", "#0B0A12"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbTeal}>
        <LinearGradient
          colors={["rgba(91, 138, 114, 0.55)", "rgba(91, 138, 114, 0)"]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.orbPurple}>
        <LinearGradient
          colors={["rgba(139, 92, 246, 0.38)", "rgba(139, 92, 246, 0)"]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.orbAmber}>
        <LinearGradient
          colors={["rgba(212, 160, 74, 0.22)", "rgba(212, 160, 74, 0)"]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.28 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "rgba(10, 12, 16, 0.22)",
  },
  specular: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
  },
  rim: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.42)",
    borderRadius: 1,
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: 999,
  },
  orbTeal: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 340,
    height: 340,
    borderRadius: 170,
    overflow: "hidden",
  },
  orbPurple: {
    position: "absolute",
    top: 220,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: "hidden",
  },
  orbAmber: {
    position: "absolute",
    bottom: 80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: "hidden",
  },
});
