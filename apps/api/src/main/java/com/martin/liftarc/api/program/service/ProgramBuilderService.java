package com.martin.liftarc.api.program.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.martin.liftarc.api.program.dto.AddWorkoutDayExerciseRequest;
import com.martin.liftarc.api.program.dto.AddWorkoutDayRequest;
import com.martin.liftarc.api.program.dto.ProgramDayExerciseResponse;
import com.martin.liftarc.api.program.dto.UpdateProgramDayExerciseRequest;
import com.martin.liftarc.api.program.dto.WorkoutDayResponse;
import com.martin.liftarc.api.program.entity.Exercise;
import com.martin.liftarc.api.program.entity.Program;
import com.martin.liftarc.api.program.entity.ProgramDayExercise;
import com.martin.liftarc.api.program.entity.WorkoutDay;
import com.martin.liftarc.api.program.repository.ExerciseRepository;
import com.martin.liftarc.api.program.repository.ProgramDayExerciseRepository;
import com.martin.liftarc.api.program.repository.ProgramRepository;
import com.martin.liftarc.api.program.repository.WorkoutDayRepository;

@Service
public class ProgramBuilderService {

    private final ProgramRepository programRepository;
    private final WorkoutDayRepository workoutDayRepository;
    private final ExerciseRepository exerciseRepository;
    private final ProgramDayExerciseRepository programDayExerciseRepository;

    public ProgramBuilderService(
            ProgramRepository programRepository,
            WorkoutDayRepository workoutDayRepository,
            ExerciseRepository exerciseRepository,
            ProgramDayExerciseRepository programDayExerciseRepository
    ) {
        this.programRepository = programRepository;
        this.workoutDayRepository = workoutDayRepository;
        this.exerciseRepository = exerciseRepository;
        this.programDayExerciseRepository = programDayExerciseRepository;
    }

    @Transactional
    public WorkoutDayResponse addWorkoutDay(UUID userId, Long programId, AddWorkoutDayRequest request) {
        Program program = programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Program not found."
                ));

        if (workoutDayRepository.existsByProgram_IdAndPosition(programId, request.position())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Duplicate workout day positions are not allowed."
            );
        }

        WorkoutDay day = new WorkoutDay();
        day.setProgram(program);
        day.setPosition(request.position());
        day.setName(request.name());
        day.setNotes(request.notes());

        WorkoutDay saved = workoutDayRepository.save(day);

        return new WorkoutDayResponse(
                saved.getId(),
                saved.getPosition(),
                saved.getName(),
                saved.getNotes(),
                List.of()
        );
    }

    @Transactional
    public ProgramDayExerciseResponse addExerciseToWorkoutDay(
            UUID userId,
            Long workoutDayId,
            AddWorkoutDayExerciseRequest request
    ) {
        WorkoutDay workoutDay = workoutDayRepository.findOwnedById(workoutDayId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Workout day not found."
                ));

        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Exercise not found."
                ));

        if (programDayExerciseRepository.existsByWorkoutDay_IdAndPosition(workoutDayId, request.position())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Duplicate exercise positions are not allowed within a workout day."
            );
        }

        validateRepRange(request.prescribedRepsMin(), request.prescribedRepsMax());

        ProgramDayExercise dayExercise = new ProgramDayExercise();
        dayExercise.setWorkoutDay(workoutDay);
        dayExercise.setExercise(exercise);
        dayExercise.setPosition(request.position());
        dayExercise.setPrescribedSets(request.prescribedSets());
        dayExercise.setPrescribedRepsMin(request.prescribedRepsMin());
        dayExercise.setPrescribedRepsMax(request.prescribedRepsMax());
        dayExercise.setNotes(request.notes());

        ProgramDayExercise saved = programDayExerciseRepository.save(dayExercise);

        return mapProgramDayExercise(saved);
    }

    @Transactional
    public ProgramDayExerciseResponse updateProgramDayExercise(
            UUID userId,
            Long programDayExerciseId,
            UpdateProgramDayExerciseRequest request
    ) {
        ProgramDayExercise dayExercise = programDayExerciseRepository.findOwnedById(programDayExerciseId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Program day exercise not found."
                ));

        Integer nextSets = request.prescribedSets() != null
                ? request.prescribedSets()
                : dayExercise.getPrescribedSets();

        Integer nextMin = request.prescribedRepsMin() != null
                ? request.prescribedRepsMin()
                : dayExercise.getPrescribedRepsMin();

        Integer nextMax = request.prescribedRepsMax() != null
                ? request.prescribedRepsMax()
                : dayExercise.getPrescribedRepsMax();

        validateRepRange(nextMin, nextMax);

        dayExercise.setPrescribedSets(nextSets);
        dayExercise.setPrescribedRepsMin(nextMin);
        dayExercise.setPrescribedRepsMax(nextMax);

        if (request.notes() != null) {
            dayExercise.setNotes(request.notes());
        }

        ProgramDayExercise saved = programDayExerciseRepository.save(dayExercise);

        return mapProgramDayExercise(saved);
    }

    private void validateRepRange(Integer min, Integer max) {
        if (min != null && max != null && min > max) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "prescribedRepsMin cannot be greater than prescribedRepsMax."
            );
        }
    }

    private ProgramDayExerciseResponse mapProgramDayExercise(ProgramDayExercise dayExercise) {
        return new ProgramDayExerciseResponse(
                dayExercise.getId(),
                dayExercise.getExercise().getId(),
                dayExercise.getExercise().getName(),
                dayExercise.getExercise().getMuscleGroup(),
                dayExercise.getExercise().getEquipment(),
                dayExercise.getPosition(),
                dayExercise.getPrescribedSets(),
                dayExercise.getPrescribedRepsMin(),
                dayExercise.getPrescribedRepsMax(),
                dayExercise.getNotes()
        );
    }
}