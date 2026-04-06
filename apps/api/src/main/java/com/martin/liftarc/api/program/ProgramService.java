package com.martin.liftarc.api.program;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.martin.liftarc.api.program.dto.CreateProgramDayExerciseRequest;
import com.martin.liftarc.api.program.dto.CreateProgramRequest;
import com.martin.liftarc.api.program.dto.CreateWorkoutDayRequest;
import com.martin.liftarc.api.program.dto.ProgramDayExerciseResponse;
import com.martin.liftarc.api.program.dto.ProgramResponse;
import com.martin.liftarc.api.program.dto.WorkoutDayResponse;
import com.martin.liftarc.api.program.entity.Exercise;
import com.martin.liftarc.api.program.entity.Program;
import com.martin.liftarc.api.program.entity.ProgramDayExercise;
import com.martin.liftarc.api.program.entity.WorkoutDay;

@Service
public class ProgramService {

    private final ProgramRepository programRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutDayRepository workoutDayRepository;

    public ProgramService(
            ProgramRepository programRepository,
            ExerciseRepository exerciseRepository,
            WorkoutDayRepository workoutDayRepository
    ) {
        this.programRepository = programRepository;
        this.exerciseRepository = exerciseRepository;
        this.workoutDayRepository = workoutDayRepository;
    }

    @Transactional(readOnly = true)
    public ProgramResponse getCurrentProgram(UUID userId) {
        Program program = programRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No active program found."
                ));

        List<WorkoutDay> workoutDays = workoutDayRepository.findAllByProgramIdWithExercises(program.getId());

        return mapProgram(program, workoutDays);
    }

    @Transactional
    public ProgramResponse createProgram(UUID userId, CreateProgramRequest request) {
        validateWorkoutDays(request.workoutDays());

        Set<Long> exerciseIds = request.workoutDays().stream()
                .flatMap(day -> day.exercises().stream())
                .map(CreateProgramDayExerciseRequest::exerciseId)
                .collect(Collectors.toSet());

        Map<Long, Exercise> exerciseMap = exerciseRepository.findAllById(exerciseIds).stream()
                .collect(Collectors.toMap(Exercise::getId, Function.identity()));

        if (exerciseMap.size() != exerciseIds.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "One or more exerciseIds are invalid."
            );
        }

        programRepository.findByUserIdAndActiveTrue(userId).ifPresent(existing -> {
            existing.setActive(false);
            programRepository.save(existing);
        });

        Program program = new Program();
        program.setUserId(userId);
        program.setName(request.name());
        program.setDescription(request.description());
        program.setActive(true);

        for (CreateWorkoutDayRequest dayRequest : request.workoutDays()) {
            validateDayExercises(dayRequest.exercises());

            WorkoutDay day = new WorkoutDay();
            day.setPosition(dayRequest.position());
            day.setName(dayRequest.name());
            day.setNotes(dayRequest.notes());

            for (CreateProgramDayExerciseRequest exerciseRequest : dayRequest.exercises()) {
                Exercise exercise = exerciseMap.get(exerciseRequest.exerciseId());

                ProgramDayExercise dayExercise = new ProgramDayExercise();
                dayExercise.setExercise(exercise);
                dayExercise.setPosition(exerciseRequest.position());
                dayExercise.setPrescribedSets(exerciseRequest.prescribedSets());
                dayExercise.setPrescribedRepsMin(exerciseRequest.prescribedRepsMin());
                dayExercise.setPrescribedRepsMax(exerciseRequest.prescribedRepsMax());
                dayExercise.setNotes(exerciseRequest.notes());

                day.addDayExercise(dayExercise);
            }

            program.addWorkoutDay(day);
        }

        Program saved = programRepository.save(program);

        return mapProgram(saved, saved.getWorkoutDays());
    }

    private void validateWorkoutDays(List<CreateWorkoutDayRequest> workoutDays) {
        Set<Integer> positions = new HashSet<>();

        for (CreateWorkoutDayRequest day : workoutDays) {
            if (!positions.add(day.position())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Duplicate workout day positions are not allowed."
                );
            }
        }
    }

    private void validateDayExercises(List<CreateProgramDayExerciseRequest> exercises) {
        Set<Integer> positions = new HashSet<>();

        for (CreateProgramDayExerciseRequest exercise : exercises) {
            if (!positions.add(exercise.position())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Duplicate exercise positions are not allowed within a workout day."
                );
            }

            Integer min = exercise.prescribedRepsMin();
            Integer max = exercise.prescribedRepsMax();

            if (min != null && max != null && min > max) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "prescribedRepsMin cannot be greater than prescribedRepsMax."
                );
            }
        }
    }

    private ProgramResponse mapProgram(Program program, List<WorkoutDay> workoutDays) {
        List<WorkoutDayResponse> workoutDayResponses = workoutDays.stream()
                .sorted(Comparator.comparing(WorkoutDay::getPosition))
                .map(day -> new WorkoutDayResponse(
                        day.getId(),
                        day.getPosition(),
                        day.getName(),
                        day.getNotes(),
                        day.getDayExercises().stream()
                                .sorted(Comparator.comparing(ProgramDayExercise::getPosition))
                                .map(dayExercise -> new ProgramDayExerciseResponse(
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
                                ))
                                .toList()
                ))
                .toList();

        return new ProgramResponse(
                program.getId(),
                program.getName(),
                program.getDescription(),
                program.isActive(),
                workoutDayResponses
        );
    }
}