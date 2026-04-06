package com.martin.liftarc.api.program.dto;

import jakarta.validation.constraints.Min;

public record UpdateProgramDayExerciseRequest(
    @Min(1) Integer prescribedSets,
    @Min(1) Integer prescribedRepsMin,
    @Min(1) Integer prescribedRepsMax,
    String notes
) {
}