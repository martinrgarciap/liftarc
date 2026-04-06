package com.martin.liftarc.api.program.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddWorkoutDayRequest(
    @NotNull @Min(1) Integer position,
    @NotBlank String name,
    String notes
) {
}