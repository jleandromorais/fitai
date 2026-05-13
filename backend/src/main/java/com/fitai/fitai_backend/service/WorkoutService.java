package com.fitai.fitai_backend.service;

import com.fitai.fitai_backend.dto.*;
import com.fitai.fitai_backend.model.*;
import com.fitai.fitai_backend.repository.UserRepository;
import com.fitai.fitai_backend.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/*
 * Imagina que o WorkoutService é o GARÇOM do restaurante.
 * O cliente (Controller) faz o pedido, o garçom (Service) vai até a cozinha
 * (banco de dados) buscar ou guardar as informações, e traz de volta pro cliente.
 */
@Service           // Fala pro Spring: "ei, esse é um garçom, guarda ele pra mim"
@RequiredArgsConstructor // Cria o construtor automaticamente com os ingredientes que precisamos
public class WorkoutService {

    // A gaveta onde ficam os treinos no banco de dados
    private final WorkoutRepository workoutRepository;

    // A gaveta onde ficam os usuários no banco de dados
    private final UserRepository userRepository;

    /*
     * LISTAR TREINOS
     * "Me dá todos os treinos que pertencem a esse email"
     * É como pedir: "me mostra todos os cadernos que têm o meu nome na capa"
     */
    public List<WorkoutDto> listByUser(String email) {
        return workoutRepository.findAllByUserEmail(email)
                .stream()
                .map(this::toDto) // Converte cada treino do banco para o formato que o app entende
                .toList();
    }

    /*
     * BUSCAR UM TREINO ESPECÍFICO
     * "Me dá o treino de número X, mas só se ele pertencer a esse email"
     * É como pedir: "me dá o caderno número 5, mas só se tiver meu nome nele"
     * Se não achar, grita um erro: "Treino não encontrado!"
     */
    public WorkoutDto getById(Long id, String email) {
        Workout w = workoutRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new IllegalArgumentException("Treino não encontrado."));
        return toDto(w);
    }

    /*
     * CRIAR TREINO
     * @Transactional = "faz tudo isso junto ou não faz nada"
     * É como construir uma casa: ou você constrói ela inteira, ou não começa.
     * Se der erro no meio, desfaz tudo para não ficar pela metade.
     */
    @Transactional
    public WorkoutDto create(WorkoutRequest req, String email) {

        // Primeiro verifica se o usuário existe. Se não existir, erro.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        // Monta o treino como uma caixa vazia com nome, código (A/B/C), dias e tags
        Workout workout = Workout.builder()
                .user(user)
                .name(req.getName())
                .code(req.getCode())
                .schedule(req.getSchedule())
                .tags(req.getTags() != null ? req.getTags() : List.of()) // Se não tiver tags, usa lista vazia
                .build();

        // Se o treino tiver exercícios, adiciona um por um dentro da caixa
        if (req.getExercises() != null) {
            for (ExerciseDto eDto : req.getExercises()) {

                // Para cada exercício, cria uma "ficha" com nome, músculo e tempo de descanso
                Exercise exercise = Exercise.builder()
                        .workout(workout)   // Liga o exercício ao treino pai
                        .name(eDto.getName())
                        .muscle(eDto.getMuscle())
                        .restSeconds(eDto.getRestSeconds())
                        .build();

                // Se o exercício tiver séries, adiciona uma por uma na ficha
                if (eDto.getSets() != null) {
                    for (SetDataDto sDto : eDto.getSets()) {

                        // Cada série tem: quantas repetições, quanto peso, se foi feita, e o peso da vez anterior
                        SetData set = SetData.builder()
                                .exercise(exercise) // Liga a série ao exercício pai
                                .reps(sDto.getReps())
                                .weight(sDto.getWeight())
                                .done(sDto.getDone() != null ? sDto.getDone() : false) // Se não informar, considera não feita
                                .prev(sDto.getPrev())
                                .build();

                        exercise.getSets().add(set); // Coloca a série dentro do exercício
                    }
                }
                workout.getExercises().add(exercise); // Coloca o exercício dentro do treino
            }
        }

        // Salva tudo no banco e devolve o treino no formato que o app entende
        return toDto(workoutRepository.save(workout));
    }

    /*
     * DELETAR TREINO
     * Verifica se o treino existe E pertence ao usuário antes de apagar.
     * Não deixa apagar treino dos outros!
     */
    @Transactional
    public void delete(Long id, String email) {
        Workout w = workoutRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new IllegalArgumentException("Treino não encontrado."));
        workoutRepository.delete(w);
    }

    /*
     * CONVERSOR (mapper): Workout → WorkoutDto
     *
     * O banco guarda as informações num formato "pesado" (com todas as relações).
     * O app precisa de um formato "leve" (só o que precisa mostrar na tela).
     * Esse método faz essa tradução, como um tradutor entre dois idiomas.
     *
     * Ele também calcula na hora:
     * - totalSets  = soma de todas as séries de todos os exercícios
     * - volume     = soma de (peso × reps) de cada série — quanto você levantou no total
     * - duration   = estimativa de duração (cada série leva ~3 min com descanso)
     */
    private WorkoutDto toDto(Workout w) {

        // Converte cada exercício do banco para o formato leve
        List<ExerciseDto> exercises = w.getExercises().stream().map(e -> {

            // Converte cada série para o formato leve
            List<SetDataDto> sets = e.getSets().stream().map(s ->
                SetDataDto.builder()
                    .id(s.getId())
                    .reps(s.getReps())
                    .weight(s.getWeight())
                    .done(s.getDone())
                    .prev(s.getPrev())
                    .build()
            ).toList();

            return ExerciseDto.builder()
                    .id(e.getId())
                    .name(e.getName())
                    .muscle(e.getMuscle())
                    .restSeconds(e.getRestSeconds())
                    .sets(sets)
                    .build();
        }).toList();

        // Conta o total de séries: soma o tamanho da lista de séries de cada exercício
        int totalSets = exercises.stream().mapToInt(e -> e.getSets().size()).sum();

        // Calcula o volume total: peso × reps de cada série, somados
        // Ex: 3 séries de 10 reps com 60kg = 1800kg de volume
        double volume = exercises.stream()
                .flatMap(e -> e.getSets().stream())
                .mapToDouble(s -> (s.getWeight() != null ? s.getWeight() : 0)
                                * (s.getReps() != null ? s.getReps() : 0))
                .sum();

        // Monta o DTO final com tudo calculado
        return WorkoutDto.builder()
                .id(w.getId())
                .name(w.getName())
                .code(w.getCode())
                .schedule(w.getSchedule())
                .tags(w.getTags())
                .exercises(exercises)
                .totalSets(totalSets)
                .volume(Math.round(volume * 10.0) / 10.0) // Arredonda para 1 casa decimal
                .duration(totalSets * 3)                   // Estimativa: 3 minutos por série
                .build();
    }
}
