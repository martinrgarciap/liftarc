package com.martin.liftarc.api.program.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.martin.liftarc.api.program.dto.ExerciseSummaryResponse;
import com.martin.liftarc.api.program.entity.Exercise;
import com.martin.liftarc.api.program.repository.ExerciseRepository;

@ExtendWith(MockitoExtension.class)
class ExerciseServiceTest {

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private ExerciseService exerciseService;

    @Test
    void getExercises_ShouldReturnMappedExerciseSummaries() {
        Exercise benchPress = buildExercise(1L, "Bench Press", "Chest", "Barbell");
        Exercise latPulldown = buildExercise(2L, "Lat Pulldown", "Back", "Cable");

        when(exerciseRepository.findAllByOrderByNameAsc())
                .thenReturn(List.of(benchPress, latPulldown));

        List<ExerciseSummaryResponse> response = exerciseService.getExercises();

        assertEquals(2, response.size());

        assertEquals(1L, response.get(0).id());
        assertEquals("Bench Press", response.get(0).name());
        assertEquals("Chest", response.get(0).muscleGroup());
        assertEquals("Barbell", response.get(0).equipment());

        assertEquals(2L, response.get(1).id());
        assertEquals("Lat Pulldown", response.get(1).name());
        assertEquals("Back", response.get(1).muscleGroup());
        assertEquals("Cable", response.get(1).equipment());
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
}