package com.fitai.fitai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Resposta ao finalizar uma sessão.
 * Devolve um resumo simples para o frontend mostrar no ecrã de conclusão.
 */
@Data
@AllArgsConstructor
public class SessionResponse {
    private Integer setsCompleted;    // total de séries marcadas como feitas
    private Double  totalVolume;      // volume total em kg (peso × reps de cada série feita)
    private Integer durationMinutes;  // duração real da sessão
}
