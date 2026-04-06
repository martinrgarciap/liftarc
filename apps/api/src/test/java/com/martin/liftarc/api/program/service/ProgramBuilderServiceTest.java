package com.martin.liftarc.api.program.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
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

@ExtendWith(MockitoExtension.class)
class ProgramBuilderServiceTest {

    @Mock
    private ProgramRepository programRepository;

    @Mock
    private WorkoutDayRepository workoutDayRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private ProgramDayExerciseRepository programDayExerciseRepository;

    @InjectMocks
    private ProgramBuilderService programBuilderService;

    private UUID userId;
    private Program program;
    private WorkoutDay workoutDay;
    private Exercise benchPress;
    private ProgramDayExercise existingDayExercise;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        program = buildProgram(10L, userId, "Starter Program");
        workoutDay = buildWorkoutDay(20L, program, 1, "Push Day");
        benchPress = buildExercise(3L, "Bench Press", "Chest", "Barbell");
        existingDayExercise = buildProgramDayExercise(30L, workoutDay, benchPress);
    }

    @Test
    void addWorkoutDay_ShouldCreateDay_WhenProgramOwnedByUser() {
        AddWorkoutDayRequest request = new AddWorkoutDayRequest(
                2,
                "Pull Day",
                "Back and biceps focus"
        );

        when(programRepository.findByIdAndUserId(10L, userId))
                .thenReturn(Optional.of(program));
        when(workoutDayRepository.existsByProgram_IdAndPosition(10L, 2))
                .thenReturn(false);
        when(workoutDayRepository.save(any(WorkoutDay.class)))
                .thenAnswer(invocation -> {
                    WorkoutDay saved = invocation.getArgument(0);
                    ReflectionTestUtils.setField(saved, "id", 101L);
                    return saved;
                });

        WorkoutDayResponse response = programBuilderService.addWorkoutDay(userId, 10L, request);

        assertEquals(101L, response.id());
        assertEquals(2, response.position());
        assertEquals("Pull Day", response.name());
        assertEquals("Back and biceps focus", response.notes());
        assertNotNull(response.exercises());
        assertEquals(0, response.exercises().size());
    }

    @Test
    void addWorkoutDay_ShouldThrowBadRequest_WhenDuplicatePosition() {
        AddWorkoutDayRequest request = new AddWorkoutDayRequest(
                1,
                "Pull Day",
                "Back and biceps focus"
        );

        when(programRepository.findByIdAndUserId(10L, userId))
                .thenReturn(Optional.of(program));
        when(workoutDayRepository.existsByProgram_IdAndPosition(10L, 1))
                .thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programBuilderService.addWorkoutDay(userId, 10L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Duplicate workout day positions are not allowed.", exception.getReason());
    }

    @Test
    void addWorkoutDay_ShouldThrowNotFound_WhenProgramNotOwnedByUser() {
        AddWorkoutDayRequest request = new AddWorkoutDayRequest(
                2,
                "Pull Day",
                "Back and biceps focus"
        );

        when(programRepository.findByIdAndUserId(10L, userId))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programBuilderService.addWorkoutDay(userId, 10L, request)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Program not found.", exception.getReason());
    }

    @Test
    void addExerciseToWorkoutDay_ShouldCreateExercise_WhenWorkoutDayOwnedByUser() {
        AddWorkoutDayExerciseRequest request = new AddWorkoutDayExerciseRequest(
                3L,
                1,
                3,
                8,
                10,
                "Controlled reps"
        );

        when(workoutDayRepository.findOwnedById(20L, userId))
                .thenReturn(Optional.of(workoutDay));
        when(exerciseRepository.findById(3L))
                .thenReturn(Optional.of(benchPress));
        when(programDayExerciseRepository.existsByWorkoutDay_IdAndPosition(20L, 1))
                .thenReturn(false);
        when(programDayExerciseRepository.save(any(ProgramDayExercise.class)))
                .thenAnswer(invocation -> {
                    ProgramDayExercise saved = invocation.getArgument(0);
                    ReflectionTestUtils.setField(saved, "id", 201L);
                    return saved;
                });

        ProgramDayExerciseResponse response =
                programBuilderService.addExerciseToWorkoutDay(userId, 20L, request);

        assertEquals(201L, response.id());
        assertEquals(3L, response.exerciseId());
        assertEquals("Bench Press", response.exerciseName());
        assertEquals("Chest", response.muscleGroup());
        assertEquals("Barbell", response.equipment());
        assertEquals(1, response.position());
        assertEquals(3, response.prescribedSets());
        assertEquals(8, response.prescribedRepsMin());
        assertEquals(10, response.prescribedRepsMax());
        assertEquals("Controlled reps", response.notes());
    }

    @Test
    void addExerciseToWorkoutDay_ShouldThrowNotFound_WhenWorkoutDayNotOwnedByUser() {
        AddWorkoutDayExerciseRequest request = new AddWorkoutDayExerciseRequest(
                3L,
                1,
                3,
                8,
                10,
                "Controlled reps"
        );

        when(workoutDayRepository.findOwnedById(20L, userId))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programBuilderService.addExerciseToWorkoutDay(userId, 20L, request)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Workout day not found.", exception.getReason());
    }

    @Test
    void addExerciseToWorkoutDay_ShouldThrowNotFound_WhenExerciseDoesNotExist() {
        AddWorkoutDayExerciseRequest request = new AddWorkoutDayExerciseRequest(
                999L,
                1,
                3,
                8,
                10,
                "Controlled reps"
        );

        when(workoutDayRepository.findOwnedById(20L, userId))
                .thenReturn(Optional.of(workoutDay));
        when(exerciseRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programBuilderService.addExerciseToWorkoutDay(userId, 20L, request)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Exercise not found.", exception.getReason());
    }

    @Test
    void addExerciseToWorkoutDay_ShouldThrowBadRequest_WhenDuplicatePosition() {
        AddWorkoutDayExerciseRequest request = new AddWorkoutDayExerciseRequest(
                3L,
                1,
                3,
                8,
                10,
                "Controlled reps"
        );

        when(workoutDayRepository.findOwnedById(20L, userId))
                .thenReturn(Optional.of(workoutDay));
        when(exerciseRepository.findById(3L))
                .thenReturn(Optional.of(benchPress));
        when(programDayExerciseRepository.existsByWorkoutDay_IdAndPosition(20L, 1))
                .thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programBuilderService.addExerciseToWorkoutDay(userId, 20L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Duplicate exercise positions are not allowed within a workout day.", exception.getReason());
    }

    @Test
    void addExerciseToWorkoutDay_ShouldThrowBadRequest_WhenRepRangeInvalid() {
        AddWorkoutDayExerciseRequest request = new AddWorkoutDayExerciseRequest(
                3L,
                1,
                3,
                12,
                8,
                "Controlled reps"
        );

        when(workoutDayRepository.findOwnedById(20L, userId))
                .thenReturn(Optional.of(workoutDay));
        when(exerciseRepository.findById(3L))
                .thenReturn(Optional.of(benchPress));
        when(programDayExerciseRepository.existsByWorkoutDay_IdAndPosition(20L, 1))
                .thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programBuilderService.addExerciseToWorkoutDay(userId, 20L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("prescribedRepsMin cannot be greater than prescribedRepsMax.", exception.getReason());
    }

    @Test
    void updateProgramDayExercise_ShouldUpdateTargets_WhenOwnedByUser() {
        UpdateProgramDayExerciseRequest request = new UpdateProgramDayExerciseRequest(
                4,
                6,
                8,
                "Go heavier this week"
        );

        when(programDayExerciseRepository.findOwnedById(30L, userId))
                .thenReturn(Optional.of(existingDayExercise));
        when(programDayExerciseRepository.save(any(ProgramDayExercise.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProgramDayExerciseResponse response =
                programBuilderService.updateProgramDayExercise(userId, 30L, request);

        assertEquals(30L, response.id());
        assertEquals(4, response.prescribedSets());
        assertEquals(6, response.prescribedRepsMin());
        assertEquals(8, response.prescribedRepsMax());
        assertEquals("Go heavier this week", response.notes());
    }

    @Test
    void updateProgramDayExercise_ShouldKeepExistingValues_WhenRequestFieldsAreNull() {
        UpdateProgramDayExerciseRequest request = new UpdateProgramDayExerciseRequest(
                null,
                null,
                null,
                null
        );

        when(programDayExerciseRepository.findOwnedById(30L, userId))
                .thenReturn(Optional.of(existingDayExercise));
        when(programDayExerciseRepository.save(any(ProgramDayExercise.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProgramDayExerciseResponse response =
                programBuilderService.updateProgramDayExercise(userId, 30L, request);

        assertEquals(3, response.prescribedSets());
        assertEquals(8, response.prescribedRepsMin());
        assertEquals(10, response.prescribedRepsMax());
        assertEquals("Controlled reps", response.notes());
    }

    @Test
    void updateProgramDayExercise_ShouldThrowNotFound_WhenRowNotOwnedByUser() {
        UpdateProgramDayExerciseRequest request = new UpdateProgramDayExerciseRequest(
                4,
                6,
                8,
                "Go heavier this week"
        );

        when(programDayExerciseRepository.findOwnedById(30L, userId))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programBuilderService.updateProgramDayExercise(userId, 30L, request)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Program day exercise not found.", exception.getReason());
    }

    @Test
    void updateProgramDayExercise_ShouldThrowBadRequest_WhenRepRangeInvalid() {
        UpdateProgramDayExerciseRequest request = new UpdateProgramDayExerciseRequest(
                4,
                12,
                8,
                "Go heavier this week"
        );

        when(programDayExerciseRepository.findOwnedById(30L, userId))
                .thenReturn(Optional.of(existingDayExercise));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programBuilderService.updateProgramDayExercise(userId, 30L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("prescribedRepsMin cannot be greater than prescribedRepsMax.", exception.getReason());
    }

    private Program buildProgram(Long id, UUID userId, String name) {
        Program value = new Program();
        ReflectionTestUtils.setField(value, "id", id);
        value.setUserId(userId);
        value.setName(name);
        value.setDescription("Week 1 base program");
        value.setActive(true);
        return value;
    }

    private WorkoutDay buildWorkoutDay(Long id, Program program, Integer position, String name) {
        WorkoutDay value = new WorkoutDay();
        ReflectionTestUtils.setField(value, "id", id);
        value.setProgram(program);
        value.setPosition(position);
        value.setName(name);
        value.setNotes("Chest focus");
        return value;
    }

    private Exercise buildExercise(Long id, String name, String muscleGroup, String equipment) {
        Exercise value = new Exercise();
        ReflectionTestUtils.setField(value, "id", id);
        value.setName(name);
        value.setMuscleGroup(muscleGroup);
        value.setEquipment(equipment);
        value.setSystem(true);
        return value;
    }

    private ProgramDayExercise buildProgramDayExercise(Long id, WorkoutDay workoutDay, Exercise exercise) {
        ProgramDayExercise value = new ProgramDayExercise();
        ReflectionTestUtils.setField(value, "id", id);
        value.setWorkoutDay(workoutDay);
        value.setExercise(exercise);
        value.setPosition(1);
        value.setPrescribedSets(3);
        value.setPrescribedRepsMin(8);
        value.setPrescribedRepsMax(10);
        value.setNotes("Controlled reps");
        return value;
    }
}