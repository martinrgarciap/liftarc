import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import WorkoutDayCard from "../../src/components/program/WorkoutDayCard";
import {
  CurrentProgramResponse,
  ExerciseListItem,
  ProgramDay,
  ProgramExercise,
  addExerciseToWorkoutDay,
  addWorkoutDay,
  createStarterProgram,
  fetchCurrentProgram,
  fetchExercises,
  getDayExercises,
  getExerciseName,
  getExerciseRepRange,
  getExerciseSetValue,
  getProgramDayExerciseId,
  getProgramDayId,
  getProgramDays,
  getProgramId,
  updateProgramDayExercise,
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
  success: "#4ADE80",
  inputBg: "#12161D",
};

const STARTER_PROGRAM_PAYLOAD: CreateProgramRequest = {
  name: "Starter Program",
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

function getDefaultRepValues(exercise: ProgramExercise) {
  if (
    typeof exercise.prescribedRepsMin === "number" &&
    typeof exercise.prescribedRepsMax === "number"
  ) {
    return {
      min: exercise.prescribedRepsMin,
      max: exercise.prescribedRepsMax,
    };
  }

  const repRange = getExerciseRepRange(exercise);

  if (repRange) {
    const rangeMatch = repRange.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      return {
        min: Number(rangeMatch[1]),
        max: Number(rangeMatch[2]),
      };
    }

    const singleMatch = repRange.match(/^(\d+)$/);
    if (singleMatch) {
      const value = Number(singleMatch[1]);
      return { min: value, max: value };
    }
  }

  return { min: 8, max: 10 };
}

export default function ProgramScreen() {
  const [program, setProgram] = useState<CurrentProgramResponse | null>(null);
  const [exerciseList, setExerciseList] = useState<ExerciseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [creatingStarter, setCreatingStarter] = useState(false);
  const [creatingDay, setCreatingDay] = useState(false);
  const [addingExerciseDayId, setAddingExerciseDayId] = useState<number | null>(
    null,
  );
  const [updatingExerciseId, setUpdatingExerciseId] = useState<number | null>(
    null,
  );
  const [exercisePickerDayId, setExercisePickerDayId] = useState<number | null>(
    null,
  );

  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");

  const [newDayName, setNewDayName] = useState("");

  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(
    null,
  );
  const [editSets, setEditSets] = useState("3");
  const [editMinReps, setEditMinReps] = useState("8");
  const [editMaxReps, setEditMaxReps] = useState("10");

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

  const loadExercises = useCallback(async () => {
    try {
      setLoadingExercises(true);
      const data = await fetchExercises();
      setExerciseList(data);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Failed to load exercises.",
      );
    } finally {
      setLoadingExercises(false);
    }
  }, []);

  useEffect(() => {
    loadProgram();
    loadExercises();
  }, [loadProgram, loadExercises]);

  const resetEditor = () => {
    setEditingExerciseId(null);
    setEditSets("3");
    setEditMinReps("8");
    setEditMaxReps("10");
  };

  const handleCreateStarterProgram = async () => {
    try {
      setCreatingStarter(true);
      setErrorText("");
      setInfoText("");
      await createStarterProgram(STARTER_PROGRAM_PAYLOAD);
      await loadProgram();
      setInfoText("Starter program created.");
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Failed to create starter program.",
      );
    } finally {
      setCreatingStarter(false);
    }
  };

  const handleCreateWorkoutDay = async () => {
    const programId = getProgramId(program);

    if (!programId) {
      setErrorText("Create or load a program before adding a workout day.");
      return;
    }

    try {
      setCreatingDay(true);
      setErrorText("");
      setInfoText("");

      const name = newDayName.trim() || `Workout Day ${workoutDays.length + 1}`;

      await addWorkoutDay(programId, {
        position: workoutDays.length + 1,
        name,
        notes: "",
      });

      setNewDayName("");
      await loadProgram();
      setInfoText(`Added ${name}.`);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Failed to add workout day.",
      );
    } finally {
      setCreatingDay(false);
    }
  };

  const handleOpenExercisePicker = async (day: ProgramDay) => {
    const dayId = getProgramDayId(day);

    if (!dayId) {
      setErrorText("Could not determine workout day id.");
      return;
    }

    setErrorText("");
    setInfoText("");
    setExercisePickerDayId(dayId);

    if (exerciseList.length === 0) {
      await loadExercises();
    }
  };

  const handleAddExercise = async (
    day: ProgramDay,
    exercise: ExerciseListItem,
  ) => {
    const dayId = getProgramDayId(day);

    if (!dayId) {
      setErrorText("Could not determine workout day id.");
      return;
    }

    try {
      setAddingExerciseDayId(dayId);
      setErrorText("");
      setInfoText("");

      await addExerciseToWorkoutDay(dayId, {
        exerciseId: exercise.id,
        position: getDayExercises(day).length + 1,
        prescribedSets: 3,
        prescribedRepsMin: 8,
        prescribedRepsMax: 10,
        notes: "",
      });

      setExercisePickerDayId(null);
      await loadProgram();
      setInfoText(`${exercise.name} added.`);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Failed to add exercise.",
      );
    } finally {
      setAddingExerciseDayId(null);
    }
  };

  const handleStartEditExercise = (exercise: ProgramExercise) => {
    const exerciseId = getProgramDayExerciseId(exercise);

    if (!exerciseId) {
      setErrorText("Could not determine program day exercise id.");
      return;
    }

    const repValues = getDefaultRepValues(exercise);

    setErrorText("");
    setInfoText("");
    setExercisePickerDayId(null);
    setEditingExerciseId(exerciseId);
    setEditSets(String(getExerciseSetValue(exercise) ?? 3));
    setEditMinReps(String(repValues.min));
    setEditMaxReps(String(repValues.max));
  };

  const handleSaveExercise = async (exercise: ProgramExercise) => {
    const exerciseId = getProgramDayExerciseId(exercise);

    if (!exerciseId) {
      setErrorText("Could not determine program day exercise id.");
      return;
    }

    const prescribedSets = Number(editSets);
    const prescribedRepsMin = Number(editMinReps);
    const prescribedRepsMax = Number(editMaxReps);

    if (
      !Number.isFinite(prescribedSets) ||
      !Number.isFinite(prescribedRepsMin) ||
      !Number.isFinite(prescribedRepsMax) ||
      prescribedSets <= 0 ||
      prescribedRepsMin <= 0 ||
      prescribedRepsMax <= 0
    ) {
      setErrorText("Sets and reps must be valid numbers greater than zero.");
      return;
    }

    if (prescribedRepsMax < prescribedRepsMin) {
      setErrorText("Max reps cannot be lower than min reps.");
      return;
    }

    try {
      setUpdatingExerciseId(exerciseId);
      setErrorText("");
      setInfoText("");

      await updateProgramDayExercise(exerciseId, {
        prescribedSets,
        prescribedRepsMin,
        prescribedRepsMax,
        notes: exercise.notes ?? "",
      });

      await loadProgram();
      resetEditor();
      setInfoText(`${getExerciseName(exercise)} updated.`);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Failed to update exercise.",
      );
    } finally {
      setUpdatingExerciseId(null);
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
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Program Builder</Text>
        <Text style={styles.screenSubtitle}>
          Day 5 MVP. Test the new backend endpoints first, keep the UI simple.
        </Text>
      </View>

      {!!errorText && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{errorText}</Text>
          <Pressable style={styles.secondaryButton} onPress={loadProgram}>
            <Text style={styles.secondaryButtonText}>Reload Program</Text>
          </Pressable>
        </View>
      )}

      {!!infoText && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>{infoText}</Text>
        </View>
      )}

      {!program ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No current program yet</Text>
          <Text style={styles.emptyText}>
            Create a starter program first, then test Day 5 builder actions on
            it.
          </Text>
          <Pressable
            onPress={handleCreateStarterProgram}
            disabled={creatingStarter}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !creatingStarter ? styles.buttonPressed : null,
              creatingStarter ? styles.buttonDisabled : null,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {creatingStarter
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
            <Text style={styles.programMeta}>
              Exercise list:{" "}
              {loadingExercises
                ? "loading..."
                : `${exerciseList.length} loaded from GET /api/exercises`}
            </Text>
          </View>

          <View style={styles.utilityCard}>
            <Text style={styles.utilityTitle}>Add workout day</Text>
            <TextInput
              value={newDayName}
              onChangeText={setNewDayName}
              placeholder="Example: Pull Day"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <Pressable
              onPress={handleCreateWorkoutDay}
              disabled={creatingDay}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !creatingDay ? styles.buttonPressed : null,
                creatingDay ? styles.buttonDisabled : null,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {creatingDay ? "Adding Workout Day..." : "Add Workout Day"}
              </Text>
            </Pressable>
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
              {workoutDays.map((day, index) => {
                const dayId = getProgramDayId(day);
                const editingExerciseForDay =
                  getDayExercises(day).find(
                    (exercise) =>
                      getProgramDayExerciseId(exercise) === editingExerciseId,
                  ) ?? null;

                return (
                  <View key={String(day.id ?? `${index}-${day.name ?? "day"}`)}>
                    <WorkoutDayCard
                      day={day}
                      index={index}
                      onAddExercisePress={handleOpenExercisePicker}
                      onEditExercisePress={handleStartEditExercise}
                      selectedExerciseId={editingExerciseId}
                    />

                    {dayId !== null && exercisePickerDayId === dayId ? (
                      <View style={styles.utilityCard}>
                        <Text style={styles.utilityTitle}>
                          Pick an exercise
                        </Text>

                        {loadingExercises ? (
                          <View style={styles.centerRow}>
                            <ActivityIndicator color={colors.accent} />
                            <Text style={styles.utilityText}>
                              Loading exercises...
                            </Text>
                          </View>
                        ) : exerciseList.length === 0 ? (
                          <Text style={styles.utilityText}>
                            No exercises returned yet from GET /api/exercises.
                          </Text>
                        ) : (
                          <View style={styles.exercisePickerList}>
                            {exerciseList.map((exercise) => (
                              <Pressable
                                key={exercise.id}
                                onPress={() => handleAddExercise(day, exercise)}
                                disabled={addingExerciseDayId === dayId}
                                style={({ pressed }) => [
                                  styles.exerciseOption,
                                  pressed ? styles.buttonPressed : null,
                                ]}
                              >
                                <Text style={styles.exerciseOptionText}>
                                  {exercise.name}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}

                        <Pressable
                          onPress={() => setExercisePickerDayId(null)}
                          style={styles.secondaryButton}
                        >
                          <Text style={styles.secondaryButtonText}>Close</Text>
                        </Pressable>
                      </View>
                    ) : null}

                    {editingExerciseForDay ? (
                      <View style={styles.utilityCard}>
                        <Text style={styles.utilityTitle}>
                          Edit {getExerciseName(editingExerciseForDay)}
                        </Text>

                        <View style={styles.fieldRow}>
                          <View style={styles.fieldCol}>
                            <Text style={styles.fieldLabel}>Sets</Text>
                            <TextInput
                              value={editSets}
                              onChangeText={setEditSets}
                              keyboardType="number-pad"
                              style={styles.input}
                              placeholder="3"
                              placeholderTextColor={colors.muted}
                            />
                          </View>

                          <View style={styles.fieldCol}>
                            <Text style={styles.fieldLabel}>Min reps</Text>
                            <TextInput
                              value={editMinReps}
                              onChangeText={setEditMinReps}
                              keyboardType="number-pad"
                              style={styles.input}
                              placeholder="8"
                              placeholderTextColor={colors.muted}
                            />
                          </View>

                          <View style={styles.fieldCol}>
                            <Text style={styles.fieldLabel}>Max reps</Text>
                            <TextInput
                              value={editMaxReps}
                              onChangeText={setEditMaxReps}
                              keyboardType="number-pad"
                              style={styles.input}
                              placeholder="10"
                              placeholderTextColor={colors.muted}
                            />
                          </View>
                        </View>

                        <View style={styles.actionRow}>
                          <Pressable
                            onPress={() =>
                              handleSaveExercise(editingExerciseForDay)
                            }
                            disabled={
                              updatingExerciseId ===
                              getProgramDayExerciseId(editingExerciseForDay)
                            }
                            style={({ pressed }) => [
                              styles.primaryButton,
                              styles.flexButton,
                              pressed ? styles.buttonPressed : null,
                            ]}
                          >
                            <Text style={styles.primaryButtonText}>
                              {updatingExerciseId ===
                              getProgramDayExerciseId(editingExerciseForDay)
                                ? "Saving..."
                                : "Save Changes"}
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={resetEditor}
                            style={[styles.secondaryButton, styles.flexButton]}
                          >
                            <Text style={styles.secondaryButtonText}>
                              Cancel
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}
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
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  infoCard: {
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.24)",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  infoText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
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
    marginBottom: 4,
  },
  utilityCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  utilityTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  utilityText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldCol: {
    flex: 1,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  flexButton: {
    flex: 1,
  },
  exercisePickerList: {
    gap: 10,
    marginBottom: 14,
  },
  exerciseOption: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  exerciseOptionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
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
