package com.martin.liftarc.api.program.dto;

public record ExerciseSummaryResponse(
    Long id,
    String name,
    String muscleGroup,
    String equipment
) {
}