/**
 * Icon component wrapper around @expo/vector-icons Feather set.
 * Provides consistent sizing and theming for icons throughout the app.
 *
 * @param name - Feather icon name
 * @param size - Icon size (default: 24)
 * @param color - Icon color (default: theme text primary)
 */

import React from "react";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme";

export type IconName = React.ComponentProps<typeof Feather>["name"];

export interface IconProps {
  /** Feather icon name */
  name: IconName;
  /** Icon size in pixels */
  size?: number;
  /** Icon color */
  color?: string;
  /** Style overrides */
  style?: React.ComponentProps<typeof Feather>["style"];
}

/** Preset icon sizes */
export const iconSizes = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
} as const;

/**
 * Icon component using Feather icon set.
 * Thin, elegant line icons that match the app's minimal aesthetic.
 *
 * @example
 * <Icon name="activity" size={24} color={colors.primary[500]} />
 * <Icon name="arrow-left" size={iconSizes.md} />
 */
export function Icon({
  name,
  size = 22,
  color = colors.text.primary,
  style,
}: IconProps): React.JSX.Element {
  return <Feather name={name} size={size} color={color} style={style} />;
}
