import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ProgramDay,
  ProgramExercise,
  getDayExercises,
  getDayTitle,
  getExerciseMeta,
  getExerciseName,
  getProgramDayExerciseId,
} from "../../lib/api/programs";

type WorkoutDayCardProps = {
  day: ProgramDay;
  index: number;
  onAddExercisePress?: (day: ProgramDay) => void;
  onEditExercisePress?: (exercise: ProgramExercise) => void;
  selectedExerciseId?: number | null;
};

const colors = {
  surface: "#171A21",
  border: "#2A3140",
  text: "#F3F4F6",
  muted: "#9CA3AF",
  accent: "#F97316",
  accentSoft: "rgba(249, 115, 22, 0.12)",
  accentBorder: "rgba(249, 115, 22, 0.28)",
  accentText: "#F97316",
};

export default function WorkoutDayCard({
  day,
  index,
  onAddExercisePress,
  onEditExercisePress,
  selectedExerciseId,
}: WorkoutDayCardProps) {
  const exercises = getDayExercises(day);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>{getDayTitle(day, index)}</Text>
          <Text style={styles.subtleText}>
            {exercises.length}{" "}
            {exercises.length === 1 ? "exercise" : "exercises"}
          </Text>
        </View>

        <Pressable
          onPress={() => onAddExercisePress?.(day)}
          style={({ pressed }) => [
            styles.addButton,
            pressed ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </Pressable>
      </View>

      {exercises.length === 0 ? (
        <Text style={styles.emptyText}>No exercises added yet.</Text>
      ) : (
        <View style={styles.exerciseList}>
          {exercises.map((exercise, exerciseIndex) => {
            const key = String(
              exercise.id ??
                exercise.exerciseId ??
                `${index}-${exerciseIndex}-${getExerciseName(exercise)}`,
            );

            const exerciseId = getProgramDayExerciseId(exercise);
            const meta = getExerciseMeta(exercise);
            const isSelected =
              exerciseId !== null && selectedExerciseId === exerciseId;

            return (
              <View
                key={key}
                style={[
                  styles.exerciseRow,
                  isSelected ? styles.selectedExerciseRow : null,
                ]}
              >
                <View style={styles.exerciseTextWrap}>
                  <Text style={styles.exerciseName}>
                    {getExerciseName(exercise)}
                  </Text>
                  {meta ? (
                    <Text style={styles.exerciseMeta}>{meta}</Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={() => onEditExercisePress?.(exercise)}
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed ? styles.buttonPressed : null,
                  ]}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtleText: {
    color: colors.muted,
    fontSize: 13,
  },
  addButton: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addButtonText: {
    color: colors.accentText,
    fontSize: 13,
    fontWeight: "800",
  },
  exerciseList: {
    gap: 10,
  },
  exerciseRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  selectedExerciseRow: {
    backgroundColor: "rgba(249, 115, 22, 0.06)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  exerciseTextWrap: {
    flex: 1,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  exerciseMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
