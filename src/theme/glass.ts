/**
 * Liquid-glass material tokens for the peptide detail surface.
 * Colors stay translucent so atmospheric background light can read through.
 */

export type GlassTint = "neutral" | "teal" | "amber" | "purple";
export type GlassIntensity = "subtle" | "regular" | "prominent";

/**
 * Resolved paint values for a single glass material.
 */
export interface GlassPalette {
  /** Upper fill of the glass body */
  fillTop: string;
  /** Mid fill used on taller surfaces */
  fillMid: string;
  /** Lower fill of the glass body */
  fillBottom: string;
  /** Bright top edge (specular lip) */
  borderTop: string;
  /** Side edge catch-light */
  borderSide: string;
  /** Recessed bottom edge */
  borderBottom: string;
  /** Soft inner highlight wash */
  highlight: string;
  /** Ambient glow color behind the surface */
  glow: string;
}

/**
 * Shadow recipe applied around a glass surface.
 */
export interface GlassShadow {
  /** iOS shadow color */
  shadowColor: string;
  /** Vertical offset in points */
  shadowOffsetY: number;
  /** Shadow blur radius */
  shadowRadius: number;
  /** Shadow opacity from 0-1 */
  shadowOpacity: number;
  /** Android elevation */
  elevation: number;
}

/**
 * Corner radius and padding for a glass intensity.
 */
export interface GlassMetrics {
  /** Outer corner radius */
  radius: number;
  /** Default inner padding */
  padding: number;
}

/**
 * Returns the translucent paint set for a glass tint.
 *
 * @param tint - Semantic glass tint
 * @returns Palette used to paint the surface
 * @throws Never throws; unknown tints fail at compile time via `never`
 */
export function getGlassPalette(tint: GlassTint): GlassPalette {
  switch (tint) {
    case "neutral":
      return {
        fillTop: "rgba(255, 255, 255, 0.14)",
        fillMid: "rgba(255, 255, 255, 0.07)",
        fillBottom: "rgba(255, 255, 255, 0.03)",
        borderTop: "rgba(255, 255, 255, 0.38)",
        borderSide: "rgba(255, 255, 255, 0.16)",
        borderBottom: "rgba(255, 255, 255, 0.06)",
        highlight: "rgba(255, 255, 255, 0.28)",
        glow: "rgba(186, 210, 220, 0.35)",
      };
    case "teal":
      return {
        fillTop: "rgba(140, 198, 172, 0.28)",
        fillMid: "rgba(91, 138, 114, 0.16)",
        fillBottom: "rgba(91, 138, 114, 0.06)",
        borderTop: "rgba(210, 236, 222, 0.5)",
        borderSide: "rgba(140, 198, 172, 0.28)",
        borderBottom: "rgba(91, 138, 114, 0.12)",
        highlight: "rgba(220, 245, 232, 0.32)",
        glow: "rgba(91, 138, 114, 0.45)",
      };
    case "amber":
      return {
        fillTop: "rgba(232, 196, 120, 0.26)",
        fillMid: "rgba(212, 160, 74, 0.14)",
        fillBottom: "rgba(212, 160, 74, 0.05)",
        borderTop: "rgba(255, 230, 176, 0.48)",
        borderSide: "rgba(232, 196, 120, 0.26)",
        borderBottom: "rgba(212, 160, 74, 0.12)",
        highlight: "rgba(255, 236, 196, 0.3)",
        glow: "rgba(212, 160, 74, 0.4)",
      };
    case "purple":
      return {
        fillTop: "rgba(180, 160, 250, 0.26)",
        fillMid: "rgba(139, 92, 246, 0.14)",
        fillBottom: "rgba(139, 92, 246, 0.05)",
        borderTop: "rgba(220, 210, 255, 0.48)",
        borderSide: "rgba(180, 160, 250, 0.26)",
        borderBottom: "rgba(139, 92, 246, 0.12)",
        highlight: "rgba(232, 224, 255, 0.3)",
        glow: "rgba(139, 92, 246, 0.4)",
      };
    default: {
      const _exhaustive: never = tint;
      throw new Error(`Unhandled glass tint: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Returns the outer shadow recipe for a glass intensity.
 *
 * @param intensity - Visual weight of the surface
 * @param glow - Ambient glow color from the palette
 * @returns Shadow values for iOS and Android
 * @throws Never throws; unknown intensities fail at compile time via `never`
 */
export function getGlassShadow(intensity: GlassIntensity, glow: string): GlassShadow {
  switch (intensity) {
    case "subtle":
      return {
        shadowColor: glow,
        shadowOffsetY: 4,
        shadowRadius: 10,
        shadowOpacity: 0.18,
        elevation: 2,
      };
    case "regular":
      return {
        shadowColor: glow,
        shadowOffsetY: 10,
        shadowRadius: 22,
        shadowOpacity: 0.32,
        elevation: 6,
      };
    case "prominent":
      return {
        shadowColor: glow,
        shadowOffsetY: 16,
        shadowRadius: 32,
        shadowOpacity: 0.42,
        elevation: 10,
      };
    default: {
      const _exhaustive: never = intensity;
      throw new Error(`Unhandled glass intensity: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Returns corner radius and default padding for a glass intensity.
 *
 * @param intensity - Visual weight of the surface
 * @returns Layout metrics for the surface shell
 * @throws Never throws; unknown intensities fail at compile time via `never`
 */
export function getGlassMetrics(intensity: GlassIntensity): GlassMetrics {
  switch (intensity) {
    case "subtle":
      return { radius: 16, padding: 12 };
    case "regular":
      return { radius: 22, padding: 20 };
    case "prominent":
      return { radius: 28, padding: 22 };
    default: {
      const _exhaustive: never = intensity;
      throw new Error(`Unhandled glass intensity: ${String(_exhaustive)}`);
    }
  }
}
