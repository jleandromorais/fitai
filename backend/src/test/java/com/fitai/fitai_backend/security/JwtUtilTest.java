package com.fitai.fitai_backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {

    private static final String SECRET             = "test-secret-key-with-at-least-32-chars!!";
    private static final long   EXPIRATION         = 86_400_000L;
    private static final long   REFRESH_EXPIRATION = 604_800_000L;

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION, REFRESH_EXPIRATION);
    }

    @Test
    void generateToken_deveRetornarTokenNaoNulo() {
        String token = jwtUtil.generateToken("user@test.com");
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void extractEmail_deveRetornarEmailCorreto() {
        String token = jwtUtil.generateToken("user@test.com");
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("user@test.com");
    }

    @Test
    void isValid_tokenValido_deveRetornarTrue() {
        String token = jwtUtil.generateToken("user@test.com");
        assertThat(jwtUtil.isValid(token)).isTrue();
    }

    @Test
    void isValid_tokenMalformado_deveRetornarFalse() {
        assertThat(jwtUtil.isValid("token.invalido.qualquer")).isFalse();
    }

    @Test
    void isValid_tokenVazio_deveRetornarFalse() {
        assertThat(jwtUtil.isValid("")).isFalse();
    }

    @Test
    void isValid_tokenExpirado_deveRetornarFalse() throws InterruptedException {
        JwtUtil shortLived = new JwtUtil(SECRET, 1L, REFRESH_EXPIRATION);
        String token = shortLived.generateToken("user@test.com");
        Thread.sleep(10);
        assertThat(shortLived.isValid(token)).isFalse();
    }

    @Test
    void generateRefreshToken_deveRetornarTokenUnicoACadaChamada() {
        String t1 = jwtUtil.generateRefreshToken();
        String t2 = jwtUtil.generateRefreshToken();
        assertThat(t1).isNotBlank();
        assertThat(t2).isNotBlank();
        assertThat(t1).isNotEqualTo(t2);
    }

    @Test
    void refreshTokenExpiry_deveSerFuturo() {
        Instant expiry = jwtUtil.refreshTokenExpiry();
        assertThat(expiry).isAfter(Instant.now());
    }

    @Test
    void getRefreshExpirationSeconds_deveConverterCorretamente() {
        assertThat(jwtUtil.getRefreshExpirationSeconds()).isEqualTo(604_800L);
    }
}
