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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository      userRepository;
    private final PasswordEncoder     passwordEncoder;
    private final JwtUtil             jwtUtil;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthResponse register(RegisterRequest request) {
        log.info("Tentativa de registro: email={}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registro recusado — email já cadastrado: {}", request.getEmail());
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        log.info("Usuário registrado com sucesso: email={}", user.getEmail());
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Tentativa de login: email={}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login falhou — email não encontrado: {}", request.getEmail());
                    return new BadCredentialsException("Credenciais inválidas.");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login falhou — senha incorreta: email={}", request.getEmail());
            throw new BadCredentialsException("Credenciais inválidas.");
        }

        log.info("Login bem-sucedido: email={}", user.getEmail());
        return buildAuthResponse(user);
    }

    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        log.info("Tentativa de login via Google");

        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getIdToken());

        String googleId = payload.getSubject();
        String email    = payload.getEmail();
        String name     = (String) payload.get("name");

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> {
                    log.info("Novo usuário via Google: email={}", email);
                    return userRepository.save(User.builder()
                            .name(name).email(email).googleId(googleId).build());
                });

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
        }

        log.info("Login Google bem-sucedido: email={}", email);
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        log.debug("Tentativa de refresh token");

        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> {
                    log.warn("Refresh falhou — token não encontrado");
                    return new BadCredentialsException("Refresh token inválido.");
                });

        if (user.getRefreshTokenExpiry() == null || Instant.now().isAfter(user.getRefreshTokenExpiry())) {
            log.warn("Refresh falhou — token expirado: email={}", user.getEmail());
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new BadCredentialsException("Refresh token expirado. Faça login novamente.");
        }

        log.info("Refresh token renovado: email={}", user.getEmail());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtUtil.generateToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken();

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(jwtUtil.refreshTokenExpiry());
        userRepository.save(user);

        return new AuthResponse(accessToken, refreshToken, user.getName(), user.getEmail());
    }
}
