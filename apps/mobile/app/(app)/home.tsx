import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../src/lib/supabase";

const colors = {
  background: "#0F1115",
  surface: "#171A21",
  border: "#2A3140",
  text: "#F3F4F6",
  muted: "#9CA3AF",
  accent: "#F97316",
};

export default function HomeScreen() {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("signOut error:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>You’re signed in</Text>
        <Text style={styles.subtitle}>
          Session handling and auth gate are working.
        </Text>

        <Pressable style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 20,
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
