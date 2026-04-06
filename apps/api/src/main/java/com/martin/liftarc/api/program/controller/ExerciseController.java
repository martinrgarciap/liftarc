package com.martin.liftarc.api.program.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.martin.liftarc.api.program.dto.ExerciseSummaryResponse;
import com.martin.liftarc.api.program.service.ExerciseService;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public List<ExerciseSummaryResponse> getExercises() {
        return exerciseService.getExercises();
    }
}