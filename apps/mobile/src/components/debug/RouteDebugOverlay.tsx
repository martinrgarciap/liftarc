import { usePathname, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../providers/AuthProvider";

export default function RouteDebugOverlay() {
  const pathname = usePathname();
  const segments = useSegments();
  const { session, loading } = useAuth();

  useEffect(() => {
    console.log("[route] pathname:", pathname);
    console.log("[route] segments:", segments);
    console.log("[auth] loading:", loading, "session:", !!session);
  }, [pathname, segments, loading, session]);

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Text style={styles.text}>path: {pathname}</Text>
      <Text style={styles.text}>segments: {JSON.stringify(segments)}</Text>
      <Text style={styles.text}>
        auth: {loading ? "loading" : session ? "signed-in" : "signed-out"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 24,
    zIndex: 9999,
    backgroundColor: "rgba(0,0,0,0.82)",
    borderRadius: 12,
    padding: 10,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 2,
  },
});
