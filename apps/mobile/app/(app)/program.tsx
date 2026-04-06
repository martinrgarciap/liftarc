import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import WorkoutDayCard from "../../src/components/program/WorkoutDayCard";
import {
  CurrentProgramResponse,
  createStarterProgram,
  fetchCurrentProgram,
  getProgramDays,
  type CreateProgramRequest,
} from "../../src/lib/api/programs";

const colors = {
  background: "#0F1115",
  surface: "#171A21",
  border: "#2A3140",
  text: "#F3F4F6",
  muted: "#9CA3AF",
  accent: "#F97316",
  danger: "#F87171",
};

const STARTER_PROGRAM_PAYLOAD: CreateProgramRequest = {
  name: "Starter Program Test A",
  description: "Week 1 base program",
  workoutDays: [
    {
      position: 1,
      name: "Push Day",
      notes: "Chest focus",
      exercises: [
        {
          exerciseId: 1,
          position: 1,
          prescribedSets: 3,
          prescribedRepsMin: 8,
          prescribedRepsMax: 10,
          notes: "Controlled reps",
        },
      ],
    },
  ],
};

export default function ProgramScreen() {
  const [program, setProgram] = useState<CurrentProgramResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorText, setErrorText] = useState("");

  const workoutDays = useMemo(() => getProgramDays(program), [program]);

  const loadProgram = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText("");

      const data = await fetchCurrentProgram();
      setProgram(data);
    } catch (error) {
      setProgram(null);
      setErrorText(
        error instanceof Error
          ? error.message
          : "Failed to load current program.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  const handleCreateStarterProgram = async () => {
    try {
      setCreating(true);
      setErrorText("");

      console.log(
        "[ProgramScreen] starter payload:",
        JSON.stringify(STARTER_PROGRAM_PAYLOAD, null, 2),
      );

      await createStarterProgram(STARTER_PROGRAM_PAYLOAD);
      await loadProgram();
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Failed to create starter program.",
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Loading program...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Program</Text>
        <Text style={styles.screenSubtitle}>
          Day 4 foundation. Keep it simple and working first.
        </Text>
      </View>

      {!!errorText && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{errorText}</Text>

          <Pressable style={styles.secondaryButton} onPress={loadProgram}>
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {!program ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No current program yet</Text>
          <Text style={styles.emptyText}>
            Create a starter program first, then we’ll render its workout days
            here.
          </Text>

          <Pressable
            onPress={handleCreateStarterProgram}
            disabled={creating}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !creating ? styles.buttonPressed : null,
              creating ? styles.buttonDisabled : null,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {creating
                ? "Creating Starter Program..."
                : "Create Starter Program"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.programCard}>
            <Text style={styles.programName}>
              {program.name ?? program.title ?? "Current Program"}
            </Text>

            <Text style={styles.programMeta}>
              {program.description?.trim()
                ? program.description
                : `${workoutDays.length} ${
                    workoutDays.length === 1 ? "workout day" : "workout days"
                  } in your current program`}
            </Text>
          </View>

          {workoutDays.length === 0 ? (
            <View style={styles.emptyDayCard}>
              <Text style={styles.emptyDayTitle}>Program created</Text>
              <Text style={styles.emptyDayText}>
                This program does not have any workout days yet.
              </Text>
            </View>
          ) : (
            <View>
              {workoutDays.map((day, index) => (
                <WorkoutDayCard
                  key={String(day.id ?? `${index}-${day.name ?? "day"}`)}
                  day={day}
                  index={index}
                />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 32,
  },
  centeredScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: colors.muted,
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  screenSubtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  errorCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  programCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  programName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  programMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  emptyDayCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
  },
  emptyDayTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyDayText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
