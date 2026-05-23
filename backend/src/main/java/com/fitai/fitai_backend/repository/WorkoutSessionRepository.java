package com.fitai.fitai_backend.repository;

import com.fitai.fitai_backend.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    List<WorkoutSession> findAllByUserEmailAndExecutedAtAfterOrderByExecutedAtDesc(
            String email, LocalDateTime after);
}
