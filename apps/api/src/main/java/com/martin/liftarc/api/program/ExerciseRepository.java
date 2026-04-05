package com.martin.liftarc.api.program;

import org.springframework.data.jpa.repository.JpaRepository;

import com.martin.liftarc.api.program.entity.Exercise;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
}