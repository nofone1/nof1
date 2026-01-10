/**
 * Reusable Card component for content containers.
 */

import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewProps,
  type TouchableOpacityProps,
} from "react-native";
import { colors } from "@/theme";

export type CardVariant = "default" | "elevated" | "outlined";

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  onPress?: TouchableOpacityProps["onPress"];
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  onPress,
  children,
  style,
  ...props
}: CardProps): React.JSX.Element {
  const cardStyles = [styles.base, styles[variant], style];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: ViewProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ children, style, ...props }: ViewProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style, ...props }: ViewProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
  },
  default: {
    backgroundColor: colors.surface.default,
  },
  elevated: {
    backgroundColor: colors.surface.elevated,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.surface.elevated,
  },
  header: {
    marginBottom: 12,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
