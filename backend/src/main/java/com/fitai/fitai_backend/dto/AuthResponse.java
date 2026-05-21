package com.fitai.fitai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String name;
    private String email;
}
