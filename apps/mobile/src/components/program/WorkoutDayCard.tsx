import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ProgramDay,
  getDayExercises,
  getDayTitle,
  getExerciseMeta,
  getExerciseName,
} from "../../lib/api/programs";

type WorkoutDayCardProps = {
  day: ProgramDay;
  index: number;
};

const colors = {
  surface: "#171A21",
  border: "#2A3140",
  text: "#F3F4F6",
  muted: "#9CA3AF",
  accentSoft: "rgba(249, 115, 22, 0.12)",
  accentBorder: "rgba(249, 115, 22, 0.28)",
  accentText: "#F97316",
};

export default function WorkoutDayCard({ day, index }: WorkoutDayCardProps) {
  const exercises = getDayExercises(day);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{getDayTitle(day, index)}</Text>

        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {exercises.length}{" "}
            {exercises.length === 1 ? "exercise" : "exercises"}
          </Text>
        </View>
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

            const meta = getExerciseMeta(exercise);

            return (
              <View key={key} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>
                  {getExerciseName(exercise)}
                </Text>
                {meta ? <Text style={styles.exerciseMeta}>{meta}</Text> : null}
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
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },
  countPill: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countText: {
    color: colors.accentText,
    fontSize: 12,
    fontWeight: "700",
  },
  exerciseList: {
    gap: 10,
  },
  exerciseRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
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
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
});
