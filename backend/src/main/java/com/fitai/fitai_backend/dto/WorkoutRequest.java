package com.fitai.fitai_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class WorkoutRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String code;
    private String schedule;
    private List<String> tags;
    private List<ExerciseDto> exercises;
}
