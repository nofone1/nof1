/** In-app legal and medical-safety disclosures. */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable, Icon } from "@/components/ui";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";

const LAST_UPDATED = "August 23, 2026";
const SUPPORT_EMAIL = "anam@revyl.ai";

interface LegalSection {
  heading: string;
  body: string;
}

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "Information we collect",
    body: "We process account information such as your name, email address, and account identifier; content you choose to enter such as experiments, protocols, dose logs, metrics, notes, schedules, and stack items; subscription identifiers and entitlement status; and technical information needed to secure, operate, and troubleshoot the app. If you connect a health service, the app may process the health and activity information you authorize that service to provide.",
  },
  {
    heading: "How we use information",
    body: "We use this information to provide account sync, tracking, analysis, reminders, subscription access, support, security, and product reliability. We do not sell personal information or use health information for advertising.",
  },
  {
    heading: "Service providers",
    body: "We use service providers to operate the app, including Clerk for authentication, Convex for synced application data, RevenueCat and Apple or Google for in-app subscriptions, Whop for connected web memberships, and Terra or the health platform you choose for optional health connections. Each provider processes information under its own terms and privacy commitments.",
  },
  {
    heading: "Storage and retention",
    body: "Some settings and cached records are stored on your device. Signed-in experiment, protocol, tracking, and billing-access records can be stored in our cloud systems so they sync across devices. We retain information while your account is active and as reasonably necessary for security, legal, tax, dispute, and transaction-record obligations.",
  },
  {
    heading: "Your choices and deletion",
    body: "You can disconnect optional health or Whop connections and delete individual records in the app. You can permanently delete your Nof1 account from Profile. Account deletion removes app-owned cloud records and local app data; payment processors and app stores may retain transaction records when legally required.",
  },
  {
    heading: "Security and age",
    body: "We use reasonable safeguards, but no storage or transmission system is completely secure. Nof1 is intended only for adults age 18 or older and is not directed to children.",
  },
  {
    heading: "Contact",
    body: `Questions or privacy requests can be sent to ${SUPPORT_EMAIL}.`,
  },
];

const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "Eligibility and acceptance",
    body: "You must be at least 18 years old to use Nof1. By creating an account or using the app, you agree to these Terms and the Privacy Policy.",
  },
  {
    heading: "Educational tracking tool",
    body: "Nof1 is an informational and self-tracking tool. It is not a medical device, healthcare provider, pharmacy, or substitute for professional medical judgment. The app does not diagnose, treat, cure, or prevent any disease and does not prescribe a dose, treatment, or course of action.",
  },
  {
    heading: "Medical decisions",
    body: "Consult a qualified healthcare professional before using any medication, supplement, peptide, research compound, protocol, calculation, or health intervention. Do not use app content to delay or replace medical care. For an emergency, contact local emergency services.",
  },
  {
    heading: "Subscriptions",
    body: "Nof1 Plus is offered at a target U.S. price of $9.99 per month or $79.99 per year. Your store displays and confirms the final localized price before purchase. Subscriptions renew automatically unless cancelled through the store account that processed the purchase. Deleting the app or your Nof1 account does not automatically cancel a subscription.",
  },
  {
    heading: "Your content and conduct",
    body: "You are responsible for the accuracy of information you enter and for maintaining the security of your account. You may use the app only lawfully and may not interfere with its operation, attempt unauthorized access, or misuse another person's information.",
  },
  {
    heading: "Availability and disclaimers",
    body: "The app and its content are provided on an as-available basis. Research summaries, estimates, calculations, and external-source information may be incomplete, outdated, or inaccurate. To the extent permitted by law, we disclaim implied warranties and liability for decisions made from app content.",
  },
  {
    heading: "Changes and contact",
    body: `We may update the service or these Terms and will identify material revisions by a new effective date. Questions can be sent to ${SUPPORT_EMAIL}.`,
  },
];

const MEDICAL_SECTIONS: LegalSection[] = [
  {
    heading: "Not medical advice",
    body: "Nof1 is an educational tracking application, not a medical device. It does not diagnose, treat, cure, prevent, monitor, or prescribe for any disease or condition. Information in the app is general and is not personalized medical advice.",
  },
  {
    heading: "Research compounds",
    body: "Some compounds described in the app may be investigational, unapproved for human use, prohibited in sport, or supported mainly by animal or early-stage research. Inclusion in the library is not a recommendation to obtain or use them.",
  },
  {
    heading: "Doses and calculations",
    body: "Any dose, timing, concentration, reconstitution, pharmacokinetic, or protocol information is an educational estimate and can be wrong. Never prepare, inject, ingest, stop, or change a substance based only on this app. Confirm the exact product, concentration, route, interactions, contraindications, and instructions with a licensed clinician and pharmacist.",
  },
  {
    heading: "Get professional help",
    body: "Talk with a qualified healthcare professional before beginning or changing any intervention, especially if you are pregnant, nursing, under medical care, taking medication, or managing a health condition. Contact local emergency services or poison control for urgent concerns.",
  },
];

const DOCUMENTS = {
  privacy: { title: "Privacy Policy", sections: PRIVACY_SECTIONS },
  terms: { title: "Terms of Service", sections: TERMS_SECTIONS },
  medical: { title: "Medical Safety", sections: MEDICAL_SECTIONS },
} as const;

export function LegalScreen({
  navigation,
  route,
}: MainStackScreenProps<"Legal">): React.JSX.Element {
  const document = DOCUMENTS[route.params.document];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <AnimatedPressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          haptic="light"
        >
          <Icon name="arrow-left" size={20} color={colors.primary[500]} />
          <Text style={styles.backText}>Back</Text>
        </AnimatedPressable>

        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.updated}>Last updated {LAST_UPDATED}</Text>

        {document.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingBottom: 120,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  backText: {
    ...typography.bodyMedium,
    color: colors.primary[500],
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
  },
  updated: {
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    marginBottom: spacing["2xl"],
  },
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
});
