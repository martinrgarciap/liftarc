package com.martin.liftarc.api.program.dto;

import java.util.List;

public record WorkoutDayResponse(
        Long id,
        Integer position,
        String name,
        String notes,
        List<ProgramDayExerciseResponse> exercises
) {}