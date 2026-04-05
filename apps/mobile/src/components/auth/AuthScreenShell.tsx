import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export const authColors = {
  background: "#0F1115",
  surface: "#171A21",
  surfaceAlt: "#1E232D",
  border: "#2A3140",
  text: "#F3F4F6",
  muted: "#9CA3AF",
  accent: "#F97316",
  accentSoft: "rgba(249, 115, 22, 0.14)",
  danger: "#F87171",
  success: "#4ADE80",
  inputBg: "#12161D",
};

export default function AuthScreenShell({
  title,
  subtitle,
  children,
}: AuthScreenShellProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandWrap}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>LiftArc</Text>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.card}>{children}</View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  brandWrap: {
    marginBottom: 18,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: authColors.accentSoft,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.28)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: authColors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    color: authColors.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    color: authColors.muted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 360,
  },
  card: {
    backgroundColor: authColors.surface,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  glowOne: {
    position: "absolute",
    top: -90,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(249, 115, 22, 0.12)",
  },
  glowTwo: {
    position: "absolute",
    bottom: -80,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(255, 160, 64, 0.08)",
  },
});
