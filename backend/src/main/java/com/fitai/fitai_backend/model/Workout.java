package com.fitai.fitai_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workouts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 2)
    private String code;

    private String schedule; // Ex: "Segunda, Quarta e Sexta"

    @ElementCollection
    @CollectionTable(name = "workout_tags", joinColumns = @JoinColumn(name = "workout_id")) // Tabela para armazenar as tags
    @Column(name = "tag")
    @Builder.Default // Inicializa a lista de tags como vazia por padrão
    private List<String> tags = new ArrayList<>();

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "position") // Garante a ordem dos exercícios
    @Builder.Default // Inicializa a lista de exercícios como vazia por padrão
    private List<Exercise> exercises = new ArrayList<>();
}
