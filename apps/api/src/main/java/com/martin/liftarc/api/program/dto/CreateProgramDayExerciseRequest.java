package com.martin.liftarc.api.program.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateProgramDayExerciseRequest(
        @NotNull Long exerciseId,
        @NotNull @Min(1) Integer position,
        @NotNull @Min(1) Integer prescribedSets,
        Integer prescribedRepsMin,
        Integer prescribedRepsMax,
        String notes
) {
}