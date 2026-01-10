/**
 * Theme colors for the N-of-1 app.
 * Centralized color definitions for consistent styling.
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49",
  },

  // Background colors
  background: {
    primary: "#0f172a",
    secondary: "#1e293b",
    tertiary: "#334155",
  },

  // Surface colors
  surface: {
    default: "#1e293b",
    elevated: "#334155",
  },

  // Accent colors
  accent: {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Text colors
  text: {
    primary: "#ffffff",
    secondary: "#94a3b8",
    tertiary: "#64748b",
    muted: "#475569",
  },

  // Border colors
  border: {
    default: "#334155",
    light: "#475569",
  },

  // Common
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
} as const;
