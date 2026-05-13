package com.fitai.fitai_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class GoogleAuthRequest {

    @NotBlank
    private String idToken; // Token de ID retornado pelo Google após autenticação no frontend
}
