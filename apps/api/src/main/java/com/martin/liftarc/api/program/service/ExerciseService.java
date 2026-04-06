package com.martin.liftarc.api.program.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.martin.liftarc.api.program.dto.ExerciseSummaryResponse;
import com.martin.liftarc.api.program.repository.ExerciseRepository;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public List<ExerciseSummaryResponse> getExercises() {
        return exerciseRepository.findAllByOrderByNameAsc().stream()
                .map(exercise -> new ExerciseSummaryResponse(
                        exercise.getId(),
                        exercise.getName(),
                        exercise.getMuscleGroup(),
                        exercise.getEquipment()
                ))
                .toList();
    }
}