package com.martin.liftarc.api.program.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.martin.liftarc.api.program.entity.WorkoutDay;

public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {

    @Query("""
        select distinct wd
        from WorkoutDay wd
        left join fetch wd.dayExercises de
        left join fetch de.exercise
        where wd.program.id = :programId
        order by wd.position asc
    """)
    List<WorkoutDay> findAllByProgramIdWithExercises(Long programId);

    @Query("""
        select wd
        from WorkoutDay wd
        join fetch wd.program p
        where wd.id = :id
          and p.userId = :userId
    """)
    Optional<WorkoutDay> findOwnedById(Long id, UUID userId);

    boolean existsByProgram_IdAndPosition(Long programId, Integer position);
}