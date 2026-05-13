package com.fitai.fitai_backend.controller;

import com.fitai.fitai_backend.dto.WorkoutDto;
import com.fitai.fitai_backend.dto.WorkoutRequest;
import com.fitai.fitai_backend.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    public ResponseEntity<List<WorkoutDto>> list(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(workoutService.listByUser(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutDto> get(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(workoutService.getById(id, user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<WorkoutDto> create(@Valid @RequestBody WorkoutRequest req,
                                             @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(workoutService.create(req, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails user) {
        workoutService.delete(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
