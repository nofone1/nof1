/**
 * Spacing scale for consistent layout.
 * Based on 4px base unit with generous spacing for premium feel.
 */

export const spacing = {
  /** 4px - Minimal spacing */
  xs: 4,
  /** 8px - Tight spacing */
  sm: 8,
  /** 12px - Compact spacing */
  md: 12,
  /** 16px - Default spacing */
  base: 16,
  /** 20px - Comfortable spacing */
  lg: 20,
  /** 24px - Generous spacing */
  xl: 24,
  /** 32px - Section spacing */
  "2xl": 32,
  /** 40px - Large section spacing */
  "3xl": 40,
  /** 48px - Extra large spacing */
  "4xl": 48,
  /** 64px - Maximum spacing */
  "5xl": 64,
} as const;

export type SpacingKey = keyof typeof spacing;
