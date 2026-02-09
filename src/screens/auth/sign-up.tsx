/**
 * Sign Up screen for N-of-1 app.
 * Allows users to create an account with email verification.
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
import { useSignUp, getAuthErrorMessage, logAuthEvent } from "@/services/auth";
import { colors, spacing, typography } from "@/theme";
import type { AuthStackScreenProps } from "@/types/navigation";

/**
 * Sign Up screen component with email verification flow.
 *
 * @param navigation - Navigation prop for screen transitions.
 * @returns The Sign Up screen JSX element.
 */
export function SignUpScreen({
  navigation,
}: AuthStackScreenProps<"SignUp">): React.JSX.Element {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { log } = useLogger("SignUp");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;

    if (!email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, email, password, confirmPassword]);

  const handleVerifyEmail = useCallback(async () => {
    if (!isLoaded) return;

    if (!verificationCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        logAuthEvent("sign_up", result.createdSessionId ?? undefined, true);
      } else {
        setError("Verification could not be completed.");
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, verificationCode, setActive]);

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
            <Text style={styles.title}>
              {pendingVerification ? "Verify your email" : "Create account"}
            </Text>
            <Text style={styles.subtitle}>
              {pendingVerification
                ? "Enter any 6-digit code (mock auth)"
                : "Start tracking your N-of-1 experiments"}
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {pendingVerification ? (
            <View style={styles.form}>
              <Input
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
              />
              <View style={styles.spacerLarge} />
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                onPress={handleVerifyEmail}
              >
                Verify Email
              </Button>
            </View>
          ) : (
            <>
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
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  hint="At least 6 characters"
                />
                <View style={styles.spacer} />
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                onPress={handleSignUp}
              >
                Create Account
              </Button>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <AnimatedPressable onPress={() => navigation.navigate("SignIn")} haptic="light">
              <Text style={styles.link}>Sign In</Text>
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
  spacerLarge: {
    height: spacing.xl,
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
