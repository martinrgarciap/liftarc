import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchMe, type MeResponse } from "../../src/lib/api/me";
import { supabase } from "../../src/lib/supabase";

const colors = {
  background: "#0F1115",
  surface: "#171A21",
  border: "#2A3140",
  text: "#F3F4F6",
  muted: "#9CA3AF",
  accent: "#F97316",
  danger: "#F87171",
};

export default function HomeScreen() {
  const [loadingMe, setLoadingMe] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [errorText, setErrorText] = useState("");

  const handleLoadMe = async () => {
    try {
      setLoadingMe(true);
      setErrorText("");
      const data = await fetchMe();
      setMe(data);
    } catch (error) {
      setMe(null);
      setErrorText(
        error instanceof Error ? error.message : "Failed to load /api/me",
      );
    } finally {
      setLoadingMe(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>LiftArc Day 3</Text>
        <Text style={styles.subtitle}>
          Temporary backend integration test using the Supabase access token.
        </Text>

        <Pressable
          style={[styles.button, loadingMe && styles.buttonDisabled]}
          onPress={handleLoadMe}
          disabled={loadingMe}
        >
          <Text style={styles.buttonText}>
            {loadingMe ? "Loading /api/me..." : "Call /api/me"}
          </Text>
        </Pressable>

        {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}

        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Response</Text>
          <Text style={styles.responseText}>
            {me ? JSON.stringify(me, null, 2) : "No response loaded yet."}
          </Text>
        </View>

        <Pressable style={styles.secondaryButton} onPress={handleSignOut}>
          <Text style={styles.secondaryButtonText}>Log Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 14,
  },
  responseBox: {
    backgroundColor: "#12161D",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  responseLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  responseText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Courier",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
