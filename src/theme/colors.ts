/**
 * Theme colors for the N-of-1 app.
 * Dark mode theme with soft teal accent and purple secondary - clean and minimal.
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

  // Purple accent colors - for categories and secondary accents
  purple: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6", // main purple
    600: "#7C3AED",
    700: "#6D28D9",
    800: "#5B21B6",
    900: "#4C1D95",
    950: "#2E1065",
  },

  // Background colors - deep dark with subtle navy tint
  background: {
    primary: "#0A0B0F",   // deep dark navy
    secondary: "#111218", // slightly lighter
    tertiary: "#1A1B22",  // card backgrounds
  },

  // Surface colors - for cards and elevated elements
  surface: {
    default: "#14151A",
    elevated: "#1A1B22",
    overlay: "#22232A",
  },

  // Accent colors - muted, sophisticated
  accent: {
    success: "#5B8A72",   // sage green (same as primary)
    warning: "#D4A04A",   // warm amber
    error: "#C45B5B",     // muted rose
    info: "#6B8CAE",      // dusty blue
    purple: "#8B5CF6",    // purple accent
  },

  // Text colors - soft whites and grays
  text: {
    primary: "#EAEAEA",   // soft white
    secondary: "#8A8A8A", // medium gray
    tertiary: "#5A5A5A",  // muted gray
    muted: "#3A3A3A",     // very muted
  },

  // Border colors - ultra subtle
  border: {
    default: "rgba(255, 255, 255, 0.06)",
    light: "rgba(255, 255, 255, 0.03)",
    focus: "rgba(91, 138, 114, 0.5)", // teal glow
  },

  // Common
  white: "#FFFFFF",
  black: "#0A0B0F",
  transparent: "transparent",
} as const;
