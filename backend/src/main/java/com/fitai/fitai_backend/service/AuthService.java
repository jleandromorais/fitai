package com.fitai.fitai_backend.service;

import com.fitai.fitai_backend.dto.AuthResponse;
import com.fitai.fitai_backend.dto.GoogleAuthRequest;
import com.fitai.fitai_backend.dto.LoginRequest;
import com.fitai.fitai_backend.dto.RefreshRequest;
import com.fitai.fitai_backend.dto.RegisterRequest;
import com.fitai.fitai_backend.model.User;
import com.fitai.fitai_backend.repository.UserRepository;
import com.fitai.fitai_backend.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Credenciais inválidas.");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getIdToken());

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .name(name)
                                .email(email)
                                .googleId(googleId)
                                .build()
                ));

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
        }

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        // Busca o usuário pelo refresh token armazenado
        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido."));

        if (user.getRefreshTokenExpiry() == null || Instant.now().isAfter(user.getRefreshTokenExpiry())) {
            // Invalida o token expirado para forçar novo login
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new BadCredentialsException("Refresh token expirado. Faça login novamente.");
        }

        return buildAuthResponse(user);
    }

    // Gera access token + refresh token, persiste o refresh e retorna o AuthResponse
    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken();

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(jwtUtil.refreshTokenExpiry());
        userRepository.save(user);

        return new AuthResponse(accessToken, refreshToken, user.getName(), user.getEmail());
    }
}