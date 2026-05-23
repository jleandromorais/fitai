package com.fitai.fitai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SessionHistoryDto {
    private Long          workoutId;
    private String        workoutName;
    private String        workoutCode;
    private LocalDateTime executedAt;
    private Integer       durationMinutes;
    private Integer       setsCompleted;
    private Double        totalVolume;
}
