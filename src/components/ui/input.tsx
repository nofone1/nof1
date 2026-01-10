/**
 * Reusable Input component with label and error state.
 */

import React, { forwardRef } from "react";
import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native";
import { colors } from "@/theme";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, style, ...props }, ref): React.JSX.Element => {
    const hasError = !!error;

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            hasError && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.text.tertiary}
          selectionColor={colors.primary[500]}
          {...props}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface.default,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.white,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  inputError: {
    borderColor: colors.accent.error,
  },
  error: {
    fontSize: 14,
    color: colors.accent.error,
    marginTop: 6,
  },
  hint: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 6,
  },
});
