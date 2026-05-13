package com.fitai.fitai_backend.repository;

import com.fitai.fitai_backend.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findAllByUserEmail(String email);
    Optional<Workout> findByIdAndUserEmail(Long id, String email);
}
