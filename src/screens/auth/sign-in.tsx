/**
 * Sign In screen for N-of-1 app.
 * Allows users to authenticate with email/password.
 * Features clean light mode design with soft teal accents.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, AnimatedPressable } from "@/components/ui";
import { useLogger } from "@/hooks/use-logger";
import { useSignIn, getAuthErrorMessage, logAuthEvent } from "@/services/auth";
import { colors, spacing, typography } from "@/theme";
import type { AuthStackScreenProps } from "@/types/navigation";

/**
 * Sign In screen component.
 *
 * @param navigation - Navigation prop for screen transitions.
 * @returns The Sign In screen JSX element.
 */
export function SignInScreen({
  navigation,
}: AuthStackScreenProps<"SignIn">): React.JSX.Element {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { log } = useLogger("SignIn");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);
    log.info("Sign in attempt", { extra: { email } });

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        logAuthEvent("sign_in", result.createdSessionId ?? undefined, true);
        log.info("Sign in successful");
      } else {
        setError("Sign in could not be completed. Please try again.");
      }
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      log.error("Sign in failed", {}, err instanceof Error ? err : undefined);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive, log]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your experiments</Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.spacer} />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleSignIn}
          >
            Sign In
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <AnimatedPressable onPress={() => navigation.navigate("SignUp")} haptic="light">
              <Text style={styles.link}>Sign Up</Text>
            </AnimatedPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing["3xl"],
  },
  header: {
    marginBottom: spacing["4xl"],
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorBox: {
    backgroundColor: "rgba(196, 91, 91, 0.08)",
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.small,
    color: colors.accent.error,
  },
  form: {
    marginBottom: spacing["2xl"],
  },
  spacer: {
    height: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing["2xl"],
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  link: {
    ...typography.bodyMedium,
    color: colors.primary[500],
  },
});
