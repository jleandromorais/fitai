package com.fitai.fitai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SetDataDto {
    private Long id;
    private Integer reps;
    private Double weight;
    private Boolean done;
    private Double prev;
}
