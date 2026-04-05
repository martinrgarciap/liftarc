package com.martin.liftarc.api.program.dto;

import java.util.List;

public record ProgramResponse(
        Long id,
        String name,
        String description,
        boolean isActive,
        List<WorkoutDayResponse> workoutDays
) {}