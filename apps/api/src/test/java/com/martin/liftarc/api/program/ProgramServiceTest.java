package com.martin.liftarc.api.program;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import com.martin.liftarc.api.program.dto.CreateProgramDayExerciseRequest;
import com.martin.liftarc.api.program.dto.CreateProgramRequest;
import com.martin.liftarc.api.program.dto.CreateWorkoutDayRequest;
import com.martin.liftarc.api.program.dto.ProgramResponse;
import com.martin.liftarc.api.program.entity.Exercise;
import com.martin.liftarc.api.program.entity.Program;
import com.martin.liftarc.api.program.entity.ProgramDayExercise;
import com.martin.liftarc.api.program.entity.WorkoutDay;
import com.martin.liftarc.api.program.repository.ExerciseRepository;
import com.martin.liftarc.api.program.repository.ProgramRepository;
import com.martin.liftarc.api.program.repository.WorkoutDayRepository;
import com.martin.liftarc.api.program.service.ProgramService;

@ExtendWith(MockitoExtension.class)
class ProgramServiceTest {

    @Mock
    private ProgramRepository programRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private WorkoutDayRepository workoutDayRepository;

    @InjectMocks
    private ProgramService programService;

    private UUID userId;
    private Exercise benchPress;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        benchPress = buildExercise(1L, "Bench Press", "Chest", "Barbell");
    }

    @Test
    void getCurrentProgram_ShouldReturnMappedProgram_WhenActiveProgramExists() {
        Program activeProgram = buildExistingProgram(userId, benchPress);

        when(programRepository.findByUserIdAndActiveTrue(userId))
                .thenReturn(Optional.of(activeProgram));

        when(workoutDayRepository.findAllByProgramIdWithExercises(100L))
        .thenReturn(activeProgram.getWorkoutDays());

        ProgramResponse response = programService.getCurrentProgram(userId);

        assertEquals("Starter Program", response.name());
        assertTrue(response.isActive());
        assertEquals(1, response.workoutDays().size());
        assertEquals("Push Day", response.workoutDays().get(0).name());
        assertEquals(1, response.workoutDays().get(0).exercises().size());
        assertEquals("Bench Press", response.workoutDays().get(0).exercises().get(0).exerciseName());
    }

    @Test
    void getCurrentProgram_ShouldThrowNotFound_WhenNoActiveProgramExists() {
        when(programRepository.findByUserIdAndActiveTrue(userId))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programService.getCurrentProgram(userId)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("No active program found.", exception.getReason());
    }

    @Test
    void createProgram_ShouldCreateProgram_AndDeactivateExistingActiveProgram() {
        Program existing = new Program();
        ReflectionTestUtils.setField(existing, "id", 50L);
        existing.setUserId(userId);
        existing.setName("Old Program");
        existing.setActive(true);

        CreateProgramRequest request = validRequest();

        when(programRepository.findByUserIdAndActiveTrue(userId))
                .thenReturn(Optional.of(existing));
        when(exerciseRepository.findAllById(anyIterable()))
                .thenReturn(List.of(benchPress));
        when(programRepository.save(any(Program.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProgramResponse response = programService.createProgram(userId, request);

        assertFalse(existing.isActive());
        assertEquals("Starter Program", response.name());
        assertEquals("Week 1 base program", response.description());
        assertEquals(1, response.workoutDays().size());
        assertEquals("Push Day", response.workoutDays().get(0).name());
        assertEquals("Bench Press", response.workoutDays().get(0).exercises().get(0).exerciseName());

        ArgumentCaptor<Program> captor = ArgumentCaptor.forClass(Program.class);
        verify(programRepository, times(2)).save(captor.capture());

        Program createdProgram = captor.getAllValues().get(1);
        assertEquals(userId, createdProgram.getUserId());
        assertTrue(createdProgram.isActive());
        assertEquals("Starter Program", createdProgram.getName());
        assertEquals(1, createdProgram.getWorkoutDays().size());
    }

    @Test
    void createProgram_ShouldThrowBadRequest_WhenExerciseIdIsInvalid() {
        CreateProgramRequest request = validRequest();

        when(exerciseRepository.findAllById(anyIterable()))
                .thenReturn(List.of());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programService.createProgram(userId, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("One or more exerciseIds are invalid.", exception.getReason());
    }

    @Test
    void createProgram_ShouldThrowBadRequest_WhenWorkoutDayPositionsAreDuplicated() {
        CreateProgramRequest request = new CreateProgramRequest(
                "Starter Program",
                "Week 1 base program",
                List.of(
                        new CreateWorkoutDayRequest(
                                1,
                                "Push Day",
                                null,
                                List.of(new CreateProgramDayExerciseRequest(1L, 1, 3, 8, 10, null))
                        ),
                        new CreateWorkoutDayRequest(
                                1,
                                "Pull Day",
                                null,
                                List.of(new CreateProgramDayExerciseRequest(1L, 1, 3, 8, 10, null))
                        )
                )
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programService.createProgram(userId, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Duplicate workout day positions are not allowed.", exception.getReason());

        verifyNoInteractions(exerciseRepository);
    }

    @Test
    void createProgram_ShouldThrowBadRequest_WhenExercisePositionsAreDuplicatedWithinDay() {
        CreateProgramRequest request = new CreateProgramRequest(
                "Starter Program",
                "Week 1 base program",
                List.of(
                        new CreateWorkoutDayRequest(
                                1,
                                "Push Day",
                                null,
                                List.of(
                                        new CreateProgramDayExerciseRequest(1L, 1, 3, 8, 10, null),
                                        new CreateProgramDayExerciseRequest(1L, 1, 3, 10, 12, null)
                                )
                        )
                )
        );

        when(programRepository.findByUserIdAndActiveTrue(userId))
                .thenReturn(Optional.empty());
        when(exerciseRepository.findAllById(anyIterable()))
                .thenReturn(List.of(benchPress));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programService.createProgram(userId, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Duplicate exercise positions are not allowed within a workout day.", exception.getReason());
    }

    @Test
    void createProgram_ShouldThrowBadRequest_WhenRepRangeIsInvalid() {
        CreateProgramRequest request = new CreateProgramRequest(
                "Starter Program",
                "Week 1 base program",
                List.of(
                        new CreateWorkoutDayRequest(
                                1,
                                "Push Day",
                                null,
                                List.of(
                                        new CreateProgramDayExerciseRequest(1L, 1, 3, 12, 8, null)
                                )
                        )
                )
        );

        when(programRepository.findByUserIdAndActiveTrue(userId))
                .thenReturn(Optional.empty());
        when(exerciseRepository.findAllById(anyIterable()))
                .thenReturn(List.of(benchPress));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> programService.createProgram(userId, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("prescribedRepsMin cannot be greater than prescribedRepsMax.", exception.getReason());
    }

    private CreateProgramRequest validRequest() {
        return new CreateProgramRequest(
                "Starter Program",
                "Week 1 base program",
                List.of(
                        new CreateWorkoutDayRequest(
                                1,
                                "Push Day",
                                "Chest focus",
                                List.of(
                                        new CreateProgramDayExerciseRequest(
                                                1L,
                                                1,
                                                3,
                                                8,
                                                10,
                                                "Controlled reps"
                                        )
                                )
                        )
                )
        );
    }

    private Exercise buildExercise(Long id, String name, String muscleGroup, String equipment) {
        Exercise exercise = new Exercise();
        ReflectionTestUtils.setField(exercise, "id", id);
        exercise.setName(name);
        exercise.setMuscleGroup(muscleGroup);
        exercise.setEquipment(equipment);
        exercise.setSystem(true);
        return exercise;
    }

    private Program buildExistingProgram(UUID userId, Exercise exercise) {
        Program program = new Program();
        ReflectionTestUtils.setField(program, "id", 100L);
        program.setUserId(userId);
        program.setName("Starter Program");
        program.setDescription("Week 1 base program");
        program.setActive(true);

        WorkoutDay day = new WorkoutDay();
        ReflectionTestUtils.setField(day, "id", 200L);
        day.setPosition(1);
        day.setName("Push Day");
        day.setNotes("Chest focus");

        ProgramDayExercise dayExercise = new ProgramDayExercise();
        ReflectionTestUtils.setField(dayExercise, "id", 300L);
        dayExercise.setExercise(exercise);
        dayExercise.setPosition(1);
        dayExercise.setPrescribedSets(3);
        dayExercise.setPrescribedRepsMin(8);
        dayExercise.setPrescribedRepsMax(10);
        dayExercise.setNotes("Controlled reps");

        day.addDayExercise(dayExercise);
        program.addWorkoutDay(day);

        return program;
    }
}