package com.martin.liftarc.api.program;

import java.util.List;

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
}