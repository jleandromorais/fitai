package com.fitai.fitai_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

// Componente Spring responsável por gerar, validar e extrair informações de tokens JWT e refresh tokens
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expiration;
    private final long refreshExpiration;
    private final SecureRandom secureRandom = new SecureRandom();

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration,
            @Value("${jwt.refresh-expiration}") long refreshExpiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
        this.refreshExpiration = refreshExpiration;
    }

    public long getRefreshExpirationSeconds() {
        return refreshExpiration / 1000;
    }

    // Gera um refresh token opaco aleatório de 48 bytes (URL-safe Base64)
    public String generateRefreshToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public Instant refreshTokenExpiry() {
        return Instant.now().plusSeconds(getRefreshExpirationSeconds());
    }

    // Gera um token JWT assinado com o e-mail do usuário como subject
    // NOTA: o payload do JWT é apenas Base64, não criptografado — evite colocar dados sensíveis
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)                                               // Identifica o dono do token
                .issuedAt(new Date())                                         // Momento de emissão
                .expiration(new Date(System.currentTimeMillis() + expiration)) // Momento de expiração
                .signWith(key)                                                // Assina com HMAC-SHA256
                .compact();
    }

    // Extrai o e-mail (subject) de um token JWT válido
    // ATENÇÃO: lança JwtException se o token for inválido ou expirado — chame isValid() antes se necessário
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(key)         // Configura a chave para verificar a assinatura
                .build()
                .parseSignedClaims(token) // Valida assinatura e expiração, lança exceção se inválido
                .getPayload()
                .getSubject();           // Retorna o subject (e-mail)
    }

    // Verifica se o token é válido (assinatura correta e não expirado)
    // Captura JwtException, que cobre: expiração, assinatura inválida, token malformado, etc.
    public boolean isValid(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            // Token inválido por qualquer motivo — não relança para não vazar detalhes internos
            return false;
        }
    }
}
