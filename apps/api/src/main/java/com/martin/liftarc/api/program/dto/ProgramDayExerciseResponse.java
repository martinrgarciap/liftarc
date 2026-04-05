package com.martin.liftarc.api.program.dto;

public record ProgramDayExerciseResponse(
        Long id,
        Long exerciseId,
        String exerciseName,
        String muscleGroup,
        String equipment,
        Integer position,
        Integer prescribedSets,
        Integer prescribedRepsMin,
        Integer prescribedRepsMax,
        String notes
) {}