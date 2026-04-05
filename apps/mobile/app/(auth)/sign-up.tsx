import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AuthScreenShell, {
  authColors,
} from "../../src/components/auth/AuthScreenShell";
import { supabase } from "../../src/lib/supabase";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");

  const handleSignUp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorText("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorText("Password should be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setErrorText("");
      setInfoText("");

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorText(error.message);
        return;
      }

      if (data.session) {
        router.replace("/home");
        return;
      }

      setInfoText("Account created. Check your email to confirm your account.");
    } catch {
      setErrorText("Something went wrong while creating your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      title="Create your account"
      subtitle="Start building your split, logging sessions, and tracking your progress in LiftArc."
    >
      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorText) setErrorText("");
              if (infoText) setInfoText("");
            }}
            placeholder="you@example.com"
            placeholderTextColor={authColors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorText) setErrorText("");
              if (infoText) setInfoText("");
            }}
            placeholder="Create a password"
            placeholderTextColor={authColors.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
        {!!infoText && <Text style={styles.infoText}>{infoText}</Text>}

        <Pressable
          onPress={handleSignUp}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            pressed && !loading ? styles.buttonPressed : null,
            loading ? styles.buttonDisabled : null,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/sign-in" style={styles.linkText}>
            Sign In
          </Link>
        </View>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: authColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: authColors.inputBg,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: authColors.text,
    fontSize: 15,
  },
  errorText: {
    color: authColors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  infoText: {
    color: authColors.success,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 4,
    backgroundColor: authColors.accent,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  footerRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  footerText: {
    color: authColors.muted,
    fontSize: 14,
  },
  linkText: {
    color: authColors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
});
