package com.martin.liftarc.api.program.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CreateWorkoutDayRequest(
        @NotNull @Min(1) Integer position,
        @NotBlank String name,
        String notes,
        @Valid @NotEmpty List<CreateProgramDayExerciseRequest> exercises
) {
}