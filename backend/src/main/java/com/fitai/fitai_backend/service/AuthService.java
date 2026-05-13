package com.fitai.fitai_backend.service;

import com.fitai.fitai_backend.dto.AuthResponse;
import com.fitai.fitai_backend.dto.GoogleAuthRequest;
import com.fitai.fitai_backend.dto.LoginRequest;
import com.fitai.fitai_backend.dto.RegisterRequest;
import com.fitai.fitai_backend.model.User;
import com.fitai.fitai_backend.repository.UserRepository;
import com.fitai.fitai_backend.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service 
@RequiredArgsConstructor    

public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthResponse register(RegisterRequest request){
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getName(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Credenciais inválidas.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getName(), user.getEmail());
    }

    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        // Valida o idToken com o Google e extrai os dados do usuário
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getIdToken());

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        // Busca usuário existente pelo googleId ou pelo email, ou cria um novo
        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .name(name)
                                .email(email)
                                .googleId(googleId)
                                .build()
                ));

        // Se o usuário já existia pelo email mas ainda não tem googleId vinculado, vincula agora
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getName(), user.getEmail());
    }
}