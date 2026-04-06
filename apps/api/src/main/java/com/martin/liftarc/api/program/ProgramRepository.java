package com.martin.liftarc.api.program;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.martin.liftarc.api.program.entity.Program;

public interface ProgramRepository extends JpaRepository<Program, Long> {

    Optional<Program> findByUserIdAndActiveTrue(UUID userId);
}