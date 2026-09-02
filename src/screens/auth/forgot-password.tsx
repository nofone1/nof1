import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable, Button, Input } from "@/components/ui";
import { getAuthErrorMessage, useSignIn } from "@/services/auth";
import { colors, spacing, typography } from "@/theme";
import type { AuthStackScreenProps } from "@/types/navigation";

export function ForgotPasswordScreen({
  navigation,
}: AuthStackScreenProps<"ForgotPassword">): React.JSX.Element {
  const { isLoaded, requestPasswordReset, completePasswordReset, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = useCallback(async () => {
    if (!isLoaded || !email.trim()) {
      setError("Enter the email address for your account.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setCodeSent(true);
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoaded, requestPasswordReset]);

  const resetPassword = useCallback(async () => {
    if (!code.trim() || password.length < 8) {
      setError("Enter the code and a new password of at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The new passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await completePasswordReset({ code: code.trim(), password });
      if (result.status !== "complete") {
        setError("Password reset needs another verification step. Contact support if this continues.");
        return;
      }
      await setActive({ session: result.createdSessionId });
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }, [code, completePasswordReset, confirmation, password, setActive]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AnimatedPressable onPress={() => navigation.goBack()} haptic="light">
            <Text style={styles.back}>Back</Text>
          </AnimatedPressable>
          <View style={styles.header}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>
              {codeSent ? "Enter the code from your email and choose a new password." : "We’ll email you a one-time reset code."}
            </Text>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          {!codeSent ? (
            <>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Button fullWidth size="lg" loading={isLoading} onPress={sendCode}>
                Send Reset Code
              </Button>
            </>
          ) : (
            <>
              <Input label="Reset Code" placeholder="Enter the code" value={code} onChangeText={setCode} keyboardType="number-pad" />
              <View style={styles.spacer} />
              <Input label="New Password" placeholder="At least 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
              <View style={styles.spacer} />
              <Input label="Confirm New Password" placeholder="Re-enter your password" value={confirmation} onChangeText={setConfirmation} secureTextEntry />
              <Button fullWidth size="lg" loading={isLoading} onPress={resetPassword}>
                Reset Password
              </Button>
              <AnimatedPressable onPress={sendCode} haptic="light" style={styles.resend}>
                <Text style={styles.back}>Send another code</Text>
              </AnimatedPressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing["2xl"] },
  back: { ...typography.bodyMedium, color: colors.primary[500] },
  header: { marginTop: spacing.xl, marginBottom: spacing["2xl"] },
  title: { ...typography.heading1, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary },
  error: { ...typography.small, color: colors.accent.error, marginBottom: spacing.lg },
  spacer: { height: spacing.lg },
  resend: { alignSelf: "center", marginTop: spacing.xl },
});
