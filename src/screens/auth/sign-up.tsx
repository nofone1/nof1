/**
 * Sign Up screen.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "@/components/ui";
import { useLogger } from "@/hooks/use-logger";
import { useSignUp, getAuthErrorMessage, logAuthEvent } from "@/services/auth";
import { colors } from "@/theme";
import type { AuthStackScreenProps } from "@/types/navigation";

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
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: colors.accent.error,
    fontSize: 14,
  },
  form: {
    marginBottom: 32,
  },
  spacer: {
    height: 16,
  },
  spacerLarge: {
    height: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: colors.text.secondary,
  },
  link: {
    color: colors.primary[500],
    fontWeight: "600",
  },
});
