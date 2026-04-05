package com.martin.liftarc.api.program;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.martin.liftarc.api.program.entity.Program;

public interface ProgramRepository extends JpaRepository<Program, Long> {

    @EntityGraph(attributePaths = {
            "workoutDays",
            "workoutDays.dayExercises",
            "workoutDays.dayExercises.exercise"
    })
    Optional<Program> findByUserIdAndActiveTrue(UUID userId);
}