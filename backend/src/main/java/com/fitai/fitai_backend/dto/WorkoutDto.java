package com.fitai.fitai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkoutDto {
    private Long id;
    private String name;
    private String code;
    private String schedule;
    private List<String> tags;
    private List<ExerciseDto> exercises;

    // Campos calculados
    private Integer duration;
    private Integer totalSets;
    private Double volume;
    private String lastDone;
}
