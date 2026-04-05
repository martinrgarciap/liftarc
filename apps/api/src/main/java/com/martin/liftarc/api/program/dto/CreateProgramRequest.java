package com.martin.liftarc.api.program.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record CreateProgramRequest(
        @NotBlank String name,
        String description,
        @Valid @NotEmpty List<CreateWorkoutDayRequest> workoutDays
) {
}