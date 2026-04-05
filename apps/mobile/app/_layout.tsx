import { Redirect, Slot, useSegments } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../src/providers/AuthProvider";

const colors = {
  background: "#0F1115",
  accent: "#F97316",
};

function RootGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const inAuthGroup = segments[0] === "(auth)";

  if (!session && !inAuthGroup) {
    return <Redirect href="/sign-in" />;
  }

  if (session && inAuthGroup) {
    return <Redirect href="/home" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
