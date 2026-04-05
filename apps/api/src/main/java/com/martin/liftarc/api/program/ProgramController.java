package com.martin.liftarc.api.program;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.martin.liftarc.api.program.dto.CreateProgramRequest;
import com.martin.liftarc.api.program.dto.ProgramResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
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
}