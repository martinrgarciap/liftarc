package com.martin.liftarc.api.program.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddWorkoutDayExerciseRequest(
    @NotNull Long exerciseId,
    @NotNull @Min(1) Integer position,
    @NotNull @Min(1) Integer prescribedSets,
    @Min(1) Integer prescribedRepsMin,
    @Min(1) Integer prescribedRepsMax,
    String notes
) {
}