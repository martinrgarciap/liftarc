package com.martin.liftarc.api.program.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.martin.liftarc.api.program.entity.Exercise;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findAllByOrderByNameAsc();
}