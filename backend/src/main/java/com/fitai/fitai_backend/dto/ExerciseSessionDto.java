package com.fitai.fitai_backend.dto;

import lombok.Data;
import java.util.List;

/**
 * Representa um exercício executado durante a sessão.
 * Agrupa todas as séries realizadas para aquele exercício.
 */
@Data
public class ExerciseSessionDto {
    private Long             exerciseId; // ID do Exercise no banco
    private List<SetSessionDto> sets;    // séries executadas
}
