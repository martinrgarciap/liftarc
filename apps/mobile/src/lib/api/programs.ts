import { getAccessToken } from "./client";
import { API_BASE_URL } from "./config";

export type ProgramExercise = {
  id?: string | number;
  exerciseId?: string | number;
  name?: string;
  exerciseName?: string;
  title?: string;
  sets?: number;
  targetSets?: number;
  prescribedSets?: number;
  reps?: string | number;
  repRange?: string;
  prescribedRepsMin?: number;
  prescribedRepsMax?: number;
  notes?: string;
  orderIndex?: number;
  position?: number;
};

export type ProgramDay = {
  id?: string | number;
  name?: string;
  title?: string;
  dayName?: string;
  dayOfWeek?: string | number;
  notes?: string;
  orderIndex?: number;
  position?: number;
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

export type ExerciseListItem = {
  id: number;
  name: string;
  category?: string;
  muscleGroup?: string;
  equipment?: string;
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

export type AddWorkoutDayRequest = {
  position: number;
  name: string;
  notes: string;
};

export type AddWorkoutDayExerciseRequest = {
  exerciseId: number;
  position: number;
  prescribedSets: number;
  prescribedRepsMin: number;
  prescribedRepsMax: number;
  notes: string;
};

export type UpdateProgramDayExerciseRequest = {
  prescribedSets: number;
  prescribedRepsMin: number;
  prescribedRepsMax: number;
  notes?: string;
};

type ExerciseListResponse =
  | ExerciseListItem[]
  | {
      content?: unknown;
      exercises?: unknown;
    };

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const value = data as Record<string, unknown>;
    if (typeof value.message === "string" && value.message.trim()) {
      return value.message;
    }
    if (typeof value.error === "string" && value.error.trim()) {
      return value.error;
    }
    if (typeof value.details === "string" && value.details.trim()) {
      return value.details;
    }
  }

  return fallback;
}

async function requestWithLogs<T>(
  label: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  console.log(`[${label}] request url:`, url);
  console.log(`[${label}] request method:`, init.method ?? "GET");
  console.log(
    `[${label}] request payload:`,
    typeof init.body === "string" ? init.body : (init.body ?? null),
  );

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const data = await parseResponseBody(response);

  console.log(`[${label}] response status:`, response.status);
  console.log(`[${label}] response body:`, data);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, `${label} failed (${response.status})`),
    );
  }

  return data as T;
}

function normalizeExercises(data: ExerciseListResponse): ExerciseListItem[] {
  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.exercises)
        ? data.exercises
        : [];

  return rawList
    .map((item): ExerciseListItem | null => {
      if (!item || typeof item !== "object") return null;

      const value = item as Record<string, unknown>;
      const id = Number(value.id);

      if (!Number.isFinite(id)) return null;

      const normalized: ExerciseListItem = {
        id,
        name:
          typeof value.name === "string"
            ? value.name
            : typeof value.exerciseName === "string"
              ? value.exerciseName
              : typeof value.title === "string"
                ? value.title
                : "Exercise",
      };

      if (typeof value.category === "string") {
        normalized.category = value.category;
      }

      if (typeof value.muscleGroup === "string") {
        normalized.muscleGroup = value.muscleGroup;
      }

      if (typeof value.equipment === "string") {
        normalized.equipment = value.equipment;
      }

      return normalized;
    })
    .filter((item): item is ExerciseListItem => item !== null);
}

export async function fetchCurrentProgram(): Promise<CurrentProgramResponse | null> {
  const token = await getAccessToken();
  const url = `${API_BASE_URL}/api/programs/current`;

  console.log("[fetchCurrentProgram] request url:", url);
  console.log("[fetchCurrentProgram] request method:", "GET");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponseBody(response);

  console.log("[fetchCurrentProgram] response status:", response.status);
  console.log("[fetchCurrentProgram] response body:", data);

  if (response.status === 204 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        `Failed to fetch current program (${response.status})`,
      ),
    );
  }

  return (data ?? null) as CurrentProgramResponse | null;
}

export async function createStarterProgram(
  payload: CreateProgramRequest,
): Promise<CurrentProgramResponse> {
  return requestWithLogs<CurrentProgramResponse>(
    "createStarterProgram",
    "/api/programs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchExercises(): Promise<ExerciseListItem[]> {
  const data = await requestWithLogs<ExerciseListResponse>(
    "fetchExercises",
    "/api/exercises",
    {
      method: "GET",
    },
  );

  return normalizeExercises(data);
}

export async function addWorkoutDay(
  programId: number,
  payload: AddWorkoutDayRequest,
): Promise<unknown> {
  return requestWithLogs<unknown>(
    "addWorkoutDay",
    `/api/programs/${programId}/days`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function addExerciseToWorkoutDay(
  workoutDayId: number,
  payload: AddWorkoutDayExerciseRequest,
): Promise<unknown> {
  return requestWithLogs<unknown>(
    "addExerciseToWorkoutDay",
    `/api/workout-days/${workoutDayId}/exercises`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function updateProgramDayExercise(
  programDayExerciseId: number,
  payload: UpdateProgramDayExerciseRequest,
): Promise<unknown> {
  return requestWithLogs<unknown>(
    "updateProgramDayExercise",
    `/api/program-day-exercises/${programDayExerciseId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export function getProgramId(
  program: CurrentProgramResponse | null,
): number | null {
  if (!program?.id) return null;

  const value = Number(program.id);
  return Number.isFinite(value) ? value : null;
}

export function getProgramDays(
  program: CurrentProgramResponse | null,
): ProgramDay[] {
  if (!program) return [];
  return program.workoutDays ?? program.days ?? [];
}

export function getProgramDayId(day: ProgramDay): number | null {
  if (day.id === undefined || day.id === null) return null;

  const value = Number(day.id);
  return Number.isFinite(value) ? value : null;
}

export function getDayExercises(day: ProgramDay): ProgramExercise[] {
  return day.exercises ?? day.workoutExercises ?? [];
}

export function getProgramDayExerciseId(
  exercise: ProgramExercise,
): number | null {
  if (exercise.id === undefined || exercise.id === null) return null;

  const value = Number(exercise.id);
  return Number.isFinite(value) ? value : null;
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
  return exercise.exerciseName ?? exercise.name ?? exercise.title ?? "Exercise";
}

export function getExerciseSetValue(exercise: ProgramExercise): number | null {
  const sets = exercise.targetSets ?? exercise.prescribedSets ?? exercise.sets;
  return typeof sets === "number" ? sets : null;
}

export function getExerciseRepRange(exercise: ProgramExercise): string | null {
  if (typeof exercise.repRange === "string" && exercise.repRange.trim()) {
    return exercise.repRange;
  }

  if (
    typeof exercise.prescribedRepsMin === "number" &&
    typeof exercise.prescribedRepsMax === "number"
  ) {
    return exercise.prescribedRepsMin === exercise.prescribedRepsMax
      ? String(exercise.prescribedRepsMin)
      : `${exercise.prescribedRepsMin}-${exercise.prescribedRepsMax}`;
  }

  if (typeof exercise.reps === "string" && exercise.reps.trim()) {
    return exercise.reps;
  }

  if (typeof exercise.reps === "number") {
    return String(exercise.reps);
  }

  return null;
}

export function getExerciseMeta(exercise: ProgramExercise) {
  const sets = getExerciseSetValue(exercise);
  const reps = getExerciseRepRange(exercise);

  if (sets && reps) return `${sets} sets • ${reps} reps`;
  if (sets) return `${sets} sets`;
  if (reps) return `${reps} reps`;
  return null;
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
