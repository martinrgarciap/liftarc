package com.martin.liftarc.api.program.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.martin.liftarc.api.program.dto.CreateProgramDayExerciseRequest;
import com.martin.liftarc.api.program.dto.CreateProgramRequest;
import com.martin.liftarc.api.program.dto.CreateWorkoutDayRequest;
import com.martin.liftarc.api.program.dto.ProgramDayExerciseResponse;
import com.martin.liftarc.api.program.dto.ProgramResponse;
import com.martin.liftarc.api.program.dto.WorkoutDayResponse;
import com.martin.liftarc.api.program.service.ProgramService;

import tools.jackson.databind.ObjectMapper;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class ProgramControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProgramService programService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void getCurrentProgram_ShouldReturn200AndResponseBody() throws Exception {
        UUID userId = UUID.randomUUID();

        ProgramResponse response = new ProgramResponse(
                1L,
                "Starter Program",
                "Week 1 base program",
                true,
                List.of(
                        new WorkoutDayResponse(
                                10L,
                                1,
                                "Push Day",
                                "Chest focus",
                                List.of(
                                        new ProgramDayExerciseResponse(
                                                100L,
                                                1L,
                                                "Bench Press",
                                                "Chest",
                                                "Barbell",
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

        when(programService.getCurrentProgram(userId)).thenReturn(response);

        mockMvc.perform(
                        get("/api/programs/current")
                                .with(jwt().jwt(jwt -> jwt.subject(userId.toString())))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Starter Program"))
                .andExpect(jsonPath("$.description").value("Week 1 base program"))
                .andExpect(jsonPath("$.isActive").value(true))
                .andExpect(jsonPath("$.workoutDays[0].id").value(10))
                .andExpect(jsonPath("$.workoutDays[0].position").value(1))
                .andExpect(jsonPath("$.workoutDays[0].name").value("Push Day"))
                .andExpect(jsonPath("$.workoutDays[0].notes").value("Chest focus"))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].id").value(100))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].exerciseId").value(1))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].exerciseName").value("Bench Press"))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].muscleGroup").value("Chest"))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].equipment").value("Barbell"))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].position").value(1))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].prescribedSets").value(3))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].prescribedRepsMin").value(8))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].prescribedRepsMax").value(10))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].notes").value("Controlled reps"));

        verify(programService).getCurrentProgram(userId);
    }

    @Test
    void createProgram_ShouldReturn201AndResponseBody() throws Exception {
        UUID userId = UUID.randomUUID();

        CreateProgramRequest request = new CreateProgramRequest(
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

        ProgramResponse response = new ProgramResponse(
                1L,
                "Starter Program",
                "Week 1 base program",
                true,
                List.of(
                        new WorkoutDayResponse(
                                10L,
                                1,
                                "Push Day",
                                "Chest focus",
                                List.of(
                                        new ProgramDayExerciseResponse(
                                                100L,
                                                1L,
                                                "Bench Press",
                                                "Chest",
                                                "Barbell",
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

        when(programService.createProgram(eq(userId), any(CreateProgramRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/programs")
                                .with(jwt().jwt(jwt -> jwt.subject(userId.toString())))
                                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Starter Program"))
                .andExpect(jsonPath("$.description").value("Week 1 base program"))
                .andExpect(jsonPath("$.isActive").value(true))
                .andExpect(jsonPath("$.workoutDays[0].name").value("Push Day"))
                .andExpect(jsonPath("$.workoutDays[0].exercises[0].exerciseName").value("Bench Press"));

        verify(programService).createProgram(eq(userId), any(CreateProgramRequest.class));
    }
}