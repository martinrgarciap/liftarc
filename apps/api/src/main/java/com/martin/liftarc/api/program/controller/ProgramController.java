package com.martin.liftarc.api.program.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.martin.liftarc.api.program.dto.AddWorkoutDayRequest;
import com.martin.liftarc.api.program.dto.CreateProgramRequest;
import com.martin.liftarc.api.program.dto.ProgramResponse;
import com.martin.liftarc.api.program.dto.WorkoutDayResponse;
import com.martin.liftarc.api.program.service.ProgramBuilderService;
import com.martin.liftarc.api.program.service.ProgramService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    private final ProgramService programService;
    private final ProgramBuilderService programBuilderService;

    public ProgramController(
            ProgramService programService,
            ProgramBuilderService programBuilderService
    ) {
        this.programService = programService;
        this.programBuilderService = programBuilderService;
    }

    @GetMapping("/current")
    public ProgramResponse getCurrentProgram(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return programService.getCurrentProgram(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgramResponse createProgram(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateProgramRequest request
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return programService.createProgram(userId, request);
    }

    @PostMapping("/{id}/days")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutDayResponse addWorkoutDay(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody AddWorkoutDayRequest request
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return programBuilderService.addWorkoutDay(userId, id, request);
    }
}