package com.martin.liftarc.api.program.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.martin.liftarc.api.program.entity.ProgramDayExercise;

public interface ProgramDayExerciseRepository extends JpaRepository<ProgramDayExercise, Long> {

    @Query("""
        select pde
        from ProgramDayExercise pde
        join fetch pde.exercise e
        join pde.workoutDay wd
        join wd.program p
        where pde.id = :id
          and p.userId = :userId
    """)
    Optional<ProgramDayExercise> findOwnedById(Long id, UUID userId);

    boolean existsByWorkoutDay_IdAndPosition(Long workoutDayId, Integer position);
}