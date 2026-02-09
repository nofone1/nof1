/**
 * Typography presets for consistent text styling.
 * Inspired by Waking Up app - light weights, generous letter spacing.
 */

import { TextStyle } from "react-native";

export const typography = {
  /** Large page titles - 32px, medium weight */
  heading1: {
    fontSize: 32,
    fontWeight: "500",
    letterSpacing: -0.5,
    lineHeight: 40,
  } as TextStyle,

  /** Section titles - 24px, medium weight */
  heading2: {
    fontSize: 24,
    fontWeight: "500",
    letterSpacing: -0.3,
    lineHeight: 32,
  } as TextStyle,

  /** Card titles - 20px, medium weight */
  heading3: {
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: -0.2,
    lineHeight: 28,
  } as TextStyle,

  /** Subtitles - 18px, regular weight */
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 26,
  } as TextStyle,

  /** Body text - 16px, light weight */
  body: {
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 0.2,
    lineHeight: 24,
  } as TextStyle,

  /** Body text medium - 16px, regular weight */
  bodyMedium: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.1,
    lineHeight: 24,
  } as TextStyle,

  /** Small text - 14px, light weight */
  small: {
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: 0.2,
    lineHeight: 20,
  } as TextStyle,

  /** Caption text - 13px, uppercase, extra letter spacing */
  caption: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1.2,
    lineHeight: 18,
    textTransform: "uppercase",
  } as TextStyle,

  /** Tiny caption - 11px, uppercase */
  captionSmall: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    lineHeight: 14,
    textTransform: "uppercase",
  } as TextStyle,

  /** Large display numbers */
  displayLarge: {
    fontSize: 48,
    fontWeight: "300",
    letterSpacing: -1,
    lineHeight: 56,
  } as TextStyle,

  /** Medium display numbers */
  displayMedium: {
    fontSize: 36,
    fontWeight: "300",
    letterSpacing: -0.5,
    lineHeight: 44,
  } as TextStyle,

  /** Button text - 15px, medium weight */
  button: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
    lineHeight: 20,
  } as TextStyle,

  /** Button text small - 14px */
  buttonSmall: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
    lineHeight: 18,
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
