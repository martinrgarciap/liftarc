import { getAccessToken } from "./client";
import { API_BASE_URL } from "./config";

export type ProgramExercise = {
  id?: string | number;
  exerciseId?: string | number;
  name?: string;
  exerciseName?: string;
  sets?: number;
  targetSets?: number;
  reps?: string | number;
  repRange?: string;
  notes?: string;
  orderIndex?: number;
};

export type ProgramDay = {
  id?: string | number;
  name?: string;
  title?: string;
  dayName?: string;
  dayOfWeek?: string | number;
  notes?: string;
  orderIndex?: number;
  exercises?: ProgramExercise[];
  workoutExercises?: ProgramExercise[];
};

export type CurrentProgramResponse = {
  id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  workoutDays?: ProgramDay[];
  days?: ProgramDay[];
};

export type CreateProgramExerciseRequest = {
  exerciseId: number;
  position: number;
  prescribedSets: number;
  prescribedRepsMin: number;
  prescribedRepsMax: number;
  notes: string;
};

export type CreateProgramWorkoutDayRequest = {
  position: number;
  name: string;
  notes: string;
  exercises: CreateProgramExerciseRequest[];
};

export type CreateProgramRequest = {
  name: string;
  description: string;
  workoutDays: CreateProgramWorkoutDayRequest[];
};

export const DEFAULT_STARTER_PROGRAM_REQUEST: CreateProgramRequest = {
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

async function parseJsonOrNull(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

export async function fetchCurrentProgram(): Promise<CurrentProgramResponse | null> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/programs/current`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 204 || response.status === 404) {
    return null;
  }

  const data = await parseJsonOrNull(response);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? String((data as { message: string }).message)
        : `Failed to fetch current program (${response.status})`;

    throw new Error(message);
  }

  return (data ?? null) as CurrentProgramResponse | null;
}

export async function createStarterProgram(
  payload: CreateProgramRequest,
): Promise<CurrentProgramResponse> {
  const token = await getAccessToken();
  const url = `${API_BASE_URL}/api/programs`;

  console.log(
    "[createStarterProgram] outgoing payload:",
    JSON.stringify(payload, null, 2),
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  console.log("[createStarterProgram] response status:", response.status);
  console.log("[createStarterProgram] response body:", responseText);

  let responseData: unknown = null;

  try {
    responseData = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseData = responseText || null;
  }

  if (!response.ok) {
    const message =
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof (responseData as { message?: unknown }).message === "string"
        ? String((responseData as { message: string }).message)
        : `Request failed: ${response.status}`;

    throw new Error(message);
  }

  return responseData as CurrentProgramResponse;
}

export function getProgramDays(
  program: CurrentProgramResponse | null,
): ProgramDay[] {
  if (!program) return [];
  return program.workoutDays ?? program.days ?? [];
}

export function getDayExercises(day: ProgramDay): ProgramExercise[] {
  return day.exercises ?? day.workoutExercises ?? [];
}

export function getDayTitle(day: ProgramDay, index: number) {
  if (day.name) return day.name;
  if (day.title) return day.title;
  if (day.dayName) return day.dayName;

  if (typeof day.dayOfWeek === "string" && day.dayOfWeek.trim()) {
    return capitalize(day.dayOfWeek);
  }

  if (typeof day.dayOfWeek === "number") {
    return `Day ${day.dayOfWeek}`;
  }

  return `Workout Day ${index + 1}`;
}

export function getExerciseName(exercise: ProgramExercise) {
  return exercise.exerciseName ?? exercise.name ?? "Exercise";
}

export function getExerciseMeta(exercise: ProgramExercise) {
  const sets = exercise.targetSets ?? exercise.sets;
  const reps = exercise.repRange ?? exercise.reps;

  if (sets && reps) return `${sets} sets • ${reps}`;
  if (sets) return `${sets} sets`;
  if (reps) return `${reps} reps`;

  return null;
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
