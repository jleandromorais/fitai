package com.fitai.fitai_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exercises")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Geração automática do ID
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)// Muitos exercícios pertencem a um treino
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    @Column(nullable = false)
    private String name;

    private String muscle;

    private Integer restSeconds;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true) // Garante que os sets sejam removidos quando o exercício for deletado
    @OrderColumn(name = "position")//   Garante a ordem dos sets dentro do exercício
    @Builder.Default // Inicializa a lista de sets como vazia por padrão
    private List<SetData> sets = new ArrayList<>();// Inicializa a lista de sets como vazia por padrão
}
