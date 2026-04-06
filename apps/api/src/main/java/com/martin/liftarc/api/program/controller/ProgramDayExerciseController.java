package com.martin.liftarc.api.program.controller;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.martin.liftarc.api.program.dto.ProgramDayExerciseResponse;
import com.martin.liftarc.api.program.dto.UpdateProgramDayExerciseRequest;
import com.martin.liftarc.api.program.service.ProgramBuilderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/program-day-exercises")
public class ProgramDayExerciseController {

    private final ProgramBuilderService programBuilderService;

    public ProgramDayExerciseController(ProgramBuilderService programBuilderService) {
        this.programBuilderService = programBuilderService;
    }

    @PatchMapping("/{id}")
    public ProgramDayExerciseResponse updateProgramDayExercise(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgramDayExerciseRequest request
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return programBuilderService.updateProgramDayExercise(userId, id, request);
    }
}