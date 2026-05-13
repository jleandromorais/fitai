package com.fitai.fitai_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "set_data")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SetData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false) // Chave estrangeira para Exercise
    private Exercise exercise;

    private Integer reps;
    private Double weight;// Peso em kg, pode ser null para exercícios de peso corporal
    private Boolean done;
    private Double prev;// Peso da última vez que o exercício foi feito, para mostrar a evolução
}
