/**
 * Liquid-glass material tokens for iOS-style translucent surfaces.
 * Tuned for the dark navy N-of-1 theme with sage and dusk accents.
 */

export type GlassTint = "clear" | "sage" | "amber" | "purple" | "elevated";

export interface GlassTintTokens {
  /** Layered fill colors from highlight to body */
  fill: readonly [string, string, string];
  /** Hairline edge color */
  border: string;
  /** Specular catch-light colors */
  specular: readonly [string, string, string];
  /** Outer glow tint */
  glow: string;
}

export interface GlassTintSet {
  clear: GlassTintTokens;
  sage: GlassTintTokens;
  amber: GlassTintTokens;
  purple: GlassTintTokens;
  elevated: GlassTintTokens;
}

export interface GlassTokens {
  radius: {
    panel: number;
    hero: number;
    pill: number;
    inset: number;
  };
  intensity: {
    panel: number;
    hero: number;
    compact: number;
  };
  tints: GlassTintSet;
}

/**
 * Liquid-glass radii, blur intensity hints, and per-tint color recipes.
 */
export const glass: GlassTokens = {
  radius: {
    panel: 26,
    hero: 30,
    pill: 100,
    inset: 16,
  },
  intensity: {
    panel: 42,
    hero: 54,
    compact: 36,
  },
  tints: {
    clear: {
      fill: [
        "rgba(255, 255, 255, 0.10)",
        "rgba(18, 22, 28, 0.42)",
        "rgba(10, 12, 16, 0.58)",
      ],
      border: "rgba(255, 255, 255, 0.20)",
      specular: [
        "rgba(255, 255, 255, 0.42)",
        "rgba(255, 255, 255, 0.08)",
        "rgba(255, 255, 255, 0)",
      ],
      glow: "rgba(186, 214, 202, 0.10)",
    },
    sage: {
      fill: [
        "rgba(140, 188, 164, 0.22)",
        "rgba(91, 138, 114, 0.16)",
        "rgba(16, 28, 24, 0.52)",
      ],
      border: "rgba(176, 212, 195, 0.34)",
      specular: [
        "rgba(220, 242, 230, 0.46)",
        "rgba(140, 188, 164, 0.12)",
        "rgba(140, 188, 164, 0)",
      ],
      glow: "rgba(91, 138, 114, 0.22)",
    },
    amber: {
      fill: [
        "rgba(232, 196, 120, 0.18)",
        "rgba(212, 160, 74, 0.12)",
        "rgba(36, 26, 12, 0.50)",
      ],
      border: "rgba(232, 196, 120, 0.32)",
      specular: [
        "rgba(255, 232, 186, 0.40)",
        "rgba(232, 196, 120, 0.10)",
        "rgba(232, 196, 120, 0)",
      ],
      glow: "rgba(212, 160, 74, 0.18)",
    },
    purple: {
      fill: [
        "rgba(180, 160, 246, 0.18)",
        "rgba(139, 92, 246, 0.12)",
        "rgba(24, 16, 40, 0.52)",
      ],
      border: "rgba(196, 178, 250, 0.30)",
      specular: [
        "rgba(232, 224, 255, 0.40)",
        "rgba(180, 160, 246, 0.10)",
        "rgba(180, 160, 246, 0)",
      ],
      glow: "rgba(139, 92, 246, 0.18)",
    },
    elevated: {
      fill: [
        "rgba(255, 255, 255, 0.14)",
        "rgba(28, 32, 40, 0.48)",
        "rgba(12, 14, 18, 0.62)",
      ],
      border: "rgba(255, 255, 255, 0.26)",
      specular: [
        "rgba(255, 255, 255, 0.50)",
        "rgba(255, 255, 255, 0.10)",
        "rgba(255, 255, 255, 0)",
      ],
      glow: "rgba(200, 220, 255, 0.12)",
    },
  },
} as const;

/**
 * Returns the color recipe for a glass tint.
 *
 * Params:
 *   tint: Named glass material.
 *
 * Returns:
 *   Fill, border, specular, and glow tokens for that tint.
 *
 * Edge cases:
 *   Unknown tints fail at compile time via the exhaustive `never` check.
 */
export function getGlassTintTokens(tint: GlassTint): GlassTintTokens {
  switch (tint) {
    case "clear":
      return glass.tints.clear;
    case "sage":
      return glass.tints.sage;
    case "amber":
      return glass.tints.amber;
    case "purple":
      return glass.tints.purple;
    case "elevated":
      return glass.tints.elevated;
    default: {
      const exhaustive: never = tint;
      throw new Error(`Unhandled glass tint: ${String(exhaustive)}`);
    }
  }
}
