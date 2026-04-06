package com.martin.liftarc.api.program.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.martin.liftarc.api.program.dto.AddWorkoutDayExerciseRequest;
import com.martin.liftarc.api.program.dto.ProgramDayExerciseResponse;
import com.martin.liftarc.api.program.service.ProgramBuilderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workout-days")
public class WorkoutDayController {

    private final ProgramBuilderService programBuilderService;

    public WorkoutDayController(ProgramBuilderService programBuilderService) {
        this.programBuilderService = programBuilderService;
    }

    @PostMapping("/{id}/exercises")
    @ResponseStatus(HttpStatus.CREATED)
    public ProgramDayExerciseResponse addExerciseToWorkoutDay(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody AddWorkoutDayExerciseRequest request
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return programBuilderService.addExerciseToWorkoutDay(userId, id, request);
    }
}