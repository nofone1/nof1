/**
 * Theme colors for the N-of-1 app.
 * Dark mode theme with soft teal accent - clean and minimal.
 */

export const colors = {
  // Primary brand colors - soft sage/teal
  primary: {
    50: "#EDF5F1",
    100: "#D4E8DE",
    200: "#B0D4C3",
    300: "#8BBFA7",
    400: "#6B9A82",
    500: "#5B8A72", // main accent
    600: "#4A7A62",
    700: "#3A6A52",
    800: "#2A5A42",
    900: "#1A4A32",
    950: "#0A3A22",
  },

  // Background colors - near black
  background: {
    primary: "#0A0A0C",   // deep black
    secondary: "#111114", // slightly lighter
    tertiary: "#1A1A1E",  // card backgrounds
  },

  // Surface colors - for cards and elevated elements
  surface: {
    default: "#141418",
    elevated: "#1A1A1E",
    overlay: "#222226",
  },

  // Accent colors - muted, sophisticated
  accent: {
    success: "#5B8A72",   // sage green (same as primary)
    warning: "#D4A04A",   // warm amber
    error: "#C45B5B",     // muted rose
    info: "#6B8CAE",      // dusty blue
  },

  // Text colors - soft whites and grays
  text: {
    primary: "#EAEAEA",   // soft white
    secondary: "#8A8A8A", // medium gray
    tertiary: "#5A5A5A",  // muted gray
    muted: "#3A3A3A",     // very muted
  },

  // Border colors - subtle
  border: {
    default: "rgba(255, 255, 255, 0.08)",
    light: "rgba(255, 255, 255, 0.04)",
    focus: "rgba(91, 138, 114, 0.5)", // teal glow
  },

  // Common
  white: "#FFFFFF",
  black: "#0A0A0C",
  transparent: "transparent",
} as const;
